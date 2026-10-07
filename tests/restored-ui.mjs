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
  assert.equal(await page.locator('.rule-card').count(),6);
  assert.match(await page.locator('.concept-card').innerText(),/Not deployed/);
  await page.getByRole('button',{name:'Switch to light mode'}).click();
  await page.reload();
  await page.getByRole('button',{name:'Switch to dark mode'}).waitFor();
  assert.ok(await page.locator('main').evaluate(e=>e.classList.contains('light')));
  console.log('PASS original book, six-card layout and persistent light theme');
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
  await page.evaluate(()=>scrollTo(0,0));
  fs.mkdirSync('reports/ui-restoration',{recursive:true});
  await page.screenshot({path:'reports/ui-restoration/desktop.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:'reports/ui-restoration/mobile.png',fullPage:true});
  await page.locator('.theme-toggle').click();
  await page.screenshot({path:'reports/ui-restoration/mobile-light.png',fullPage:true});
  await page.reload();
  await page.getByRole('button',{name:'Switch to dark mode'}).waitFor();
  await page.locator('.theme-toggle').click();
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await page.locator('.law-book').evaluate(e=>getComputedStyle(e).transform),'none');
  console.log('PASS reduced-motion preference');
  await page.getByRole('link',{name:'Open Courtroom'}).click();
  await page.getByRole('button',{name:'Request 0.90 OKB',exact:true}).click();
  assert.match(await page.getByTestId('event-log').innerText(),/DENY/);
  console.log('PASS mobile Courtroom navigation and withdrawal');
  assert.deepEqual(errors,[]);
  console.log('PASS no client runtime errors');
} finally { await browser.close(); }
