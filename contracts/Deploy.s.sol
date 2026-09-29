// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Foundry script to deploy Policy Processor on X Layer
// Factory: 0x1f09daefa827f02cbb40967cc91b259763760761
// ChainID: 196
// Usage: forge script script/Deploy.s.sol --rpc-url https://xlayerrpc.okx.com --account <account> --broadcast

interface ITapeOutFactory {
    function createCPU(string calldata name, string calldata symbol, string calldata story, uint256 totalSupply, uint256 mintPriceWei) external returns (address processor);
    function cpuCount() external view returns (uint256);
    function cpuAt(uint256 index) external view returns (address);
}

contract DeployPolicyProcessor {
    ITapeOutFactory constant FACTORY = ITapeOutFactory(0x1f09daefa827f02cbb40967cc91b259763760761);
    
    // Policy Processor params - DO NOT CHANGE AFTER DEPLOY (immutable)
    string constant NAME = "Policy Processor";
    string constant SYMBOL = "LAW";
    string constant STORY = "LAW: transistors for circuit-governed vaults. Fixed cap 2.3M, price 0.000066 OKB immutable. Use: tape out risk-policy circuits (withdraw guard, spend limit, quorum) that vaults enforce via eval(). 25% of creator mint proceeds streamed to policy authors via PolicyRegistry.";
    uint256 constant SUPPLY = 2300000;
    uint256 constant PRICE_WEI = 66000000000000; // 0.000066 OKB

    function run() external returns (address processor) {
        processor = FACTORY.createCPU(NAME, SYMBOL, STORY, SUPPLY, PRICE_WEI);
    }
}

// Minimal PolicyRegistry for bonding/slashing (to be deployed after processor)
contract PolicyRegistry {
    struct Policy {
        uint256 circuitId;
        address author;
        uint256 bond;
        bool active;
        string name;
    }
    
    mapping(uint256 => Policy) public policies;
    mapping(address => uint256) public authorRewards;
    uint256 public nextPolicyId;
    address public processor;
    address public owner;
    
    event PolicyRegistered(uint256 indexed policyId, uint256 circuitId, address author, uint256 bond);
    event PolicySlashed(uint256 indexed policyId, address challenger, bytes counterexample);
    
    constructor(address _processor) {
        processor = _processor;
        owner = msg.sender;
    }
    
    function registerPolicy(uint256 circuitId, uint256 bond, string calldata name) external {
        // In real deploy, transfer bond of LAW transistors (ERC1155) to this contract
        policies[nextPolicyId] = Policy(circuitId, msg.sender, bond, true, name);
        emit PolicyRegistered(nextPolicyId, circuitId, msg.sender, bond);
        nextPolicyId++;
    }
    
    function slashPolicy(uint256 policyId, bytes calldata counterexample) external {
        // Anyone can submit counterexample that proves circuit violates safety envelope
        // For MVP, just deactivate - in production, verify via eval()
        Policy storage p = policies[policyId];
        require(p.active, "already inactive");
        p.active = false;
        // Transfer bond to challenger (simplified)
        emit PolicySlashed(policyId, msg.sender, counterexample);
    }
    
    // 25% of mint proceeds to authors - to be called by processor withdraw hook
    function notifyReward(address author) external payable {
        authorRewards[author] += msg.value;
    }
}
