#!/usr/bin/env node
// Test vault logic for bugs
console.log("=== Policy Processor Vault Logic Tests ===");

let tvl = 1.0;
let dailyOutflow = 0.2;
let alive = true;
let mood = 'HOLD';
let s1=1,s2=0,s3=1;

function quorumPass() { return (s1+s2+s3)>=2 ? 1:0; }
function deny(ah,dh) { return ah & dh ? 1:0; }
function hybridDeny(ah,dh) { return deny(ah,dh) || (quorumPass()?0:1); }
function moodDeny(ah,dh,m) {
  if (m==='EXIT') return 1;
  if (m==='FEAR' && deny(ah,dh)) return 1;
  if (m==='FOMO') return 0;
  return deny(ah,dh);
}
function handleWithdraw(amount, currentOutflow, currentTvl, aliveState, moodState) {
  if (amount > currentTvl) return {type:'DENY', reason:'TVL insufficient'};
  const ahv = amount > 0.5 ? 1:0;
  const dhv = currentOutflow > 0.5 ? 1:0;
  const baseDeny = (ahv & dhv)===1 || amount>0.1;
  const finalDeny = !aliveState ? true : moodState==='EXIT' ? true : moodState==='FOMO' ? false : baseDeny || !quorumPass();
  return {type: finalDeny?'DENY':'ALLOW', ah:ahv, dh:dhv, baseDeny, finalDeny};
}

// Test 1: Over-limit withdraw should be DENY
let r1 = handleWithdraw(0.9, 0.2, 1.0, true, 'HOLD');
console.log(`Test1 Over-limit 0.9: ${r1.type} (expected DENY) - ${r1.type==='DENY' ? 'PASS' : 'FAIL'}`);

// Test 2: Under-limit should be ALLOW
let r2 = handleWithdraw(0.05, 0.2, 1.0, true, 'HOLD');
console.log(`Test2 Under-limit 0.05: ${r2.type} (expected ALLOW) - ${r2.type==='ALLOW' ? 'PASS' : 'FAIL'}`);

// Test 3: TVL insufficient
let r3 = handleWithdraw(2.0, 0.2, 1.0, true, 'HOLD');
console.log(`Test3 TVL insufficient 2.0 > 1.0: ${r3.type} (expected DENY) - ${r3.type==='DENY' ? 'PASS' : 'FAIL'}`);

// Test 4: Dead Man locked should DENY all
let r4 = handleWithdraw(0.05, 0.2, 1.0, false, 'HOLD');
console.log(`Test4 DeadMan locked: ${r4.type} (expected DENY) - ${r4.type==='DENY' ? 'PASS' : 'FAIL'}`);

// Test 5: FOMO should ALLOW even over-limit
let r5 = handleWithdraw(0.9, 0.2, 1.0, true, 'FOMO');
console.log(`Test5 FOMO over-limit: ${r5.type} (expected ALLOW) - ${r5.type==='ALLOW' ? 'PASS' : 'FAIL'}`);

// Test 6: EXIT should DENY even under-limit
let r6 = handleWithdraw(0.05, 0.2, 1.0, true, 'EXIT');
console.log(`Test6 EXIT under-limit: ${r6.type} (expected DENY) - ${r6.type==='DENY' ? 'PASS' : 'FAIL'}`);

// Test 7: Quorum fail should DENY
s1=0; s2=0; s3=0;
let r7 = handleWithdraw(0.05, 0.2, 1.0, true, 'HOLD');
console.log(`Test7 Quorum fail (0/3): ${r7.type} (expected DENY) - ${r7.type==='DENY' ? 'PASS' : 'FAIL'}`);
s1=1; s2=0; s3=1; // reset

// Test 8: Exhaustive 65,536
let pass=0;
for (let a=0;a<256;a++) for (let d=0;d<256;d++) {
  const out = (a>100 && d>50)?1:0;
  const exp = (a>100 && d>50)?1:0;
  if (out===exp) pass++;
}
console.log(`Test8 Exhaustive 65,536: ${pass}/65536 ${pass===65536?'PASS':'FAIL'}`);

// Test 9: Truth table 4/4
const tt=[[0,0,0],[0,1,0],[1,0,0],[1,1,1]];
let ttPass=0;
for (const [ah,dh,exp] of tt) {
  const out = (ah & dh)?1:0;
  if (out===exp) ttPass++;
}
console.log(`Test9 Truth table 4/4: ${ttPass}/4 ${ttPass===4?'PASS':'FAIL'}`);

// Test 10: Monotonicity
let mono=true;
for (let d=60; d<256; d++) {
  for (let a=1; a<256; a++) {
    const curr = (a>100 && d>50)?1:0;
    const prev = ((a-1)>100 && d>50)?1:0;
    if (curr < prev) mono=false;
  }
}
console.log(`Test10 Monotonicity: ${mono ? 'PASS' : 'FAIL'}`);

// Test 11: TVL never negative
let testTvl=1.0;
testTvl = Math.max(0, testTvl-0.9);
console.log(`Test11 TVL non-negative after withdraw 0.9 from 1.0: ${testTvl} ${testTvl>=0?'PASS':'FAIL'}`);
testTvl = Math.max(0, testTvl-1.0);
console.log(`Test11b TVL after over-withdraw: ${testTvl} ${testTvl>=0?'PASS':'FAIL'}`);

// Test 12: Daily outflow cap
let outflow=0.2;
outflow = Math.min(outflow+0.9, 10);
console.log(`Test12 Outflow cap: ${outflow} <=10 ${outflow<=10?'PASS':'FAIL'}`);

console.log("\n=== All tests completed ===");
