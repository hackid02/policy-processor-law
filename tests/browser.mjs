import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { Interface } from 'ethers';
const URL=process.env.BASE_URL||'http://127.0.0.1:3000';
const browser=await chromium.launch({args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const failures=[];const passed=[];
page.on('pageerror',e=>failures.push(e.message));
let mode='normal',wait=0;
const abi=new Interface(['function eval(uint256,bytes) view returns(bytes)']);
await page.route('https://rpc.xlayer.tech/**',async route=>{
 const request=route.request().postDataJSON();
 if(mode==='offline'){await route.abort('failed');return;}
 if(wait)await new Promise(r=>setTimeout(r,wait));
 let result;
 if(request.method==='eth_chainId')result=mode==='wrongchain'?'0x01':'0xc4';
 else if(request.method==='eth_call'){
  const parsed=abi.parseTransaction({data:request.params[0].data});const id=Number(parsed.args[0]),n=parseInt(parsed.args[1].slice(2),16);
  const b=k=>(n>>k)&1;let output=id===1?(b(0)&b(1)):id===2?Number(b(0)+b(1)+b(2)>=2):id===3?((b(2)&b(3))|((b(2)|b(3))&b(0)&b(1))):id===4?((1-b(0))|(b(1)&b(2))):((b(0)&b(1))|Number(b(2)+b(3)+b(4)<2));
  const bytes=mode==='malformed'?'0x':mode==='mismatch'?'0x00':`0x0${output}`;
  result=abi.encodeFunctionResult('eval',[bytes]);
 }else result='0x0';
 await route.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify({jsonrpc:'2.0',id:request.id,result})});
});
async function run(name,fn){await fn();passed.push(name);console.log('PASS',name);}
try{
 await page.goto(URL,{waitUntil:'networkidle'});
 await run('page loads without runtime errors',async()=>{await page.getByRole('heading',{name:'Law Cards',exact:true}).waitFor();assert.deepEqual(failures,[]);});
 const spend=page.getByTestId('card-spend');
 await run('SpendLimit uses local result and correct bit packing',async()=>{await page.getByRole('button',{name:'ah = 0',exact:true}).click();await page.getByRole('button',{name:'dh = 0',exact:true}).click();assert.match(await spend.innerText(),/0x03/);assert.match(await spend.innerText(),/DENY/);assert.match(await spend.innerText(),/LOCAL MODEL/);});
 await run('actual RPC result is rendered separately from local prediction',async()=>{await spend.getByRole('button').click();await spend.getByText('RPC returned DENY (1). Matches local model.',{exact:true}).waitFor();});
 await run('input changes invalidate previous verification',async()=>{await page.getByRole('button',{name:'ah = 1',exact:true}).click();await spend.getByText('Current input has not been checked against RPC.',{exact:true}).waitFor();});
 await run('stale async response cannot mark a new input verified',async()=>{wait=300;await spend.getByRole('button').click();await page.getByRole('button',{name:'dh = 1',exact:true}).click();await page.waitForTimeout(800);assert.match(await spend.innerText(),/has not been checked/);wait=0;});
 await run('RPC/local mismatch is shown, not hidden',async()=>{await page.getByRole('button',{name:'ah = 0',exact:true}).click();await page.getByRole('button',{name:'dh = 0',exact:true}).click();mode='mismatch';await spend.getByRole('button').click();await spend.getByText('Mismatch:',{exact:false}).waitFor();});
 await run('malformed RPC result fails closed',async()=>{mode='malformed';await spend.getByRole('button').click();await spend.getByText('Invalid output:',{exact:false}).waitFor();});
 await run('wrong-chain RPC rejected',async()=>{mode='wrongchain';await spend.getByRole('button').click();await spend.getByText('RPC is not X Layer',{exact:false}).waitFor();});
 await run('offline RPC does not pretend to be live',async()=>{mode='offline';await spend.getByRole('button').click();await spend.getByText('Not verified.',{exact:false}).waitFor();assert.match(await spend.innerText(),/No successful RPC result is assumed/);mode='normal';});
 await run('Quorum output 1 is labelled PASS',async()=>{const q=page.getByTestId('card-quorum');await q.getByRole('button').click();await q.getByText('RPC returned PASS (1). Matches local model.',{exact:true}).waitFor();});
 await run('first 0.90 request denied with 1.00 balance unchanged',async()=>{await page.getByRole('button',{name:'Request 0.90 OKB',exact:true}).click();assert.match(await page.getByTestId('event-log').innerText(),/DENY/);assert.match(await page.getByTestId('vault-balance').innerText(),/1.00/);});
 await run('two 0.05 requests allowed; next 0.01 denied',async()=>{await page.getByRole('button',{name:'Request 0.05 OKB',exact:true}).click();await page.getByRole('button',{name:'Request 0.05 OKB',exact:true}).click();assert.match(await page.getByTestId('vault-balance').innerText(),/0.90/);assert.match(await page.getByTestId('daily-spent').innerText(),/0.10/);await page.getByRole('button',{name:'Request 0.01 OKB',exact:true}).click();const first=page.getByTestId('event-log').locator('.event').first();assert.match(await first.innerText(),/DENY/);assert.match(await first.innerText(),/0x03/);});
 await run('deposit cannot refill daily allowance',async()=>{await page.getByRole('button',{name:/Deposit 1 OKB/}).click();assert.match(await page.getByTestId('vault-balance').innerText(),/1.90/);assert.match(await page.getByTestId('daily-remaining').innerText(),/0.00/);});
 await run('demo reset clears outflow and events',async()=>{await page.getByRole('button',{name:/Reset demo/}).click();assert.match(await page.getByTestId('vault-balance').innerText(),/1.00/);assert.match(await page.getByTestId('daily-spent').innerText(),/0.00/);assert.match(await page.getByTestId('event-log').innerText(),/Start with a request/);});
 await run('legacy vault route redirects to truthful homepage',async()=>{await page.goto(URL+'/vault');await page.getByRole('heading',{name:'Courtroom',exact:true}).waitFor();assert.equal(new globalThis.URL(page.url()).pathname,'/');});
 await run('legacy misleading static demo is unavailable',async()=>{const r=await page.request.get(URL+'/old-demo.html');assert.equal(r.status(),404);});
 await page.goto(URL);await page.screenshot({path:'reports/desktop.jpg',fullPage:true,type:'jpeg',quality:65});
 await run('desktop has no horizontal overflow',async()=>{assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));});
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:'reports/mobile.jpg',fullPage:true,type:'jpeg',quality:60});
 await run('mobile has no horizontal overflow',async()=>{assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));});
 assert.deepEqual(failures,[]);
 fs.writeFileSync('reports/browser-tests.json',JSON.stringify({status:'PASS',passed,errors:failures,rpc:'mocked for deterministic error and race tests; mainnet verified separately'},null,2));
}catch(error){fs.writeFileSync('reports/browser-tests.json',JSON.stringify({status:'FAIL',passed,errors:[...failures,String(error)]},null,2));throw error;}
finally{await browser.close();}
