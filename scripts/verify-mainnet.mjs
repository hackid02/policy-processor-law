// READ ONLY. No signer, private key, wallet connection, or transaction submission.
import { JsonRpcProvider, FetchRequest, Contract, Interface, keccak256 } from 'ethers';
import fs from 'node:fs';
const addresses={factory:'0x1f09DAeFA827f02CBb40967cc91b259763760761',processor:'0x6F74553bAe997e896AD76BaC27401602A01790E8',transistors:'0xeDDe115d032bE238cd7AA37AEc183262C598a941',deployer:'0xb9C37b75cF53EBfeC9eAf16b35E77541aB941556'};
const txs={create:'0xa5ff67333838d8471f9434e9a08f93eceb52669b0dcda55e785cb57b29102887',mint:'0xe050bd4537df9601423d1f51b45c77ea8a9abe25b9d73c07bd8b3c5fe9e897f6',tape1:'0x20a48fd1d622861333360d0e900bbfe468ac751d2525dc5844284dd568132f23',tape2:'0x1a1e27a6f6ff3f4a10991b16e4267ee3fbfb93bdc1e3ea4d3e7d42f18c0c2182',tape3:'0x600d8ce1be00ac04475dcdefab8e36388778b3c083f1bd920ed85c469805001e',tape4:'0x38cf6263380007e20b5b1e6bbf60c0d4af3566d1b09e9489f23f1fd9261bef7e',tape5:'0x8cedca9b582dab79d70ce09df8af345259b7e108e61abe359c76200b76a4fe00'};
const report={checkedAt:new Date().toISOString(),mode:'read-only',status:'NOT_VERIFIED',addresses,checks:[],circuits:[],receipts:[],errors:[]};
let provider;
function check(name,condition,details){report.checks.push({name,passed:!!condition,details});if(!condition)throw new Error(`Check failed: ${name}`);}
try{
 const url=process.env.XLAYER_RPC_URL||'https://rpc.xlayer.tech';
 const req=new FetchRequest(url);req.timeout=10000;
 provider=new JsonRpcProvider(req,undefined,{batchMaxCount:1});
 const chain=Number(await provider.send('eth_chainId',[]));check('X Layer chain ID',chain===196,chain);
 const block=await provider.getBlock('latest');if(!block)throw new Error('Latest block unavailable');
 report.blockNumber=block.number;report.blockHash=block.hash;report.blockTimestamp=block.timestamp;
 const tag={blockTag:block.number};
 for(const key of ['factory','processor','transistors']){const code=await provider.getCode(addresses[key].toLowerCase(),block.number);check(`${key} bytecode exists`,code!=='0x',{codeHash:keccak256(code)});}
 const factory=new Contract(addresses.factory.toLowerCase(),['function isCPU(address) view returns(bool)'],provider);
 check('factory recognises processor',await factory.isCPU(addresses.processor.toLowerCase(),tag));
 const proc=new Contract(addresses.processor.toLowerCase(),['function transistors() view returns(address)','function circuitInfo(uint256) view returns(uint32,uint32,uint32,uint32)','function netlist(uint256) view returns(bytes)','function eval(uint256,bytes) view returns(bytes)'],provider);
 check('processor points to declared transistor contract',(await proc.transistors(tag)).toLowerCase()===addresses.transistors.toLowerCase());
 const trans=new Contract(addresses.transistors.toLowerCase(),['function supplyCap() view returns(uint256)','function mintPrice() view returns(uint256)','function minted() view returns(uint256)'],provider);
 const supply=await trans.supplyCap(tag),price=await trans.mintPrice(tag);
 check('supply cap matches disclosure',supply===2300000n,supply.toString());check('unit price matches disclosure',price===66000000000000n,price.toString());
 report.totalMinted=(await trans.minted(tag)).toString();
 let total=0;
 for(const [index,name]of ['SpendLimit','Quorum2of3','MoodASIC','DeadMan','RuleMux'].entries()){
  const id=index+1;const j=JSON.parse(fs.readFileSync(new URL(`../circuits/${name}.json`,import.meta.url)));
  const info=await proc.circuitInfo(id,tag);check(`${name} metadata`,Number(info[0])===j.nIn&&Number(info[1])===1&&Number(info[2])===0&&Number(info[3])===j.gates,info.map(String));
  const netlist=await proc.netlist(id,tag);check(`${name} netlist matches local bytes`,netlist.toLowerCase()===j.hex.toLowerCase(),{hash:keccak256(netlist)});
  let passed=0;
  for(let i=0;i<j.truthTable.length;i+=4){await Promise.all(j.truthTable.slice(i,i+4).map(async row=>{
   const packed='0x'+row.in.reduce((v,b,k)=>v|(b<<k),0).toString(16).padStart(2,'0');
   const output=await proc.eval(id,packed,tag);const expected='0x0'+row.out[0];
   if(output!==expected)throw new Error(`${name} ${packed}: ${output}, expected ${expected}`);passed++;
  }));}
  total+=passed;report.circuits.push({id,name,cases:passed});
 }
 check('all 68 mainnet evaluations matched',total===68,total);
 const from=Date.parse('2026-09-22T04:00:00Z')/1000,to=Date.parse('2026-10-09T04:00:00Z')/1000;
 for(const [action,hash]of Object.entries(txs)){
  const receipt=await provider.getTransactionReceipt(hash);if(!receipt)throw new Error(`Receipt missing: ${action}`);
  const mined=await provider.getBlock(receipt.blockNumber);if(!mined)throw new Error(`Block unavailable: ${action}`);
  const expectedTo=action==='create'?addresses.factory:action==='mint'?addresses.transistors:addresses.processor;
  check(`${action} successful, correct sender and target`,receipt.status===1&&receipt.from.toLowerCase()===addresses.deployer.toLowerCase()&&receipt.to?.toLowerCase()===expectedTo.toLowerCase());
  check(`${action} within hackathon window`,mined.timestamp>=from&&mined.timestamp<to,mined.timestamp);
  report.receipts.push({action,hash,block:receipt.blockNumber,timestamp:mined.timestamp,status:receipt.status});
 }
 const creation=await provider.getTransaction(txs.create);
 const abi=new Interface(['function createCPU(string,string,string,uint256,uint256) payable returns(address,address)']);
 const decoded=abi.parseTransaction({data:creation.data,value:creation.value});
 check('issuance parameters present at creation',decoded?.args[3]===2300000n&&decoded?.args[4]===66000000000000n);
 report.status='VERIFIED_AT_RECORDED_BLOCK';
}catch(error){report.errors.push(error.shortMessage||error.message||String(error));process.exitCode=1;}
finally{provider?.destroy();fs.mkdirSync(new URL('../reports/',import.meta.url),{recursive:true});fs.writeFileSync(new URL('../reports/mainnet-verification.json',import.meta.url),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));}
