// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./PolicyRegistry.sol";

/// @notice Reference vault with a FIXED GLOBAL limit per UTC calendar day.
/// @dev NEW, un-audited reference implementation. Not deployed by this patch.
/// A pinned AND circuit receives bit0=projectedOutflowExceedsLimit, bit1=1.
/// The vault derives the numeric predicate itself and independently enforces it.
/// Quorum/Mood/DeadMan playgrounds are NOT wallet authentication in this vault.
contract VaultLaw {
    PolicyRegistry public immutable registry;
    ITapeOutProcessor public immutable processor;
    uint256 public immutable policyId;
    uint256 public immutable circuitId;
    bytes32 public immutable expectedNetlistHash;
    uint256 public immutable dailyLimit;

    uint256 public tvl;
    uint256 public dailyOutflow;
    uint256 public lastResetDay;
    mapping(address => uint256) public balances;
    uint256 private entered = 1;

    error InvalidConfiguration();
    error InvalidCircuit();
    error PolicyUnavailable();
    error NetlistChanged();
    error InvalidOutput();
    error DailyLimitExceeded();
    error CircuitDenied();
    error ZeroAmount();
    error InsufficientBalance();
    error Reentrancy();
    error TransferFailed();

    event Deposited(address indexed user, uint256 amount, uint256 tvl);
    event Withdrawn(address indexed user, uint256 amount, uint256 indexed policyId, bytes inputs, bytes output);

    modifier nonReentrant() {
        if (entered != 1) revert Reentrancy();
        entered = 2;
        _;
        entered = 1;
    }

    constructor(address registry_, uint256 policyId_, uint256 dailyLimit_) {
        if (registry_.code.length == 0 || dailyLimit_ == 0) revert InvalidConfiguration();
        registry = PolicyRegistry(registry_);
        ITapeOutProcessor proc = registry.processor();
        PolicyRegistry.Policy memory p = registry.getPolicy(policyId_);
        if (!p.active) revert InvalidConfiguration();
        if (keccak256(proc.netlist(p.circuitId)) != p.netlistHash) revert NetlistChanged();
        // A Quorum circuit uses 1=PASS; it cannot be substituted for a deny circuit.
        // Validate the pinned circuit's full two-input AND truth table at creation.
        for (uint8 i = 0; i < 4; i++) {
            bytes memory output = proc.eval(p.circuitId, abi.encodePacked(i));
            if (output.length != 1 || uint8(output[0]) != (i == 3 ? 1 : 0)) revert InvalidCircuit();
        }
        processor = proc;
        policyId = policyId_;
        circuitId = p.circuitId;
        expectedNetlistHash = p.netlistHash;
        dailyLimit = dailyLimit_;
        lastResetDay = block.timestamp / 1 days;
    }

    function _resetDailyIfNeeded() private {
        uint256 today = block.timestamp / 1 days;
        if (today != lastResetDay) {
            lastResetDay = today;
            dailyOutflow = 0;
        }
    }

    function deposit() external payable nonReentrant {
        if (msg.value == 0) revert ZeroAmount();
        _resetDailyIfNeeded();
        balances[msg.sender] += msg.value;
        tvl += msg.value;
        emit Deposited(msg.sender, msg.value, tvl);
    }

    /// @notice No caller-selected policy or caller-supplied risk flags.
    function withdraw(uint256 amount) external nonReentrant {
        if (amount == 0) revert ZeroAmount();
        if (balances[msg.sender] < amount) revert InsufficientBalance();
        _resetDailyIfNeeded();
        PolicyRegistry.Policy memory p = registry.getPolicy(policyId);
        if (!p.active || p.circuitId != circuitId || p.netlistHash != expectedNetlistHash) revert PolicyUnavailable();
        if (keccak256(processor.netlist(circuitId)) != expectedNetlistHash) revert NetlistChanged();

        // Avoid overflow in projected sum, with the exact boundary permitted.
        bool overLimit = amount > dailyLimit || dailyOutflow > dailyLimit - amount;
        bytes memory input = abi.encodePacked(uint8(overLimit ? 3 : 2));
        bytes memory output = processor.eval(circuitId, input);
        // Reverting eval calls propagate. No local-success fallback or empty=ALLOW.
        if (output.length != 1 || uint8(output[0]) > 1) revert InvalidOutput();
        // Defense in depth: an upgraded or malfunctioning processor cannot approve
        // a request that exceeds this vault's fixed daily budget.
        if (overLimit) revert DailyLimitExceeded();
        if (uint8(output[0]) == 1) revert CircuitDenied();

        balances[msg.sender] -= amount;
        tvl -= amount;
        dailyOutflow += amount;
        (bool ok,) = msg.sender.call{value: amount}("");
        if (!ok) revert TransferFailed();
        emit Withdrawn(msg.sender, amount, policyId, input, output);
        // Denied transactions revert: their logs do not persist. No Blocked
        // event is advertised as a receipt for a failed withdrawal.
    }

    function getRemainingDaily() external view returns (uint256) {
        uint256 spent = block.timestamp / 1 days == lastResetDay ? dailyOutflow : 0;
        return spent >= dailyLimit ? 0 : dailyLimit - spent;
    }
}
