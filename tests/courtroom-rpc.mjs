import {chromium} from 'playwright';
import {Interface} from 'ethers';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const browser=await chromium.launch({args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
const abi=new Interface(['function eval(uint256,bytes) view returns(bytes)']);
const errors=[],calls=[],passed=[];let mode='normal';
page.on('pageerror',e=>errors.push(e.message));
await page.route('https://rpc.xlayer.tech/**',async route=>{
  const data=route.request().postDataJSON(), captured=mode;calls.push(data);
  if(captured==='offline'){await route.abort('failed');return;}
  if(captured==='delay')await new Promise(r=>setTimeout(r,500));
  if(captured==='timeout')await new Promise(r=>setTimeout(r,6800));
  let result;
  if(data.method==='eth_chainId')result=captured==='wrongchain'?'0x01':'0xc4';
  else if(data.method==='eth_blockNumber')result='0x453';
  else if(data.method==='eth_call'){
    const parsed=abi.parseTransaction({data:data.params[0].data});
    assert.equal(Number(parsed.args[0]),1);assert.equal(data.params[1],'0x453');
    const n=parseInt(parsed.args[1].slice(2),16),deny=(n&1)&((n>>1)&1);
    const output=captured==='malformed'?'0x':captured==='outofrange'?'0x02':captured==='multibyte'?'0x0001':captured==='mismatch'?`0x0${1-deny}`:`0x0${deny}`;
    result=abi.encodeFunctionResult('eval',[output]);
  }else throw new Error('Unexpected RPC method '+data.method);
  try{await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({jsonrpc:'2.0',id:data.id,result})});}catch{/* timed-out request may already be closed */}
});
const event=()=>page.getByTestId('event-log').locator('.event').first();
const comparison=()=>event().getByTestId('court-comparison');
const request=async amount=>{await page.getByLabel('Withdrawal amount').fill(amount);await page.getByRole('button',{name:/Evaluate scenario/}).click();};
const reset=()=>page.getByRole('button',{name:/Reset demo/}).click();
const compare=()=>comparison().getByRole('button',{name:/Compare this request/}).click();
async function test(name,fn){await fn();passed.push(name);console.log('PASS',name);}
try{
 await page.goto(process.env.BASE_URL||'http://127.0.0.1:3000',{waitUntil:'networkidle'});
 await test('comparison is opt-in; local withdrawal performs no RPC',async()=>{await request('0.90');assert.equal(calls.length,0);assert.match(await event().innerText(),/0x03/);assert.match(await comparison().innerText(),/Not compared yet/);});
 await test('DENY compares captured input at a recorded block without altering balance',async()=>{await compare();await comparison().getByText('RPC returned DENY (1). Matches this request’s local prediction.',{exact:true}).waitFor();assert.match(await comparison().innerText(),/block 1107/);assert.match(await page.getByTestId('vault-balance').innerText(),/1.00/);assert.equal(abi.parseTransaction({data:calls.find(c=>c.method==='eth_call').params[0].data}).args[1],'0x03');});
 await test('ALLOW compares correct packed input and leaves already-applied accounting unchanged',async()=>{await request('0.05');await compare();await comparison().getByText('RPC returned ALLOW (0). Matches this request’s local prediction.',{exact:true}).waitFor();assert.match(await comparison().innerText(),/0x02/);assert.match(await page.getByTestId('vault-balance').innerText(),/0.95/);});
 await test('second request snapshot retains its pre-request spending',async()=>{await request('0.05');assert.match(await comparison().innerText(),/0.05 \+ 0.05/);await compare();await comparison().getByText(/Matches this request/).waitFor();assert.match(await page.getByTestId('daily-spent').innerText(),/0.10/);});
 await test('RPC mismatch is exposed without overriding local denial or accounting',async()=>{await request('0.01');mode='mismatch';await compare();await comparison().getByText(/Mismatch:/).waitFor();assert.match(await comparison().innerText(),/not verified/);assert.match(await page.getByTestId('vault-balance').innerText(),/0.90/);});
 for(const bad of ['malformed','outofrange','multibyte'])await test(bad+' output rejected',async()=>{mode=bad;await compare();await comparison().getByText(/Invalid output:/).waitFor();});
 await test('wrong-chain endpoint rejected before eval',async()=>{mode='wrongchain';const before=calls.filter(c=>c.method==='eth_call').length;await compare();await comparison().getByText(/RPC is not X Layer/).waitFor();assert.equal(calls.filter(c=>c.method==='eth_call').length,before);});
 await test('offline endpoint never implies verification',async()=>{mode='offline';await compare();await comparison().getByText(/No successful RPC result or fallback/).waitFor();});
 await test('timeout surfaces an error and allows retry',async()=>{mode='timeout';await compare();await comparison().getByText(/No successful RPC result or fallback/).waitFor({timeout:20000});mode='normal';await compare();await comparison().getByText(/RPC returned DENY/).waitFor();});
 await test('rapid duplicate comparison clicks make only one verification sequence',async()=>{mode='delay';const before=calls.length;await comparison().getByRole('button',{name:/Compare this request/}).evaluate(b=>{b.click();b.click();b.click();});await comparison().getByText(/RPC returned DENY/).waitFor();assert.equal(calls.length-before,3);mode='normal';});
 await test('pending old request cannot verify a newer request',async()=>{await reset();await request('0.90');mode='delay';await compare();await request('0.05');await page.getByTestId('event-log').locator('.event').nth(1).getByText(/RPC returned DENY/).waitFor();assert.match(await comparison().innerText(),/Not compared yet/);assert.match(await comparison().innerText(),/0x02/);mode='normal';});
 await test('reset discards pending response without contaminating new events',async()=>{mode='delay';await compare();await reset();await request('0.90');await page.waitForTimeout(2000);assert.equal(await page.getByTestId('court-comparison').count(),1);assert.match(await comparison().innerText(),/Not compared yet/);mode='normal';});
 await test('same-tick rapid withdrawals use sequential balances and allowance',async()=>{await reset();await page.getByLabel('Withdrawal amount').fill('0.05');await page.getByRole('button',{name:/Evaluate scenario/}).evaluate(b=>{b.click();b.click();b.click();});assert.match(await page.getByTestId('vault-balance').innerText(),/0.90/);assert.match(await page.getByTestId('daily-spent').innerText(),/0.10/);assert.match(await event().innerText(),/DENY/);});
 await test('deposits do not mutate historical request snapshots',async()=>{const captured=await comparison().innerText();await page.getByRole('button',{name:/Add 1 OKB to scenario/}).click();assert.equal(await page.getByTestId('court-comparison').first().innerText(),captured);assert.equal(await event().getByTestId('court-comparison').count(),0);});
 await test('UTC rollover resets current allowance but preserves prior-day evidence',async()=>{await page.clock.setFixedTime(new Date('2026-10-07T23:59:59Z'));await reset();await request('0.05');await request('0.05');await page.clock.setFixedTime(new Date('2026-10-08T00:00:01Z'));await request('0.05');assert.match(await comparison().innerText(),/0.00 \+ 0.05/);assert.match(await page.getByTestId('daily-spent').innerText(),/0.05/);await compare();assert.match(await comparison().innerText(),/0x02/);await comparison().getByText(/RPC returned ALLOW/).waitFor();await page.getByTestId('event-log').locator('.event').nth(1).getByRole('button',{name:/Compare this request/}).click();await page.getByTestId('event-log').locator('.event').nth(1).getByText(/captured UTC day 2026-10-07/).waitFor();});
 await test('insufficient balance is a local pre-check, not a fabricated circuit verdict',async()=>{await request('0.90');assert.match(await event().innerText(),/Insufficient demo balance/);assert.match(await event().innerText(),/Local pre-check failed/);assert.equal(await event().getByTestId('court-comparison').count(),0);});
 await test('read-only flow never sends transaction methods',async()=>{assert.ok(calls.every(c=>['eth_chainId','eth_blockNumber','eth_call'].includes(c.method)));});
 await test('new evidence panels fit mobile and desktop in both themes',async()=>{for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:900});for(let i=0;i<2;i++){await page.locator('.theme-toggle').click();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width}px overflow`);}}});
 assert.deepEqual(errors,[]);
 fs.mkdirSync('reports/courtroom-rpc',{recursive:true});fs.writeFileSync('reports/courtroom-rpc/tests.json',JSON.stringify({status:'PASS',passed,errors,rpc:'mocked for deterministic fault/race/day-boundary tests'},null,2));
}finally{await browser.close();}
