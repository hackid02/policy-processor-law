// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title PolicyRegistry - Bonding/Slashing + 25% Revenue for Policy Processor (LAW)
/// @notice Every circuit is a vault policy. Author bonds LAW, slashable if counterexample found. 25% mint proceeds to authors.
/// @dev No OKB needed to compile/test, only for deploy

interface ITapeOutProcessor {
    function eval(uint256 circuitId, bytes calldata input) external view returns (bytes memory);
    function netlist(uint256 circuitId) external view returns (bytes memory);
}

contract PolicyRegistry {
    struct Policy {
        uint256 circuitId;
        address author;
        uint256 bond;
        bool active;
        string name;
        bytes32 netlistHash;
        uint256 createdAt;
    }

    mapping(uint256 => Policy) public policies;
    mapping(address => uint256) public authorRewards;
    mapping(address => uint256) public authorPolicyCount;
    
    uint256 public nextPolicyId;
    address public processor;
    address public owner;
    uint256 public totalBonds;
    
    event PolicyRegistered(uint256 indexed policyId, uint256 circuitId, address author, uint256 bond, string name);
    event PolicySlashed(uint256 indexed policyId, address challenger, bytes counterexample, uint256 bond);
    event RewardNotified(address indexed author, uint256 amount);
    event TamperReported(uint256 indexed circuitId, bytes32 expectedHash, bytes32 actualHash);

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    constructor(address _processor) {
        processor = _processor;
        owner = msg.sender;
    }

    /// @notice Register policy with bond (bond is LAW transistor amount, tracked off-chain for MVP, on-chain ERC1155 for full)
    function registerPolicy(uint256 circuitId, uint256 bond, string calldata name) external {
        require(bond >= 100, "min bond 100");
        // In full version, transfer ERC1155 LAW from author to registry
        // For MVP, just track bond amount (no ERC1155 transfer to save gas for demo)
        bytes memory netlist = ITapeOutProcessor(processor).netlist(circuitId);
        bytes32 hash = keccak256(netlist);
        
        policies[nextPolicyId] = Policy({
            circuitId: circuitId,
            author: msg.sender,
            bond: bond,
            active: true,
            name: name,
            netlistHash: hash,
            createdAt: block.timestamp
        });
        
        authorPolicyCount[msg.sender]++;
        totalBonds += bond;
        
        emit PolicyRegistered(nextPolicyId, circuitId, msg.sender, bond, name);
        nextPolicyId++;
    }

    /// @notice Anyone can slash policy by submitting counterexample that proves safety envelope violation
    /// @dev Safety envelope: "Riskier input never gets softer verdict" - monotonicity
    /// For MVP, challenger provides counterexample bytes, we just deactivate (in full, verify via eval)
    function slashPolicy(uint256 policyId, bytes calldata counterexample) external {
        Policy storage p = policies[policyId];
        require(p.active, "already inactive");
        require(p.author != msg.sender, "cannot slash own");
        
        // In full version, verify counterexample via processor.eval()
        // Example: eval(circuitId, counterexample) returns unexpected value
        // For MVP, trust challenger (with bond to prevent spam in full version)
        
        p.active = false;
        totalBonds -= p.bond;
        
        // Transfer bond to challenger (in full version, ERC1155 transfer)
        // For MVP, just track (no transfer to save gas)
        
        emit PolicySlashed(policyId, msg.sender, counterexample, p.bond);
    }

    /// @notice Report tamper if netlist hash changed (mitigates upgradeable beacon risk)
    function reportTamper(uint256 circuitId, bytes32 expectedHash) external {
        bytes memory netlist = ITapeOutProcessor(processor).netlist(circuitId);
        bytes32 actualHash = keccak256(netlist);
        require(actualHash != expectedHash, "not tampered");
        
        // Find and deactivate all policies using this circuit
        for (uint256 i = 0; i < nextPolicyId; i++) {
            if (policies[i].circuitId == circuitId && policies[i].active) {
                policies[i].active = false;
            }
        }
        
        emit TamperReported(circuitId, expectedHash, actualHash);
    }

    /// @notice 25% of mint proceeds to authors - called by processor withdraw hook or owner
    function notifyReward(address author) external payable {
        require(msg.value > 0, "no value");
        authorRewards[author] += msg.value;
        emit RewardNotified(author, msg.value);
    }

    function withdrawReward() external {
        uint256 amount = authorRewards[msg.sender];
        require(amount > 0, "no reward");
        authorRewards[msg.sender] = 0;
        (bool ok, ) = msg.sender.call{value: amount}("");
        require(ok, "transfer failed");
    }

    // View helpers for frontend
    function getPolicy(uint256 policyId) external view returns (Policy memory) {
        return policies[policyId];
    }

    function getActivePolicies() external view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < nextPolicyId; i++) {
            if (policies[i].active) count++;
        }
        uint256[] memory active = new uint256[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < nextPolicyId; i++) {
            if (policies[i].active) {
                active[idx] = i;
                idx++;
            }
        }
        return active;
    }
}
