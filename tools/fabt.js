const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const ok=(c,m)=>console.log((c?'PASS ':'FAIL ')+m);
(async()=>{const b=await chromium.launch();
for (const [w,h] of [[1440,900],[390,844]]){
const p=await b.newPage({ignoreHTTPSErrors:true,viewport:{width:w,height:h}});
await p.goto('http://localhost:8767/pages/home.html',{waitUntil:'load'});await p.waitForTimeout(1200);
const vis=()=>p.evaluate(()=>{const f=document.querySelector('.player-fab');return getComputedStyle(f).visibility==='visible'&&getComputedStyle(f).opacity==='1'});
ok(await vis(),w+' top: button visible');
const band=await p.evaluate(()=>document.querySelector('[data-fab-stop]').getBoundingClientRect().top+scrollY);
await p.evaluate(y=>scrollTo(0,y),band-h-40);await p.waitForTimeout(600);ok(await vis(),w+' just above newsletter: visible');
await p.evaluate(y=>scrollTo(0,y),band-h+200);await p.waitForTimeout(600);ok(!(await vis()),w+' newsletter in view: hidden');
if(w===1440) await p.screenshot({path:'fab-away.png'});
await p.evaluate(()=>scrollTo(0,document.body.scrollHeight));await p.waitForTimeout(600);ok(!(await vis()),w+' footer: hidden');
await p.evaluate(()=>scrollTo(0,0));await p.waitForTimeout(600);ok(await vis(),w+' back to top: visible again');
await p.goto('http://localhost:8767/pages/episode.html',{waitUntil:'load'});await p.waitForTimeout(800);
ok(await vis(),w+' episode page top: visible');
await p.evaluate(()=>scrollTo(0,document.body.scrollHeight));await p.waitForTimeout(600);ok(!(await vis()),w+' episode page footer: hidden');
await p.close();}
await b.close();})();
