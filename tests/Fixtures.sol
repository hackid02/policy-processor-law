// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "../contracts/VaultLaw.sol";
contract MockProcessor {
    bytes public data = hex"0000000200000300000004000004";
    uint256 public mode;
    function setMode(uint256 v) external { mode=v; }
    function setNetlist(bytes calldata v) external { data=v; }
    function netlist(uint256) external view returns(bytes memory) { if(mode==6)revert("netlist failure"); return data; }
    function eval(uint256, bytes calldata input) external view returns(bytes memory) {
        if(mode==1)return hex"";
        if(mode==2)return hex"0000";
        if(mode==3)return hex"02";
        if(mode==4)revert("eval failure");
        if(mode==5)return hex"00";
        if(mode==7)return hex"01";
        return abi.encodePacked(uint8((uint8(input[0])&3)==3?1:0));
    }
}
contract Receiver {
    VaultLaw public vault;
    uint256 public mode;
    bool public reentryBlocked;
    constructor(address v){vault=VaultLaw(v);}
    function fund() external payable {vault.deposit{value:msg.value}();}
    function take(uint256 n,uint256 m) external {mode=m;vault.withdraw(n);}
    receive() external payable {
        if(mode==1)revert("reject payment");
        if(mode==2){try vault.withdraw(1){}catch{reentryBlocked=true;}}
    }
}
