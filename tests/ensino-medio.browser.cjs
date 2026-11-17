// Run with a local server on port 8765 and Playwright installed.
const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{require('node:fs').mkdirSync('em-qa',{recursive:true});const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1365,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:8765/ensino-medio/');await page.waitForSelector('#plot polyline');
assert.equal(await page.locator('.skill').count(),43);assert.equal(await page.locator('#values tr').count(),9);
await page.locator('#search').fill('EM13MAT304');assert.equal(await page.locator('.skill:visible').count(),1);await page.locator('#expand').click();assert.equal(await page.locator('#EM13MAT304 > details').getAttribute('open'),'');
await page.emulateMedia({media:'print'});await page.pdf({path:'em-qa/ficha.pdf',format:'A4'});await page.emulateMedia({media:'screen'});
await page.locator('#clear').click();await page.locator('#block').selectOption('0');assert.equal(await page.locator('.skill:visible').count(),8);
await page.locator('#search').fill('não existe abc xyz');assert.equal(await page.locator('#empty').isVisible(),true);
await page.locator('#clear').click();await page.locator('#block').selectOption('2');assert.equal(await page.locator('.skill:visible').count(),11);
await page.locator('#family').selectOption('quadratic');await page.locator('#coef-a').fill('-1');await page.locator('#coef-b').fill('10');await page.locator('#x-min').fill('0');await page.locator('#x-max').fill('10');await page.locator('#function-form button').click();assert.match(await page.locator('#values').innerText(),/25/);
await page.locator('#family').selectOption('logarithmic');await page.locator('#base-q').fill('1');await page.locator('#function-form button').click();assert.match(await page.locator('#lab-status').innerText(),/diferente de 1/);assert.equal(await page.locator('#plot polyline').count(),0);
await page.locator('#base-q').fill('2');await page.locator('#function-form button').click();assert.equal(await page.locator('#plot polyline').count(),1);
await page.goto('http://127.0.0.1:8765/ensino-medio/#EM13MAT508');assert.equal(await page.locator('#EM13MAT508 > details').getAttribute('open'),'');
await page.setViewportSize({width:390,height:844});await page.goto('http://127.0.0.1:8765/ensino-medio/');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:'em-qa/mobile.png'});
await page.setViewportSize({width:1365,height:900});await page.screenshot({path:'em-qa/desktop.png'});
await page.goto('http://127.0.0.1:8765/jogos/circulo-quintas/?trilha=em');assert.equal(await page.locator('#trail-year').inputValue(),'5');assert.equal(await page.locator('body').evaluate(el=>el.classList.contains('guided')),false);
await page.goto('http://127.0.0.1:8765/jogos/circulo-quintas/');assert.equal(await page.locator('#trail-year').inputValue(),'0');
assert.deepEqual(errors,[]);console.log('Browser QA: filters, empty state, deep link, all function views, domain errors, print, mobile layout, music entry: PASS');await browser.close();})().catch(e=>{console.error(e);process.exitCode=1});
