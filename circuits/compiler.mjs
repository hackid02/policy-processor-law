#!/usr/bin/env node
// TapeOut NAND netlist compiler - 7 bytes per NAND: 0x00 + 3-byte BE a + 3-byte BE b
// Node indexing: 0=const0, 1=const1, 2..1+nIn = inputs, then gates
// Outputs = last nOut gates

function encodeNAND(a,b) {
  const buf = Buffer.alloc(7);
  buf[0]=0x00;
  buf.writeUIntBE(a,1,3);
  buf.writeUIntBE(b,4,3);
  return buf;
}

class Circuit {
  constructor(nIn, nOut) {
    this.nIn=nIn; this.nOut=nOut;
    this.nextIdx=2+nIn;
    this.gates=[];
    this.buffers=[];
  }
  nand(a,b) {
    const out=this.nextIdx++;
    this.gates.push({a,b,out});
    this.buffers.push(encodeNAND(a,b));
    return out;
  }
  not(a){ return this.nand(a,a); }
  and(a,b){ const t=this.nand(a,b); return this.not(t); }
  or(a,b){ const na=this.not(a); const nb=this.not(b); return this.nand(na,nb); }
  // build netlist bytes
  bytes(){ return Buffer.concat(this.buffers); }
  // truth table exhaustive
  evalFn(inputBits) {
    // inputBits array length nIn, 0/1
    const nodes = {};
    nodes[0]=0; nodes[1]=1;
    for (let i=0;i<this.nIn;i++) nodes[2+i]=inputBits[i];
    for (const g of this.gates) {
      const av=nodes[g.a]??0;
      const bv=nodes[g.b]??0;
      nodes[g.out]= (av & bv) ? 0 : 1; // NAND
    }
    // outputs = last nOut gates
    const outs=[];
    for (let i=0;i<this.nOut;i++) {
      const gateIdx = this.gates.length - this.nOut + i;
      const outNode = this.gates[gateIdx]?.out;
      outs.push(nodes[outNode]??0);
    }
    return outs;
  }
  truthTable() {
    const rows=[];
    const total=1<<this.nIn;
    for (let mask=0; mask<total; mask++) {
      const bits=[];
      for (let i=0;i<this.nIn;i++) bits.push((mask>>i)&1);
      const outs=this.evalFn(bits);
      rows.push({in:bits.slice(), out:outs.slice()});
    }
    return rows;
  }
}

// 1. SpendLimit: ah & dh (2 in, 1 out, 2 gates)
function buildSpendLimit() {
  const c=new Circuit(2,1);
  const ah=2, dh=3;
  c.and(ah,dh);
  return c;
}

// 2. Quorum2of3: (s1&s2)|(s1&s3)|(s2&s3) - 3 in, 1 out, 9 gates (optimized)
function buildQuorum() {
  const c=new Circuit(3,1);
  const s1=2,s2=3,s3=4;
  const a12=c.and(s1,s2);
  const a13=c.and(s1,s3);
  const a23=c.and(s2,s3);
  const or1=c.or(a12,a13);
  c.or(or1,a23);
  return c;
}

// 3. Mood ASIC: inputs ah,dh,m1,m0 (4 in), 1 out
// deny = (m1 & m0) | ((m1|m0) & ah & dh)
// FOMO 00 => ALLOW, FEAR 01 => DENY if ah&dh, HOLD 10 => DENY if ah&dh, EXIT 11 => DENY
function buildMood() {
  const c=new Circuit(4,1);
  const ah=2,dh=3,m1=4,m0=5;
  const exit=c.and(m1,m0); // 11
  const nonFomo=c.or(m1,m0); // m1|m0 = not FOMO
  const ahdh=c.and(ah,dh);
  const risky=c.and(nonFomo,ahdh);
  c.or(exit,risky);
  return c;
}

// 4. Dead Man Switch: inputs alive, ah, dh (3 in), 1 out
// deny = !alive | (ah & dh) -> locked when !alive
function buildDeadMan() {
  const c=new Circuit(3,1);
  const alive=2, ah=3, dh=4;
  const notAlive=c.not(alive);
  const ahdh=c.and(ah,dh);
  c.or(notAlive,ahdh);
  return c;
}

// 5. RuleMux Hybrid: inputs ah,dh,s1,s2,s3 (5 in), 1 out
// hybridDeny = (ah&dh) | !quorumPass, quorumPass = (s1&s2)|(s1&s3)|(s2&s3)
function buildRuleMux() {
  const c=new Circuit(5,1);
  const ah=2,dh=3,s1=4,s2=5,s3=6;
  const ahdh=c.and(ah,dh);
  const a12=c.and(s1,s2);
  const a13=c.and(s1,s3);
  const a23=c.and(s2,s3);
  const or1=c.or(a12,a13);
  const quorum=c.or(or1,a23);
  const notQuorum=c.not(quorum);
  c.or(ahdh,notQuorum);
  return c;
}

function printCircuit(name, c) {
  const bytes=c.bytes();
  const tt=c.truthTable();
  console.log(`\n=== ${name} ===`);
  console.log(`nIn=${c.nIn} nOut=${c.nOut} gates=${c.gates.length} bytes=${bytes.length} (${bytes.length/7} NAND)`);
  console.log(`hex: 0x${bytes.toString('hex').slice(0,128)}${bytes.length>64?'...':''}`);
  console.log(`truth table ${tt.length} rows:`);
  for (const row of tt.slice(0,16)) {
    console.log(`  in=${row.in.join('')} -> out=${row.out.join('')}`);
  }
  if (tt.length>16) console.log(`  ... ${tt.length-16} more rows`);
  // write files
  import('fs').then(fs=>{
    fs.writeFileSync(`./${name}.bin`, bytes);
    fs.writeFileSync(`./${name}.json`, JSON.stringify({name, nIn:c.nIn, nOut:c.nOut, gates:c.gates.length, bytes:bytes.length, hex:'0x'+bytes.toString('hex'), truthTable:tt}, null, 2));
  });
}

const circuits = [
  ['SpendLimit', buildSpendLimit()],
  ['Quorum2of3', buildQuorum()],
  ['MoodASIC', buildMood()],
  ['DeadMan', buildDeadMan()],
  ['RuleMux', buildRuleMux()],
];

for (const [name,c] of circuits) printCircuit(name,c);
