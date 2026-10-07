// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ITapeOutProcessor {
    function eval(uint256 circuitId, bytes calldata input) external view returns (bytes memory);
    function netlist(uint256 circuitId) external view returns (bytes memory);
}

/// @notice Curated policy references, not a collateral or slashing system.
/// @dev Owner can register and irreversibly disable policies. Anyone can report
/// an actual netlist change against the stored hash. Processor upgrades remain a
/// separate trust boundary: an unchanged netlist does not prove unchanged execution.
contract PolicyRegistry {
    struct Policy {
        uint256 circuitId;
        address author;
        bool active;
        string name;
        bytes32 netlistHash;
    }

    ITapeOutProcessor public immutable processor;
    address public immutable owner;
    uint256 public nextPolicyId;
    mapping(uint256 => Policy) private policies;

    error Unauthorized();
    error InvalidProcessor();
    error UnknownPolicy();
    error InvalidPolicy();
    error NotTampered();

    event PolicyRegistered(uint256 indexed policyId, uint256 indexed circuitId, bytes32 netlistHash, string name);
    event PolicyDisabled(uint256 indexed policyId);
    event TamperReported(uint256 indexed policyId, bytes32 expectedHash, bytes32 actualHash);

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    constructor(address processor_) {
        if (processor_.code.length == 0) revert InvalidProcessor();
        processor = ITapeOutProcessor(processor_);
        owner = msg.sender;
    }

    function registerPolicy(uint256 circuitId, string calldata name) external onlyOwner returns (uint256 id) {
        bytes memory netlist = processor.netlist(circuitId);
        if (netlist.length == 0 || bytes(name).length == 0 || bytes(name).length > 128) revert InvalidPolicy();
        id = nextPolicyId++;
        bytes32 hash = keccak256(netlist);
        policies[id] = Policy(circuitId, msg.sender, true, name, hash);
        emit PolicyRegistered(id, circuitId, hash, name);
    }

    function getPolicy(uint256 policyId) external view returns (Policy memory) {
        if (policyId >= nextPolicyId) revert UnknownPolicy();
        return policies[policyId];
    }

    /// @notice Explicit administrative stop. No reactivation or policy editing.
    /// @dev This can stop withdrawals of a vault pinned to the policy; it is NOT
    /// an immutable/no-admin guarantee. Deployment governance must be reviewed.
    function disablePolicy(uint256 policyId) external onlyOwner {
        if (policyId >= nextPolicyId) revert UnknownPolicy();
        if (!policies[policyId].active) revert InvalidPolicy();
        policies[policyId].active = false;
        emit PolicyDisabled(policyId);
    }

    function reportTamper(uint256 policyId) external {
        if (policyId >= nextPolicyId) revert UnknownPolicy();
        Policy storage p = policies[policyId];
        if (!p.active) revert InvalidPolicy();
        bytes32 actualHash = keccak256(processor.netlist(p.circuitId));
        if (actualHash == p.netlistHash) revert NotTampered();
        p.active = false;
        emit TamperReported(policyId, p.netlistHash, actualHash);
    }

    // No bond accounting, slashPolicy, token escrow, or automatic revenue share.
    // These were unimplemented claims in the earlier prototype and are removed.
}
