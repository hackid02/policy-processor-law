import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const specs = [
 ['SpendLimit', 2, b=>b[0]&b[1]],
 ['Quorum2of3',3,b=>Number(b.reduce((a,x)=>a+x,0)>=2)],
 ['MoodASIC',4,b=>(b[2]&b[3])|((b[2]|b[3])&b[0]&b[1])],
 ['DeadMan',3,b=>(1-b[0])|(b[1]&b[2])],
 ['RuleMux',5,b=>(b[0]&b[1])|Number(b[2]+b[3]+b[4]<2)],
];
for (const [name,n,expected] of specs) test(`${name}: every encoded input matches independent formula and stored table`,()=>{
 const j=JSON.parse(fs.readFileSync(new URL(`../circuits/${name}.json`,import.meta.url)));
 const raw=fs.readFileSync(new URL(`../circuits/${name}.bin`,import.meta.url));
 assert.equal(j.nIn,n);assert.equal(j.nOut,1);assert.equal(j.truthTable.length,2**n);assert.equal(raw.length%7,0);
 assert.equal(j.hex,`0x${raw.toString('hex')}`);assert.equal(raw.length,j.bytes);assert.equal(raw.length/7,j.gates);
 const seen=new Set();
 for(const row of j.truthTable){
  assert.equal(row.in.length,n);assert.ok(row.in.every(b=>b===0||b===1));seen.add(row.in.join(''));
  const nodes=[0,1,...row.in];
  for(let k=0;k<raw.length;k+=7){assert.equal(raw[k],0);const a=raw.readUIntBE(k+1,3),b=raw.readUIntBE(k+4,3);assert.ok(a<nodes.length&&b<nodes.length,'only prior nodes may be referenced');nodes.push(1-(nodes[a]&nodes[b]));}
  assert.equal(nodes.at(-1),expected(row.in));assert.deepEqual(row.out,[expected(row.in)]);
 }
 assert.equal(seen.size,2**n);
});
