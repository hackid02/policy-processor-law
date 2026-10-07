async function request(amount){await page.getByLabel('Withdrawal amount').fill(amount);await page.getByRole('button',{name:/Evaluate scenario/}).click();}
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const base = process.env.BASE_URL || 'http://127.0.0.1:3000';
const browser = await chromium.launch({args:['--no-sandbox']});
const page = await browser.newPage();
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
try {
  await page.goto(base);
  await page.getByRole('heading',{name:'Law Cards',exact:true}).waitFor();
  assert.equal(await page.locator('.law-book').count(),1);
  assert.equal(await page.locator('.rule-card').count(),5);
  assert.match(await page.locator('.future-work').innerText(),/Not deployed/);
  await page.getByRole('button',{name:'Switch to light mode'}).click();
  await page.reload();
  await page.getByRole('button',{name:'Switch to dark mode'}).waitFor();
  assert.ok(await page.locator('main').evaluate(e=>e.classList.contains('light')));
  console.log('PASS original book, five deployed-card layout and persistent light theme');
  await page.locator('.evidence-details>summary').click();
  await page.getByRole('heading',{name:'Deployment evidence',exact:true}).waitFor();
  await page.locator('.adapter>summary').click();
  assert.ok(await page.locator('.adapter').getAttribute('open') !== null);
  console.log('PASS evidence and adapter disclosures expand');
  for (const width of [320,390,768,1024,1440]) {
    await page.setViewportSize({width,height:900});
    for (const theme of ['light','dark']) {
      const current = await page.locator('main').evaluate(e=>e.classList.contains('light')?'light':'dark');
      if (current !== theme) await page.locator('.theme-toggle').click();
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width}px ${theme} overflow`);
      assert.ok(await page.locator('.theme-toggle').isVisible());
    }
    console.log(`PASS ${width}px: dark/light layout without horizontal overflow`);
  }
  await page.locator('.evidence-details>summary').click();
  await page.locator('.adapter>summary').click();
  await page.setViewportSize({width:1440,height:1000});
  await page.evaluate(()=>{document.documentElement.style.scrollBehavior='auto';scrollTo(0,0);});
  fs.mkdirSync('reports/website-review',{recursive:true});
  await page.screenshot({path:'reports/website-review/desktop.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:'reports/website-review/mobile.png',fullPage:true});
  await page.locator('.theme-toggle').click();
  await page.screenshot({path:'reports/website-review/mobile-light.png',fullPage:true});
  await page.reload();
  await page.getByRole('button',{name:'Switch to dark mode'}).waitFor();
  await page.locator('.theme-toggle').click();
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await page.locator('.law-book').evaluate(e=>getComputedStyle(e).transform),'none');
  console.log('PASS reduced-motion preference');
  await page.getByRole('link',{name:'Open Courtroom'}).click();
  await request('0.90');
  assert.match(await page.getByTestId('event-log').innerText(),/DENY/);
  console.log('PASS mobile Courtroom navigation and withdrawal');
  assert.deepEqual(errors,[]);
  console.log('PASS no client runtime errors');
  await page.getByRole('button',{name:'Start guided walkthrough',exact:true}).click();
  assert.match(await page.getByTestId('vault-balance').innerText(),/1.00/);
  const expected = [['0.90','DENY','0.10'],['0.05','ALLOW','0.05'],['0.05','ALLOW','0.00'],['0.01','DENY','0.00']];
  for (let i=0;i<expected.length;i++) {
    const [amount, verdict, remaining] = expected[i];
    await page.getByRole('button',{name:`Step ${i+1}: request ${amount} OKB`,exact:true}).click();
    const event=await page.getByTestId('event-log').locator('.event').first().innerText();
    assert.ok(event.includes(verdict));
    assert.ok(event.includes(`Allowance after this request: ${remaining} OKB`));
  }
  assert.match(await page.getByTestId('guided-demo').innerText(),/Walkthrough complete/);
  console.log('PASS guided sequence executes actual demo logic and captures each remaining allowance');
  await page.getByRole('button',{name:'Replay walkthrough',exact:true}).click();
  assert.match(await page.getByTestId('daily-spent').innerText(),/0.00/);
  await request('0.05');
  await page.getByRole('button',{name:'Start guided walkthrough',exact:true}).waitFor();
  console.log('PASS replay resets demo and manual actions leave guided mode');
  const links=page.locator('.receipt-links a');
  assert.equal(await links.count(),7);
  for (const a of await links.all()) assert.match(await a.getAttribute('href'),/^https:\/\/www\.oklink\.com\/x-layer\/evm\/tx\/0x[0-9a-f]{64}$/);
  assert.ok(await page.getByRole('heading',{name:'Verify the deployment',exact:true}).isVisible());
  console.log('PASS visible evidence and seven well-formed recorded transaction links');
  assert.deepEqual(errors,[]);
} finally { await browser.close(); }
