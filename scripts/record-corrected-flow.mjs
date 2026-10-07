// Record the actual corrected local UI. No application state or verdict overrides.
import { chromium } from 'playwright';
import fs from 'node:fs';
const browser=await chromium.launch({args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:1440,height:900},recordVideo:{dir:'reports/capture',size:{width:1440,height:900}}});
const page=await context.newPage();await page.goto(process.env.BASE_URL||'http://127.0.0.1:3000',{waitUntil:'networkidle'});
await page.addStyleTag({content:'header{position:relative!important}html{scroll-behavior:auto!important}'});
await page.locator('#courtroom').evaluate(e=>window.scrollTo(0,e.getBoundingClientRect().top+scrollY-25));
await page.evaluate(()=>{
 const pointer=document.createElement('div');pointer.style='position:fixed;z-index:99;left:60px;top:40px;pointer-events:none;width:25px;height:30px';pointer.innerHTML='<svg width="25" height="30"><path d="M2 2L2 24L9 18L14 28L19 25L13 16L23 16Z" fill="white" stroke="#111" stroke-width="2"/></svg>';document.documentElement.append(pointer);document.addEventListener('mousemove',e=>{pointer.style.left=e.clientX+'px';pointer.style.top=e.clientY+'px'});
 const banner=document.createElement('div');banner.style='position:fixed;bottom:0;left:0;right:0;padding:14px 25px;background:#0a0a0b;color:#e6e8eb;border-top:1px solid #45454d;font:13px monospace;z-index:98';banner.textContent='CORRECTED FLOW • BROWSER SIMULATION • NO FUNDS MOVED • LOCAL PATCH';document.body.append(banner);
});
const start=Date.now();
async function at(t,name){await page.waitForTimeout(Math.max(0,t*1000-(Date.now()-start)));const el=page.getByRole('button',{name,exact:true});const b=await el.boundingBox();await page.mouse.move(b.x+b.width/2,b.y+b.height/2,{steps:8});await el.click();}
await at(4,'Request 0.90 OKB');await at(10,'Request 0.05 OKB');await at(16,'Request 0.05 OKB');await at(22,'Request 0.01 OKB');
await page.waitForTimeout(5000);
await context.close();fs.renameSync(await page.video().path(),'reports/corrected-flow.webm');await browser.close();console.log('Recorded corrected flow.');
