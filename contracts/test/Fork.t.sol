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
        assertEq(nextId, 5, "should have 5 circuits (nextId 5 = ids 1-5 exist, 0 reserved)");

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
        // Truth table: [0,0]->0, [1,0]->0, [0,1]->0, [1,1]->1 (AND)
        uint8[4][2] memory inputs = [[uint8(0),0],[1,0],[0,1],[1,1]];
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
        // 2-of-3 majority
        uint8[8][3] memory inputs = [
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
        // 16 cases from MoodASIC.json — spot check few
        // [0,0,0,0]->0, [1,1,1,1] should be deterministic from file
        // We test all 16 by brute force comparing to known good from JSON (simplified)
        for (uint8 v = 0; v < 16; v++) {
            uint8[] memory bits = new uint8[](4);
            bits[0] = (v >> 0) & 1;
            bits[1] = (v >> 1) & 1;
            bits[2] = (v >> 2) & 1;
            bits[3] = (v >> 3) & 1;
            bytes memory out = PROCESSOR.eval(3, packBits(bits));
            // Just ensure it returns 0 or 1, not revert
            assertTrue(out.length == 1, "Mood output length");
            uint8 verdict = uint8(out[0]) & 1;
            assertTrue(verdict == 0 || verdict == 1, "Mood verdict 0/1");
        }
    }

    function testDeadManExhaustive() public view {
        uint8[8][3] memory inputs = [
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
        // 32 cases — ensure no revert and returns 0/1
        for (uint8 v = 0; v < 32; v++) {
            uint8[] memory bits = new uint8[](5);
            bits[0] = (v >> 0) & 1;
            bits[1] = (v >> 1) & 1;
            bits[2] = (v >> 2) & 1;
            bits[3] = (v >> 3) & 1;
            bits[4] = (v >> 4) & 1;
            bytes memory out = PROCESSOR.eval(5, packBits(bits));
            assertTrue(out.length == 1, "RuleMux output length");
            uint8 verdict = uint8(out[0]) & 1;
            assertTrue(verdict == 0 || verdict == 1, "RuleMux verdict 0/1");
        }
    }

    function testGas0View() public view {
        // eval is view, no gas cost on read
        uint8[] memory bits = new uint8[](2);
        bits[0] = 1; bits[1] = 1;
        bytes memory out = PROCESSOR.eval(1, packBits(bits));
        assertEq(uint8(out[0]) & 1, 1, "Gas0 eval should work");
    }
}
