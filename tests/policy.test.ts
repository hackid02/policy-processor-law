import test from 'node:test';
import assert from 'node:assert/strict';
import { WEI, DAILY_LIMIT, parseScenarioAmount, formatOKB, INITIAL_INPUTS, initialVault, withdrawDemo, depositDemo, currentVault, packBits, parseOutput, evaluateCircuit, circuitInput, verdictLabel } from '../web/lib/policy';
const NOW = Date.UTC(2026, 9, 7, 12);
test('fresh demo starts with 1 OKB and zero outflow', () => { const s = initialVault(NOW); assert.equal(s.balance, WEI); assert.equal(s.dailyOutflow, 0n); });
test('0.90 is denied on the FIRST request', () => { const s = initialVault(NOW); const r = withdrawDemo(s, WEI*9n/10n,NOW); assert.equal(r.allowed,false); assert.deepEqual(r.state,s); assert.equal(r.packed,'0x03'); });
test('0.05 twice allowed, 0.01 thereafter denied, exact integers', () => {
 let s=initialVault(NOW);
 for(let i=0;i<2;i++){ const r=withdrawDemo(s,WEI/20n,NOW); assert.equal(r.allowed,true); assert.equal(r.packed,'0x02'); s=r.state; }
 assert.equal(s.dailyOutflow,DAILY_LIMIT); assert.equal(s.balance,WEI*9n/10n);
 const r=withdrawDemo(s,WEI/100n,NOW); assert.equal(r.allowed,false);assert.deepEqual(r.state,s);
});
test('one wei above remaining budget is denied',()=>{let s=withdrawDemo(initialVault(NOW),WEI/20n,NOW).state;assert.equal(withdrawDemo(s,WEI/20n+1n,NOW).allowed,false);});
test('exact daily boundary is allowed',()=>{assert.equal(withdrawDemo(initialVault(NOW),DAILY_LIMIT,NOW).allowed,true);});
test('zero and negative requests rejected',()=>{for(const n of [0n,-1n])assert.equal(withdrawDemo(initialVault(NOW),n,NOW).allowed,false);});
test('insufficient funds rejected',()=>{assert.match(withdrawDemo({...initialVault(NOW),balance:1n},2n,NOW).reason,/Insufficient/);});
test('deposit increases balance but not budget or spent amount',()=>{let s=withdrawDemo(initialVault(NOW),DAILY_LIMIT,NOW).state;s=depositDemo(s,WEI,NOW);assert.equal(s.dailyOutflow,DAILY_LIMIT);assert.equal(withdrawDemo(s,1n,NOW).allowed,false);});
test('UTC date change resets spent without changing balance',()=>{let s=withdrawDemo(initialVault(NOW),DAILY_LIMIT,NOW).state;const next=NOW+86400000;assert.equal(currentVault(s,next).dailyOutflow,0n);assert.equal(currentVault(s,next).balance,s.balance);assert.equal(withdrawDemo(s,DAILY_LIMIT,next).allowed,true);});
test('23:59:59 to 00:00:00 UTC is the reset boundary',()=>{const a=Date.UTC(2026,9,7,23,59,59);const s=withdrawDemo(initialVault(a),DAILY_LIMIT,a).state;assert.equal(withdrawDemo(s,1n,a+500).allowed,false);assert.equal(withdrawDemo(s,1n,a+1000).allowed,true);});
test('all four SpendLimit combinations and packed bytes',()=>{for(const ah of [0,1] as const)for(const dh of [0,1] as const){const s={...INITIAL_INPUTS,ah,dh};assert.equal(evaluateCircuit('spend',s),ah&dh);assert.equal(packBits(circuitInput('spend',s)),`0x0${ah|(dh<<1)}`);}});
test('all eight quorum combinations: output 1 is PASS',()=>{for(let mask=0;mask<8;mask++){const signers=[mask&1,(mask>>1)&1,(mask>>2)&1] as [0|1,0|1,0|1];assert.equal(evaluateCircuit('quorum',{...INITIAL_INPUTS,signers}),signers.reduce<number>((a,b)=>a+b,0)>=2?1:0);}assert.equal(verdictLabel('quorum',1),'PASS');assert.equal(verdictLabel('spend',1),'DENY');});
test('FEAR and HOLD match deployed circuit AND behavior',()=>{for(const mood of ['FEAR','HOLD'] as const){assert.equal(evaluateCircuit('mood',{...INITIAL_INPUTS,mood,ah:1,dh:0}),0);assert.equal(evaluateCircuit('mood',{...INITIAL_INPUTS,mood,ah:1,dh:1}),1);}});
test('FOMO allows, EXIT denies in every spend state',()=>{for(const ah of [0,1] as const)for(const dh of [0,1] as const){assert.equal(evaluateCircuit('mood',{...INITIAL_INPUTS,mood:'FOMO',ah,dh}),0);assert.equal(evaluateCircuit('mood',{...INITIAL_INPUTS,mood:'EXIT',ah,dh}),1);}});
test('heartbeat dead bit denies independently of spend',()=>{assert.equal(evaluateCircuit('heartbeat',{...INITIAL_INPUTS,alive:0}),1);});
test('hybrid denies on quorum fail or AND restriction',()=>{assert.equal(evaluateCircuit('hybrid',{...INITIAL_INPUTS,signers:[1,0,0]}),1);assert.equal(evaluateCircuit('hybrid',{...INITIAL_INPUTS,ah:1,dh:1}),1);assert.equal(evaluateCircuit('hybrid',INITIAL_INPUTS),0);});
test('malformed RPC output is an error, never success',()=>{for(const raw of ['0x','0x02','0x0000','0x0100','0xgg',''])assert.throws(()=>parseOutput(raw));assert.equal(parseOutput('0x00'),0);assert.equal(parseOutput('0x01'),1);});

test('custom scenario parsing is exact down to one wei',()=>{assert.equal(parseScenarioAmount('0.000000000000000001'),1n);assert.equal(parseScenarioAmount('0.050000000000000001'),WEI/20n+1n);assert.equal(parseScenarioAmount(' 1.25 '),WEI*5n/4n);});
test('scenario rejects invalid, zero, negative and imprecise input',()=>{for(const s of ['', '0', '0.00', '-1', '+1', '1e3', 'Infinity', 'NaN', '0.0000000000000000001', '1,000', '.5', '01.2', '1.'])assert.throws(()=>parseScenarioAmount(s));});
test('scenario enforces uint256 maximum',()=>{const max=(1n<<256n)-1n;assert.equal(parseScenarioAmount(formatOKB(max)),max);assert.throws(()=>parseScenarioAmount(formatOKB(max+1n)));});
test('amount display never truncates sub-cent scenario data',()=>{for(const amount of [0n,1n,WEI/1000n,WEI/20n+1n,WEI]){const display=formatOKB(amount);if(amount>0n)assert.equal(parseScenarioAmount(display),amount);}assert.equal(formatOKB(0n),'0.00');assert.equal(formatOKB(WEI/20n),'0.05');});
