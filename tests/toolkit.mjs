import {chromium} from 'playwright';
import {Interface} from 'ethers';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const browser=await chromium.launch({args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1440,height:1000},acceptDownloads:true,reducedMotion:'reduce'});
const abi=new Interface(['function eval(uint256,bytes) view returns(bytes)']);
let mode='normal';const calls=[],passed=[],errors=[];
page.on('pageerror',e=>errors.push(e.message));
await page.route('https://rpc.xlayer.tech/**',async route=>{
 const p=route.request().postDataJSON();calls.push(p);let result;
 if(mode==='offline'){await route.abort('failed');return;}
 if(p.method==='eth_chainId')result='0xc4';
 else if(p.method==='eth_blockNumber')result='0x453';
 else{const tx=abi.parseTransaction({data:p.params[0].data});const n=parseInt(tx.args[1].slice(2),16);const deny=(n&1)&((n>>1)&1);result=abi.encodeFunctionResult('eval',[`0x0${mode==='mismatch'?1-deny:deny}`]);}
 await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({jsonrpc:'2.0',id:p.id,result})});
});
const panel=()=>page.getByTestId('court-comparison').first();
const input=()=>page.getByLabel('Withdrawal amount');
const evaluate=()=>page.getByRole('button',{name:/Evaluate scenario/}).click();
async function check(name,fn){await fn();passed.push(name);console.log('PASS',name);}
async function download(){const wait=page.waitForEvent('download');await panel().getByRole('button',{name:/Export evidence/}).click();return JSON.parse(fs.readFileSync(await(await wait).path(),'utf8'));}
try{
 await page.goto(process.env.BASE_URL||'http://127.0.0.1:3000',{waitUntil:'networkidle'});
 await check('quick amount choices select only; one explicit evaluation action',async()=>{await page.getByRole('button',{name:'Use 0.90 OKB',exact:true}).click();assert.equal(await input().inputValue(),'0.90');assert.equal(await page.locator('.event').count(),0);assert.equal(calls.length,0);assert.equal(await page.getByRole('button',{name:/Evaluate scenario/}).count(),1);});
 await check('invalid custom amounts are rejected without accounting or RPC',async()=>{for(const amount of ['', '0','-1','1e2','0.0000000000000000001','9'.repeat(79)]){await input().fill(amount);await evaluate();assert.ok(await page.locator('#amount-error').isVisible());assert.equal(await page.locator('.event').count(),0);assert.match(await page.getByTestId('vault-balance').innerText(),/1.00/);}assert.equal(calls.length,0);});
 await check('custom 18-decimal amount is displayed and accounted exactly',async()=>{await input().fill('0.050000000000000001');await evaluate();assert.match(await page.getByTestId('daily-spent').innerText(),/0.050000000000000001/);assert.match(await panel().innerText(),/0.050000000000000001/);assert.match(await page.getByTestId('vault-balance').innerText(),/0.949999999999999999/);});
 await check('uncompared scenarios cannot export misleading evidence',async()=>{assert.ok(await panel().getByRole('button',{name:/Export evidence/}).isDisabled());});
 await check('successful export preserves exact wei, circuit, block and caveats',async()=>{await panel().getByRole('button',{name:/Compare this request/}).click();await panel().getByText(/RPC returned ALLOW/).waitFor();const e=await download();assert.equal(e.schema,'law-policy-comparison/v1');assert.equal(e.snapshot.requested,'50000000000000001');assert.equal(e.snapshot.spentBefore,'0');assert.equal(e.snapshot.input,'0x02');assert.equal(e.circuitId,1);assert.equal(e.expectedChainId,196);assert.equal(e.comparison.status,'match');assert.equal(e.comparison.block,'1107');assert.ok(e.comparison.checkedAt);assert.match(e.limitations,/Not a signed proof/);});
 await check('custom precision prevents over-limit rounding',async()=>{await input().fill('0.05');await evaluate();assert.match(await page.locator('.event').first().innerText(),/DENY/);assert.match(await panel().innerText(),/0x03/);assert.match(await page.getByTestId('daily-spent').innerText(),/0.050000000000000001/);});
 await check('mismatch export never becomes verified evidence',async()=>{mode='mismatch';await panel().getByRole('button',{name:/Compare this request/}).click();await panel().getByText(/Mismatch:/).waitFor();const e=await download();assert.equal(e.comparison.status,'mismatch');assert.equal(e.comparison.actual,0);assert.equal(e.snapshot.predicted,1);});
 await check('retry failure clears previous result and exports the error',async()=>{mode='offline';await panel().getByRole('button',{name:/Compare this request/}).click();await panel().getByText(/Not verified/).waitFor();const e=await download();assert.equal(e.comparison.status,'error');assert.equal(e.comparison.actual,undefined);assert.ok(e.comparison.message);});
 await check('long exact values remain usable on small screens in both themes',async()=>{for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:900});for(let n=0;n<2;n++){await page.locator('.theme-toggle').click();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),String(width));}}});
 await check('original footer and real-funded deployment wording retained',async()=>{const text=await page.locator('footer').innerText();for(const phrase of ['IGNIX','X Layer','TapeOut','using real OKB','withdrawals are simulated'])assert.ok(text.includes(phrase));});
 assert.deepEqual(errors,[]);fs.mkdirSync('reports/toolkit',{recursive:true});fs.writeFileSync('reports/toolkit/tests.json',JSON.stringify({status:'PASS',passed,errors,rpc:'mocked for deterministic assertions'},null,2));
}finally{await browser.close();}
