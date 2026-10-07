import test, { after } from 'node:test';
import { spawn } from 'node:child_process';
import net from 'node:net';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import solc from 'solc';
import { JsonRpcProvider, ContractFactory, parseEther, Interface, keccak256 } from 'ethers';
const sources={};for(const p of ['contracts/PolicyRegistry.sol','contracts/VaultLaw.sol','tests/Fixtures.sol'])sources[p]={content:fs.readFileSync(new URL('../'+p,import.meta.url),'utf8')};
const compilation=JSON.parse(solc.compile(JSON.stringify({language:'Solidity',sources,settings:{evmVersion:'shanghai',optimizer:{enabled:true,runs:200},outputSelection:{'*':{'*':['abi','evm.bytecode.object']}}}})));
const errors=(compilation.errors??[]).filter(e=>e.severity==='error');assert.equal(errors.length,0,errors.map(e=>e.formattedMessage).join('\n'));
// Isolated Anvil node bound to loopback only; no mainnet credentials or funds.
const free=net.createServer();await new Promise(r=>free.listen(0,'127.0.0.1',r));const port=free.address().port;await new Promise(r=>free.close(r));
const child=spawn(process.execPath,['node_modules/@foundry-rs/anvil/bin.mjs','--host','127.0.0.1','--port',String(port),'--chain-id','31337','--hardfork','shanghai','--silent'],{stdio:['ignore','ignore','pipe']});
let logs='';child.stderr.on('data',d=>logs+=d);
const url=`http://127.0.0.1:${port}`;
let started=false;
for(let i=0;i<100;i++){try{const r=await fetch(url,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'eth_chainId',params:[]})});if((await r.json()).result==='0x7a69'){started=true;break;}}catch{}await new Promise(r=>setTimeout(r,50));}
if(!started){child.kill();throw new Error(`Local Anvil failed to start: ${logs}`);}
const provider=new JsonRpcProvider(url,undefined,{batchMaxCount:1});provider.pollingInterval=20;
const eip={request:({method,params})=>provider.send(method,params)};
after(()=>{provider.destroy();child.kill('SIGTERM');});
const owner=await provider.getSigner(0),alice=await provider.getSigner(1),bob=await provider.getSigner(2);
async function deploy(file,name,args=[],signer=owner){const c=compilation.contracts[file][name];const instance=await new ContractFactory(c.abi,c.evm.bytecode.object,signer).deploy(...args);await instance.waitForDeployment();return instance;}
async function mined(p){return(await p).wait();}
async function fixture(){const proc=await deploy('tests/Fixtures.sol','MockProcessor');const reg=await deploy('contracts/PolicyRegistry.sol','PolicyRegistry',[proc.target]);await mined(reg.registerPolicy(1,'SpendLimit'));const vault=await deploy('contracts/VaultLaw.sol','VaultLaw',[reg.target,0,parseEther('.1')]);await mined(vault.connect(alice).deposit({value:parseEther('1')}));return{proc,reg,vault};}
async function rejects(p){await assert.rejects(async()=>{const tx=await p;if(tx?.wait)await tx.wait();});}
await test('reference contracts compile and execute on a local EVM (NOT mainnet)',async t=>{
 await t.test('first 0.90 request is denied with no accounting change',async()=>{const{vault}=await fixture();await rejects(vault.connect(alice).withdraw(parseEther('.9')));assert.equal(await vault.balances(await alice.getAddress()),parseEther('1'));assert.equal(await vault.dailyOutflow(),0n);});
 await t.test('0.05 + 0.05 allowed, next 0.01 denied; input fixed to 0x02',async()=>{const{vault}=await fixture();for(let i=0;i<2;i++){const r=await mined(vault.connect(alice).withdraw(parseEther('.05')));const log=r.logs.map(l=>{try{return vault.interface.parseLog(l)}catch{return null}}).find(l=>l?.name==='Withdrawn');assert.equal(log.args.inputs,'0x02');assert.equal(log.args.output,'0x00');}await rejects(vault.connect(alice).withdraw(parseEther('.01')));assert.equal(await vault.tvl(),parseEther('.9'));assert.equal(await vault.dailyOutflow(),parseEther('.1'));});
 await t.test('exact limit allowed, then one wei denied',async()=>{const{vault}=await fixture();await mined(vault.connect(alice).withdraw(parseEther('.1')));await rejects(vault.connect(alice).withdraw(1));});
 await t.test('zero deposit and withdrawal rejected',async()=>{const{vault}=await fixture();await rejects(vault.connect(alice).withdraw(0));await rejects(vault.connect(alice).deposit({value:0}));});
 await t.test('cannot withdraw another user balance',async()=>{const{vault}=await fixture();await rejects(vault.connect(bob).withdraw(1));});
 await t.test('budget is GLOBAL across users',async()=>{const{vault}=await fixture();await mined(vault.connect(bob).deposit({value:parseEther('1')}));await mined(vault.connect(alice).withdraw(parseEther('.06')));await rejects(vault.connect(bob).withdraw(parseEther('.05')));await mined(vault.connect(bob).withdraw(parseEther('.04')));assert.equal(await vault.dailyOutflow(),parseEther('.1'));});
 await t.test('deposit does not increase or reset daily budget',async()=>{const{vault}=await fixture();await mined(vault.connect(alice).withdraw(parseEther('.1')));await mined(vault.connect(alice).deposit({value:parseEther('1')}));assert.equal(await vault.getRemainingDaily(),0n);await rejects(vault.connect(alice).withdraw(1));});
 await t.test('next UTC day resets budget, including view helper',async()=>{const{vault}=await fixture();await mined(vault.connect(alice).withdraw(parseEther('.1')));await eip.request({method:'evm_increaseTime',params:[86400]});await eip.request({method:'evm_mine',params:[]});assert.equal(await vault.getRemainingDaily(),parseEther('.1'));await mined(vault.connect(alice).withdraw(parseEther('.1'),{gasLimit:500000}));assert.equal(await vault.dailyOutflow(),parseEther('.1'));});
 for(const [mode,label]of [[1,'empty'],[2,'multi-byte'],[3,'out-of-range'],[4,'reverting eval'],[6,'reverting netlist']])await t.test(`${label} response fails closed`,async()=>{const{proc,vault}=await fixture();await mined(proc.setMode(mode));await rejects(vault.connect(alice).withdraw(parseEther('.01')));assert.equal(await vault.tvl(),parseEther('1'));assert.equal(await vault.dailyOutflow(),0n);});
 await t.test('malicious always-ALLOW processor cannot bypass numeric budget',async()=>{const{proc,vault}=await fixture();await mined(proc.setMode(5));await rejects(vault.connect(alice).withdraw(parseEther('.9')));assert.equal(await vault.tvl(),parseEther('1'));});
 await t.test('DENY blocks a numerically valid request',async()=>{const{proc,vault}=await fixture();await mined(proc.setMode(7));await rejects(vault.connect(alice).withdraw(parseEther('.01')));});
 await t.test('caller cannot supply a different policy or input bytes',async()=>{const{vault}=await fixture();const old=new Interface(['function withdraw(uint256,uint256,bytes)']);await rejects(alice.sendTransaction({to:vault.target,data:old.encodeFunctionData('withdraw',[1,99,'0x00'])}));assert.equal(await vault.dailyOutflow(),0n);});
 await t.test('netlist change blocks withdrawal before public report',async()=>{const{proc,vault}=await fixture();await mined(proc.setNetlist('0x1234'));await rejects(vault.connect(alice).withdraw(1));});
 await t.test('false tamper report cannot deactivate policy',async()=>{const{reg}=await fixture();await rejects(reg.connect(bob).reportTamper(0));assert.equal((await reg.getPolicy(0)).active,true);});
 await t.test('forged expected-hash API is not exposed',async()=>{const{reg}=await fixture();const old=new Interface(['function reportTamper(uint256,bytes32)']);await rejects(bob.sendTransaction({to:reg.target,data:old.encodeFunctionData('reportTamper',[0,keccak256('0x00')])}));assert.equal((await reg.getPolicy(0)).active,true);});
 await t.test('real hash mismatch can be reported permissionlessly',async()=>{const{proc,reg,vault}=await fixture();await mined(proc.setNetlist('0x1234'));await mined(reg.connect(bob).reportTamper(0));assert.equal((await reg.getPolicy(0)).active,false);await rejects(vault.connect(alice).withdraw(1));});
 await t.test('unknown policy ids are rejected',async()=>{const{reg}=await fixture();await rejects(reg.getPolicy(999));await rejects(reg.reportTamper(999));});
 await t.test('unauthorized registration and disable rejected',async()=>{const{reg}=await fixture();await rejects(reg.connect(bob).registerPolicy(1,'evil'));await rejects(reg.connect(bob).disablePolicy(0));assert.equal((await reg.getPolicy(0)).active,true);});
 await t.test('explicit admin disable stops withdrawal and cannot be undone',async()=>{const{reg,vault}=await fixture();await mined(reg.disablePolicy(0));await rejects(vault.connect(alice).withdraw(1));await rejects(reg.disablePolicy(0));});
 await t.test('unverified slash API removed',async()=>{const{reg}=await fixture();const old=new Interface(['function slashPolicy(uint256,bytes)']);await rejects(bob.sendTransaction({to:reg.target,data:old.encodeFunctionData('slashPolicy',[0,'0x00'])}));assert.equal((await reg.getPolicy(0)).active,true);});
 await t.test('registration rejects empty netlists and names',async()=>{const{proc,reg}=await fixture();await rejects(reg.registerPolicy(1,''));await mined(proc.setNetlist('0x'));await rejects(reg.registerPolicy(1,'empty'));});
 await t.test('bad constructor configuration rejected',async()=>{const{reg,proc}=await fixture();await rejects(deploy('contracts/VaultLaw.sol','VaultLaw',[reg.target,0,0]));await rejects(deploy('contracts/PolicyRegistry.sol','PolicyRegistry',[await alice.getAddress()]));await mined(proc.setMode(5));await rejects(deploy('contracts/VaultLaw.sol','VaultLaw',[reg.target,0,parseEther('.1')]));});
 await t.test('transfer failure rolls back balances and daily outflow',async()=>{const{vault}=await fixture();const receiver=await deploy('tests/Fixtures.sol','Receiver',[vault.target]);await mined(receiver.fund({value:parseEther('.1')}));await rejects(receiver.take(parseEther('.05'),1,{gasLimit:500000}));assert.equal(await vault.balances(receiver.target),parseEther('.1'));assert.equal(await vault.dailyOutflow(),0n);});
 await t.test('reentrant withdrawal cannot execute a second transfer',async()=>{const{vault}=await fixture();const receiver=await deploy('tests/Fixtures.sol','Receiver',[vault.target]);await mined(receiver.fund({value:parseEther('.1')}));await mined(receiver.take(parseEther('.05'),2));assert.equal(await receiver.reentryBlocked(),true);assert.equal(await vault.balances(receiver.target),parseEther('.05'));assert.equal(await vault.dailyOutflow(),parseEther('.05'));});
});
