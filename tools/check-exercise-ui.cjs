const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES ? process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright' : 'playwright');
const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..');const errors=[];
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE || undefined,headless:true,args:['--no-sandbox']});
 const context=await browser.newContext({viewport:{width:1365,height:950}});
 await context.route('https://exercise.test/**',async route=>{
  let pathname=decodeURIComponent(new URL(route.request().url()).pathname);if(pathname.endsWith('/'))pathname+='index.html';
  const file=path.join(root,pathname);if(!file.startsWith(root+path.sep))return route.fulfill({status:403,body:'Forbidden'});
  if(!fs.existsSync(file))return route.fulfill({status:404,body:'Not found'});
  const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml'}[path.extname(file)]||'application/octet-stream';
  await route.fulfill({status:200,contentType:mime,body:fs.readFileSync(file)});
 });
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto('https://exercise.test/professor/listas/');
 await page.waitForSelector('.worksheet');
 const skillCodes=await page.evaluate(()=>EXERCISE_BANK.map(s=>s.code));
 // Every skill and every list renders through the actual UI; inspect answers too.
 for(const code of skillCodes){
  await page.goto(`https://exercise.test/professor/listas/?habilidade=${code}&lista=1`);
  for(let list=1;list<=5;list++){
   await page.locator(`[data-list-number="${list}"]`).click();
   assert.equal(await page.locator('#worksheet .question').count(),5,`${code}/${list}`);
   assert.equal(await page.locator('#answer-key').isVisible(),false);
   await page.locator('#answer-toggle').click();
   assert.equal(await page.locator('#answer-key li').count(),5);
   assert.equal(await page.locator('#answer-key').isVisible(),true);
   assert.equal(await page.locator(`[data-list-number="${list}"]`).getAttribute('aria-pressed'),'true');
  }
 }
 await page.goto('https://exercise.test/professor/listas/?habilidade=EF04MA17&lista=3');
 await page.screenshot({path:'/tmp/exercises-desktop.png',fullPage:true});
 await page.locator('#guide-link').click();
 assert.equal(await page.locator('#skill').inputValue(),'1'); // EF04MA17 is second grade-4 geometry skill.
 await page.locator('.exercise-link a').click();
 assert.equal(await page.locator('#skill').inputValue(),'EF04MA17');
 await page.locator('#area').selectOption('algebra');
 assert.equal(await page.locator('#skill').inputValue(),'EF04MA11');
 await page.locator('#year').selectOption('5');
 await page.locator('#skill').selectOption('EF05MA13');
 await page.locator('[data-list-number="4"]').click();
 await page.goBack();assert.equal(await page.locator('[data-list-number="3"]').getAttribute('aria-pressed'),'false');
 assert.equal(await page.locator('[data-list-number="1"]').getAttribute('aria-pressed'),'true');
 await page.goto('https://exercise.test/professor/listas/?habilidade=EF01MA10&lista=2');
 await page.evaluate(()=>window.print=()=>{window.__printCalls=(window.__printCalls||0)+1});
 await page.locator('#answer-toggle').click();
 await page.locator('#print-one').click();
 assert.equal(await page.locator('#print-root .question').count(),5);
 assert.equal(await page.locator('#print-root .answer-key').count(),0);
 await page.emulateMedia({media:'print'});
 await page.pdf({path:'/tmp/exercises-student.pdf',preferCSSPageSize:true,printBackground:true});
 assert.equal(await page.locator('main').isVisible(),false);
 await page.emulateMedia({media:'screen'});
 await page.locator('#print-all').click();
 assert.equal(await page.locator('#print-root .worksheet').count(),5);
 assert.equal(await page.locator('#print-root .question').count(),25);
 await page.emulateMedia({media:'print'});
 await page.pdf({path:'/tmp/exercises-five.pdf',preferCSSPageSize:true,printBackground:true});
 await page.emulateMedia({media:'screen'});
 await page.locator('#print-key').click();
 assert.equal(await page.locator('#print-root .answer-key').count(),1);
 assert.equal(await page.locator('#print-root .question').count(),0);
 await page.emulateMedia({media:'print'});
 await page.pdf({path:'/tmp/exercises-key.pdf',preferCSSPageSize:true,printBackground:true});
 await page.emulateMedia({media:'screen'});
 await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));
 assert.equal(await page.locator('#print-root .question').count(),5);
 await page.setViewportSize({width:390,height:844});
 for(const code of ['EF01MA09','EF03MA14','EF05MA18']){
  await page.goto(`https://exercise.test/professor/listas/?habilidade=${code}&lista=5`);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),`mobile overflow ${code}`);
 }
 await page.screenshot({path:'/tmp/exercises-mobile.png',fullPage:true});
 await page.goto('https://exercise.test/professor/listas/?habilidade=invalid&lista=-5');
 assert.equal(await page.locator('#skill').inputValue(),'EF01MA09');
 assert.equal(await page.locator('[data-list-number="1"]').getAttribute('aria-pressed'),'true');
 await page.goto('https://exercise.test/professor/');await page.getByRole('link',{name:'Abrir listas de exercícios'}).click();
 assert.equal(await page.locator('#worksheet .question').count(),5);
 assert.deepEqual(errors,[]);
 console.log('PASS: 190 listas renderizadas, 950 questões e 950 respostas; filtros, gabaritos, links ida/volta, histórico, impressão aluno/5 listas/gabarito, URL inválida, mobile 390px; zero erros JS.');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
