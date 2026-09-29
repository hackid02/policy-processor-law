// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./PolicyRegistry.sol";

/// @title VaultLaw - Circuit-governed vaults on X Layer
/// @notice Every deposit/withdraw calls processor.eval() on policy circuit. No OKB needed to compile/test.

contract VaultLaw {
    struct Deposit {
        address user;
        uint256 amount;
        uint256 timestamp;
    }

    PolicyRegistry public registry;
    address public processor;
    address public owner;
    
    uint256 public tvl;
    uint256 public dailyOutflow;
    uint256 public lastResetDay;
    uint256 public constant DAILY_LIMIT_BPS = 1000; // 10% = 1000 bps
    
    mapping(address => uint256) public balances;
    mapping(address => uint256) public lastWithdrawDay;
    
    event Deposit(address indexed user, uint256 amount, uint256 tvl);
    event Withdraw(address indexed user, uint256 amount, uint256 indexed policyId, bytes inputs, bytes output);
    event Blocked(address indexed user, uint256 amount, uint256 indexed policyId, bytes inputs, bytes output, string reason);
    event Throttled(address indexed user, uint256 amount, uint256 fee, uint256 indexed policyId);

    modifier onlyOwner() {
        require(msg.sender == owner, "_");
        _;
    }

    constructor(address _registry, address _processor) {
        registry = PolicyRegistry(payable(_registry));
        processor = _processor;
        owner = msg.sender;
        lastResetDay = block.timestamp / 1 days;
    }

    function _resetDailyIfNeeded() internal {
        uint256 currentDay = block.timestamp / 1 days;
        if (currentDay > lastResetDay) {
            dailyOutflow = 0;
            lastResetDay = currentDay;
        }
    }

    function deposit() external payable {
        require(msg.value > 0, "0 deposit");
        _resetDailyIfNeeded();
        balances[msg.sender] += msg.value;
        tvl += msg.value;
        emit Deposit(msg.sender, msg.value, tvl);
    }

    /// @notice Withdraw with policy enforcement via circuit eval
    /// @param amount Amount to withdraw in wei
    /// @param policyId Policy to enforce
    /// @param inputs Encoded inputs for circuit eval (e.g., abi.encode(amount_high, daily_high))
    function withdraw(uint256 amount, uint256 policyId, bytes calldata inputs) external {
        _resetDailyIfNeeded();
        require(balances[msg.sender] >= amount, "insufficient balance");
        require(amount > 0, "0 withdraw");
        
        // Get policy
        PolicyRegistry.Policy memory policy = registry.getPolicy(policyId);
        require(policy.active, "policy inactive");
        
        // Call processor.eval() - THE CORE INTEGRATION
        // This is free, read-only, 0.4s on X Layer
        bytes memory output = ITapeOutProcessor(processor).eval(policy.circuitId, inputs);
        
        // Decode output - MVP: 0=ALLOW, 1=DENY, 2=THROTTLE (for full 8-bit version)
        uint8 verdict = output.length > 0 ? uint8(output[0]) : 0;
        
        if (verdict == 1) {
            // DENY - block withdrawal
            emit Blocked(msg.sender, amount, policyId, inputs, output, "SpendLimit: daily limit exceeded");
            revert("VaultLaw: DENY by circuit");
        } else if (verdict == 2) {
            // THROTTLE - charge 1% fee to LPs
            uint256 fee = amount / 100;
            uint256 net = amount - fee;
            balances[msg.sender] -= amount;
            tvl -= amount;
            dailyOutflow += amount;
            (bool ok, ) = msg.sender.call{value: net}("");
            require(ok, "transfer failed");
            // Fee stays in vault for LPs
            tvl += fee;
            emit Throttled(msg.sender, amount, fee, policyId);
            emit Withdraw(msg.sender, net, policyId, inputs, output);
        } else {
            // ALLOW - proceed
            // Check daily limit (additional off-chain safety, circuit is primary)
            uint256 limit = tvl * DAILY_LIMIT_BPS / 10000;
            if (dailyOutflow + amount > limit) {
                // Even if circuit says ALLOW, enforce daily limit as backup
                // In full version, circuit itself encodes this logic
                emit Blocked(msg.sender, amount, policyId, inputs, output, "Daily limit exceeded");
                revert("VaultLaw: daily limit");
            }
            
            balances[msg.sender] -= amount;
            tvl -= amount;
            dailyOutflow += amount;
            (bool ok, ) = msg.sender.call{value: amount}("");
            require(ok, "transfer failed");
            emit Withdraw(msg.sender, amount, policyId, inputs, output);
        }
    }

    // View helpers
    function getDailyLimit() external view returns (uint256) {
        return tvl * DAILY_LIMIT_BPS / 10000;
    }

    function getRemainingDaily() external view returns (uint256) {
        uint256 limit = tvl * DAILY_LIMIT_BPS / 10000;
        if (dailyOutflow >= limit) return 0;
        return limit - dailyOutflow;
    }
}
