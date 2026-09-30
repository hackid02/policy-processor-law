// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";

interface IProcessor {
    function eval(uint256 circuitId, bytes calldata input) external view returns (bytes memory);
    function circuitInfo(uint256 circuitId) external view returns (uint32 nIn, uint32 nOut, uint32 nState, uint32 gateCount);
    function nextId() external view returns (uint256);
}

contract ForkTest is Test {
    IProcessor constant PROCESSOR = IProcessor(0x6F74553bAe997e896AD76BaC27401602A01790E8);
    
    function testLiveDeployment() public view {
        uint256 nextId = PROCESSOR.nextId();
        // nextId 5 means ids 1-5 exist (0 reserved), next would be 5? Actually our deploy shows nextId 5 after 5 circuits (id 0 no circuit, 1-5 exist)
        assertTrue(nextId >= 5, "should have at least 5 circuits");

        (uint32 nIn1, uint32 nOut1, , uint32 gates1) = PROCESSOR.circuitInfo(1);
        assertEq(nIn1, 2, "SpendLimit nIn 2");
        assertEq(nOut1, 1, "SpendLimit nOut 1");
        assertEq(gates1, 2, "SpendLimit 2 gates");

        (uint32 nIn2, , , uint32 gates2) = PROCESSOR.circuitInfo(2);
        assertEq(nIn2, 3);
        assertEq(gates2, 12);

        (uint32 nIn3, , , uint32 gates3) = PROCESSOR.circuitInfo(3);
        assertEq(nIn3, 4);
        assertEq(gates3, 12);

        (uint32 nIn4, , , uint32 gates4) = PROCESSOR.circuitInfo(4);
        assertEq(nIn4, 3);
        assertEq(gates4, 6);

        (uint32 nIn5, , , uint32 gates5) = PROCESSOR.circuitInfo(5);
        assertEq(nIn5, 5);
        assertEq(gates5, 18);
    }

    function packBits(uint8[] memory bits) internal pure returns (bytes memory) {
        uint8 v = 0;
        for (uint i = 0; i < bits.length; i++) {
            if (bits[i] != 0) v |= uint8(1 << i);
        }
        bytes memory b = new bytes(1);
        b[0] = bytes1(v);
        return b;
    }

    function testSpendLimitExhaustive() public view {
        // Truth table: [0,0]->0, [1,0]->0, [0,1]->0, [1,1]->1 (AND) — from SpendLimit.json
        uint8[2][4] memory inputs = [
            [uint8(0),0],[1,0],[0,1],[1,1]
        ];
        uint8[4] memory expected = [0,0,0,1];
        for (uint i = 0; i < 4; i++) {
            uint8[] memory bits = new uint8[](2);
            bits[0] = inputs[i][0];
            bits[1] = inputs[i][1];
            bytes memory out = PROCESSOR.eval(1, packBits(bits));
            uint8 verdict = uint8(out[0]) & 1;
            assertEq(verdict, expected[i], "SpendLimit mismatch");
        }
    }

    function testQuorum2of3Exhaustive() public view {
        // 2-of-3 majority from Quorum2of3.json
        uint8[3][8] memory inputs = [
            [0,0,0],[1,0,0],[0,1,0],[1,1,0],
            [0,0,1],[1,0,1],[0,1,1],[1,1,1]
        ];
        uint8[8] memory expected = [0,0,0,1,0,1,1,1];
        for (uint i = 0; i < 8; i++) {
            uint8[] memory bits = new uint8[](3);
            bits[0] = inputs[i][0]; bits[1] = inputs[i][1]; bits[2] = inputs[i][2];
            bytes memory out = PROCESSOR.eval(2, packBits(bits));
            uint8 verdict = uint8(out[0]) & 1;
            assertEq(verdict, expected[i], "Quorum mismatch");
        }
    }

    function testMoodASICExhaustive() public view {
        // Real expected from MoodASIC.json 16 rows — fixed from tautology audit C3
        uint8[4][16] memory inputs = [
            [0,0,0,0],[1,0,0,0],[0,1,0,0],[1,1,0,0],
            [0,0,1,0],[1,0,1,0],[0,1,1,0],[1,1,1,0],
            [0,0,0,1],[1,0,0,1],[0,1,0,1],[1,1,0,1],
            [0,0,1,1],[1,0,1,1],[0,1,1,1],[1,1,1,1]
        ];
        uint8[16] memory expected = [0,0,0,0,0,0,0,1,0,0,0,1,1,1,1,1];
        for (uint i = 0; i < 16; i++) {
            uint8[] memory bits = new uint8[](4);
            bits[0] = inputs[i][0]; bits[1] = inputs[i][1]; bits[2] = inputs[i][2]; bits[3] = inputs[i][3];
            bytes memory out = PROCESSOR.eval(3, packBits(bits));
            uint8 verdict = uint8(out[0]) & 1;
            assertEq(verdict, expected[i], "Mood mismatch");
        }
    }

    function testDeadManExhaustive() public view {
        uint8[3][8] memory inputs = [
            [0,0,0],[1,0,0],[0,1,0],[1,1,0],
            [0,0,1],[1,0,1],[0,1,1],[1,1,1]
        ];
        uint8[8] memory expected = [1,0,1,0,1,0,1,1];
        for (uint i = 0; i < 8; i++) {
            uint8[] memory bits = new uint8[](3);
            bits[0] = inputs[i][0]; bits[1] = inputs[i][1]; bits[2] = inputs[i][2];
            bytes memory out = PROCESSOR.eval(4, packBits(bits));
            uint8 verdict = uint8(out[0]) & 1;
            assertEq(verdict, expected[i], "DeadMan mismatch");
        }
    }

    function testRuleMuxExhaustive() public view {
        // Real expected from RuleMux.json 32 rows — fixed from tautology
        uint8[5][32] memory inputs = [
            [0,0,0,0,0],[1,0,0,0,0],[0,1,0,0,0],[1,1,0,0,0],
            [0,0,1,0,0],[1,0,1,0,0],[0,1,1,0,0],[1,1,1,0,0],
            [0,0,0,1,0],[1,0,0,1,0],[0,1,0,1,0],[1,1,0,1,0],
            [0,0,1,1,0],[1,0,1,1,0],[0,1,1,1,0],[1,1,1,1,0],
            [0,0,0,0,1],[1,0,0,0,1],[0,1,0,0,1],[1,1,0,0,1],
            [0,0,1,0,1],[1,0,1,0,1],[0,1,1,0,1],[1,1,1,0,1],
            [0,0,0,1,1],[1,0,0,1,1],[0,1,0,1,1],[1,1,0,1,1],
            [0,0,1,1,1],[1,0,1,1,1],[0,1,1,1,1],[1,1,1,1,1]
        ];
        uint8[32] memory expected = [
            1,1,1,1,1,1,1,1,
            1,1,1,1,0,0,0,1,
            1,1,1,1,0,0,0,1,
            0,0,0,1,0,0,0,1
        ];
        for (uint i = 0; i < 32; i++) {
            uint8[] memory bits = new uint8[](5);
            bits[0] = inputs[i][0]; bits[1] = inputs[i][1]; bits[2] = inputs[i][2]; bits[3] = inputs[i][3]; bits[4] = inputs[i][4];
            bytes memory out = PROCESSOR.eval(5, packBits(bits));
            uint8 verdict = uint8(out[0]) & 1;
            assertEq(verdict, expected[i], "RuleMux mismatch");
        }
    }

    function testGas0View() public view {
        uint8[] memory bits = new uint8[](2);
        bits[0] = 1; bits[1] = 1;
        bytes memory out = PROCESSOR.eval(1, packBits(bits));
        assertEq(uint8(out[0]) & 1, 1, "Gas0 eval should work");
    }
}
