const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const B='http://site.test:8767/';
const ok=(c,m)=>console.log((c?'PASS ':'FAIL ')+m);
(async()=>{
const b=await chromium.launch({...(process.env.HTTPS_PROXY?{proxy:{server:process.env.HTTPS_PROXY,bypass:'site.test'}}:{}),args:['--autoplay-policy=user-gesture-required','--host-resolver-rules=MAP site.test 127.0.0.1']});
const ctx=await b.newContext({ignoreHTTPSErrors:true,viewport:{width:1440,height:900}});
// Rabt audio → a local file of similar length (keeps this long suite off the
// flaky sandbox network and out of the podcast's listen stats). The real
// network path is covered by realplay2.js.
let rabtHits=0;
await ctx.route('https://play.rabt.host/**',r=>r.abort('connectionrefused'));  // behave like a listener abroad
await ctx.route('https://player.rabt.space/**',r=>{rabtHits++;r.fulfill({status:302,headers:{location:'http://site.test:8767/.testaudio/long.mp3','access-control-allow-origin':'*'}});});
// Needs .testaudio/long.mp3: run  node tools/make-test-audio.js  once.
const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/fonts|ERR_TOO_MANY/.test(m.text()))errs.push(m.text())});
let mp3=0;p.on('request',r=>{if(r.url().includes('sample.mp3')||r.url().includes('rabt.space'))mp3++;});
const A=()=>p.evaluate(()=>{const a=[...document.querySelectorAll('audio')];return null});
const st=()=>p.evaluate(()=>{const s=JSON.parse(localStorage.getItem('jadval-player')||'{}');return s;});
const info=()=>p.evaluate(()=>{const m=document.querySelector('.miniplayer');return {open:m.classList.contains('is-open'),el:m.querySelector('[data-elapsed]').textContent,tot:m.querySelector('[data-total]').textContent,icon:m.querySelector('[data-toggle] span').className,status:m.querySelector('[data-status]').textContent,rate:m.querySelector('[data-rate]').textContent}});
await p.goto(B+'pages/home.html',{waitUntil:'load'});await p.evaluate(()=>localStorage.clear());await p.reload({waitUntil:'load'});await p.waitForTimeout(1000);
ok(mp3===0,'1 no audio fetched before a click (preload none) — requests: '+mp3);
ok(!(await info()).open,'1b mini hidden on first visit');
ok(await p.isVisible('.player-fab'),'1c floating button visible on first visit');
await p.click('.hero [data-play]');await p.waitForTimeout(2500);
let i=await info();
ok(i.open && i.icon==='pause-icon','2 hero play opens mini and shows pause icon '+JSON.stringify(i));
const heroLbl=await p.textContent('.hero [data-play-label]');ok(heroLbl==='توقف','2b hero button label -> توقف ('+heroLbl+')');
const t1=await p.evaluate(()=>document.querySelector('.miniplayer [data-elapsed]').textContent);
ok(i.tot==='01:30','2c total from real metadata '+i.tot);
await p.click('.miniplayer [data-toggle]');await p.waitForTimeout(1200);
const e1=(await info()).el;await p.waitForTimeout(1500);const e2=(await info()).el;
ok(e1===e2 && (await info()).icon==='play-icon','3 pause stops clock ('+e1+' '+e2+')');
const secsOf=s=>{const [m,x]=s.split(':');return +m*60+ +x};
const before=secsOf(e2);
await p.click('.miniplayer [data-skip="30"]');await p.waitForTimeout(300);
let after=secsOf((await info()).el);ok(after-before===30,'4 +30 skip ('+before+'→'+after+')');
await p.click('.miniplayer [data-skip="-15"]');await p.waitForTimeout(300);
let after2=secsOf((await info()).el);ok(after-after2===15,'4b −15 skip ('+after+'→'+after2+')');
await p.click('.miniplayer [data-rate]');await p.waitForTimeout(200);
const rate=await p.evaluate(()=>{return document.querySelector('.miniplayer [data-rate]').textContent});ok(rate==='۱٫۲۵×','5 rate cycle → '+rate);
// click segbar at 25% from the right (RTL)
const bar=await p.$('.miniplayer [data-seek]');const bb=await bar.boundingBox();
await p.mouse.click(bb.x+bb.width*0.25,bb.y+bb.height/2);await p.waitForTimeout(300);
let pos=secsOf((await info()).el);ok(Math.abs(pos-22)<=2,'6 click-seek at 25% from left → '+pos+'s of 90');
// drag
await p.mouse.move(bb.x+bb.width*0.25,bb.y+bb.height/2);await p.mouse.down();await p.mouse.move(bb.x+bb.width*0.5,bb.y+bb.height/2,{steps:5});await p.mouse.up();await p.waitForTimeout(300);
pos=secsOf((await info()).el);ok(Math.abs(pos-45)<=2,'6b drag-seek to 50% → '+pos);
await bar.focus();await p.keyboard.press('ArrowRight');await p.waitForTimeout(200);
let pos2=secsOf((await info()).el);ok(pos2-pos===5,'7 keyboard ArrowRight +5 ('+pos+'→'+pos2+')');
const aria=await bar.getAttribute('aria-valuenow');ok(+aria===pos2,'7b aria-valuenow '+aria);
// space toggles when focus on body
await p.evaluate(()=>document.activeElement.blur());await p.keyboard.press('Space');await p.waitForTimeout(1500);
ok((await info()).icon==='pause-icon','8 Space plays');
await p.keyboard.press('Space');await p.waitForTimeout(500);ok((await info()).icon==='play-icon','8b Space pauses');
// rapid toggles
for(let k=0;k<6;k++){await p.click('.miniplayer [data-toggle]');}
await p.waitForTimeout(1500);
const rapid=await info();ok(!rapid.status,'9 rapid toggles leave no error ('+rapid.icon+')');
if(rapid.icon==='pause-icon') await p.click('.miniplayer [data-toggle]');
await p.waitForTimeout(500);
const saved=await st();ok(saved.last===9 && saved.pos && saved.pos['9']>0,'10 position saved '+JSON.stringify(saved));
// navigate to episode page: restores paused, no autoplay
mp3=0;
await p.goto(B+'pages/episode.html',{waitUntil:'load'});await p.waitForTimeout(1500);
i=await info();ok(!i.open && await p.isVisible('.player-fab'),'11 after navigation player stays collapsed; floating button shown');
ok((await p.textContent('[data-fab-sym]'))==='Sp','11a floating button shows last episode Sp');
await p.click('.player-fab');await p.waitForTimeout(300);
i=await info();ok(i.open && i.icon==='play-icon' && i.el==='00:52','11d floating button opens mini paused at saved spot '+JSON.stringify(i));
ok(!(await p.isVisible('.player-fab')),'11e floating button hides while mini is open');
ok(mp3===0,'11b nothing fetched on restore ('+mp3+')');
// full player for ep1 idle while mini holds ep9
const fp=await p.evaluate(()=>({el:document.querySelector('[data-fullplayer] [data-elapsed]').textContent,tot:document.querySelector('[data-fullplayer] [data-total]').textContent}));
ok(fp.el==='00:00'&&fp.tot==='32:10','11c full player (ep1) idle while mini has ep9 '+JSON.stringify(fp));
// full player play → switches to real ep1 (Rabt audio) and plays
await p.click('[data-fullplayer] [data-toggle]');
let fp2;for(let k=0;k<30;k++){await p.waitForTimeout(1000);fp2=await p.evaluate(()=>({el:document.querySelector('[data-fullplayer] [data-elapsed]').textContent,tot:document.querySelector('[data-fullplayer] [data-total]').textContent,title:document.querySelector('.miniplayer [data-mini-title]').textContent,icon:document.querySelector('[data-fullplayer] [data-toggle] span').className}));if(secsOf(fp2.el)>=2)break;if(k===12&&await p.$('.miniplayer [data-retry]')){console.log('NOTE sandbox network dropped the audio request; pressing retry');await p.click('.miniplayer [data-retry]');}}
ok(fp2.icon==='pause-icon' && /بارون/.test(fp2.title) && secsOf(fp2.el)>=2,'12 full player switches to real ep1 and plays '+JSON.stringify(fp2));
ok(secsOf(fp2.tot)>=1925&&secsOf(fp2.tot)<=2100,'12b total from the real file (feed 32:10, plus any inserted ads) → '+fp2.tot);
// ended: seek near end
await p.evaluate(()=>{const s=document.querySelector('.miniplayer [data-seek]');});
await p.focus('[data-fullplayer] [data-seek]');await p.keyboard.press('End');await p.waitForTimeout(300);
await p.evaluate(()=>document.activeElement.blur());
let e=await info();
await p.waitForTimeout(6000);
e=await info();
ok(/تمام شد/.test(e.status),'13 End → ended state shows message: '+e.status);
const nextBtn=await p.$('.miniplayer [data-status] [data-play]');ok(!!nextBtn,'13b next-episode button offered');
await p.waitForTimeout(2500);e=await info();ok(e.icon==='play-icon','13c no auto-advance after ended ('+e.icon+')');
await nextBtn.click();await p.waitForTimeout(2000);
const t2=await p.textContent('.miniplayer [data-mini-title]');ok(/پیاز/.test(t2)&&(await info()).icon==='pause-icon','13d next button plays ep2: '+t2);
await p.click('.miniplayer [data-toggle]');
// share link
await ctx.grantPermissions(['clipboard-read','clipboard-write']);
let clip='';p.once('dialog',d=>{clip=d.defaultValue();d.dismiss();});
await p.click('[data-share-time]');await p.waitForTimeout(500);
if(!clip) clip=await p.evaluate(()=>navigator.clipboard?navigator.clipboard.readText():'');ok(/episode\.html\?t=\d+$/.test(clip),'14 share link copied: '+clip);
const dl=await p.getAttribute('[data-download]','href');ok(/^https:\/\/player\.rabt\.space\/.*\/play\.mp3$/.test(dl),'14b download href '+dl);
// ?t= cue
mp3=0;await p.goto(B+'pages/episode.html?t=780',{waitUntil:'load'});await p.waitForTimeout(1200);
i=await info();ok(/بارون/.test(await p.textContent('.miniplayer [data-mini-title]'))&&i.icon==='play-icon'&&mp3===0,'15 ?t= cues ep1 paused, no fetch ('+i.el+', '+mp3+')');
await p.click('[data-fullplayer] [data-toggle]');await p.waitForTimeout(6000);
const tq=await p.evaluate(()=>document.querySelector('[data-fullplayer] [data-elapsed]').textContent);ok(Math.abs(secsOf(tq)-780)<=8,'15b plays real audio from ?t=780 ('+tq+')');
await p.click('[data-fullplayer] [data-toggle]');
// error
await p.evaluate(()=>{Jadval.ep(7).audio='../assets/audio/missing.mp3';});
await p.goto(B+'pages/home.html',{waitUntil:'load'});
await p.evaluate(()=>{Jadval.ep(7).audio='../assets/audio/missing.mp3';});
await p.click('.rows [data-play="7"]');await p.waitForTimeout(2000);
e=await info();ok(/بارگذاری نشد/.test(e.status),'16 missing file → error state: '+e.status);
ok(!!(await p.$('.miniplayer [data-retry]')),'16b retry button shown');
// close
await p.click('.miniplayer [data-close]');await p.waitForTimeout(300);
await p.evaluate(()=>scrollTo(0,0));await p.waitForTimeout(500);ok(!(await info()).open && await p.isVisible('.player-fab'),'17 close collapses to floating button');
await p.reload({waitUntil:'load'});await p.waitForTimeout(800);ok(!(await info()).open,'17b stays closed after reload');
{const c2=await b.newContext({ignoreHTTPSErrors:true,viewport:{width:1440,height:900}});const q=await c2.newPage();await q.goto(B+'pages/home.html',{waitUntil:'load'});await q.waitForTimeout(800);await q.click('.player-fab');await q.waitForTimeout(300);const t=await q.textContent('.miniplayer [data-mini-title]');ok(await q.evaluate(()=>document.querySelector('.miniplayer').classList.contains('is-open'))&&/صابون/.test(t),'17c floating button with no history opens latest episode ('+t+')');await c2.close();}
// mobile
const m=await ctx.newPage();await m.setViewportSize({width:390,height:844});
await m.goto(B+'pages/home.html',{waitUntil:'load'});await m.waitForTimeout(800);
await m.click('.card [data-play]');await m.waitForTimeout(2000);
await m.screenshot({path:'pt-mobile.png'});
ok(await m.evaluate(()=>document.documentElement.scrollWidth)===390,'18 mobile no horizontal scroll');
console.log('rabt url requested', rabtHits, 'times');console.log('ERRORS:',JSON.stringify(errs));
await b.close();})();
