// Audio host fallback: Iran (Cloudflare blocked), abroad (Iranian servers refuse or hang),
// both down, remembered host, position kept across a switch. Rabt is simulated locally
// (run make-test-audio.js once); nothing reaches the real Rabt servers.
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
const B='http://site.test:8767/';
const LOCAL={status:302,headers:{location:B+'.testaudio/long.mp3'}};
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m); if(!c) process.exitCode=1;};
(async()=>{
const b=await chromium.launch({args:['--host-resolver-rules=MAP site.test 127.0.0.1']});
async function run(name, ir, world, fn){
  const ctx=await b.newContext({viewport:{width:1440,height:900}});
  const hits={ir:0,world:0};
  await ctx.route('https://play.rabt.host/**',r=>{hits.ir++; ir(r);});
  await ctx.route('https://player.rabt.space/**',r=>{hits.world++; world(r);});
  const p=await ctx.newPage();
  const st=()=>p.evaluate(()=>{const f=document.querySelector('[data-fullplayer]');const m=document.querySelector('.miniplayer');return {icon:f.querySelector('[data-toggle] span').className,el:f.querySelector('[data-elapsed]').textContent,status:m.querySelector('[data-status]').textContent,host:(JSON.parse(localStorage.getItem('jadval-player')||'{}')).host||''};});
  const waitPlaying=async(max)=>{for(let k=0;k<max;k++){await p.waitForTimeout(500);const s=await st();if(s.icon==='pause-icon'&&s.el!=='00:00'&&!/بارگذاری/.test(s.status))return s;}return st();};
  await fn(p,st,waitPlaying,hits,ctx); await ctx.close();
}
const go=(p,q)=>p.goto(B+'pages/episode.html'+(q||''),{waitUntil:'load'}).then(()=>p.waitForTimeout(500));
const toggle=p=>p.click('[data-fullplayer] [data-toggle]');
const secsOf=s=>{const [m,x]=s.split(':');return +m*60+ +x};

await run('iran', r=>r.fulfill(LOCAL), r=>r.abort('connectionrefused'), async(p,st,wp,hits)=>{
  await go(p); ok(hits.ir+hits.world===0,'1 nothing fetched before a click');
  await toggle(p); const s=await wp(20);
  ok(s.icon==='pause-icon'&&secsOf(s.el)>0,'2 Iran: plays from play.rabt.host '+JSON.stringify(s));
  ok(hits.ir>0&&hits.world===0,'2b Iran: Cloudflare never tried (ir '+hits.ir+', world '+hits.world+')');
  ok(s.host==='play.rabt.host','2c remembers play.rabt.host');
});

await run('abroad-refused', r=>r.abort('connectionrefused'), r=>r.fulfill(LOCAL), async(p,st,wp,hits,ctx)=>{
  await go(p); const t0=Date.now(); await toggle(p); const s=await wp(20);
  ok(s.icon==='pause-icon'&&secsOf(s.el)>0&&!s.status,'3 abroad (refused): falls back and plays, no error '+JSON.stringify(s)+' in '+(Date.now()-t0)+'ms');
  ok(hits.ir>0&&hits.world>0,'3b tried Iran first, then Cloudflare (ir '+hits.ir+', world '+hits.world+')');
  ok(s.host==='player.rabt.space','3c remembers player.rabt.space');
  await toggle(p); await p.waitForTimeout(500);
  hits.ir=0;hits.world=0;
  const q=await ctx.newPage(); await q.goto(B+'pages/episode.html',{waitUntil:'load'}); await q.waitForTimeout(500);
  await q.click('[data-fullplayer] [data-toggle]'); await q.waitForTimeout(2500);
  ok(hits.ir===0&&hits.world>0,'4 next visit goes straight to the remembered host (ir '+hits.ir+', world '+hits.world+')');
  const dl=await q.getAttribute('[data-download]','href'); ok(/player\.rabt\.space/.test(dl),'4b download link uses the host that works: '+dl);
});

await run('abroad-hang', r=>{/* never answers */}, r=>r.fulfill(LOCAL), async(p,st,wp,hits)=>{
  await go(p); const t0=Date.now(); await toggle(p); const s=await wp(40); const ms=Date.now()-t0;
  ok(s.icon==='pause-icon'&&secsOf(s.el)>0,'5 abroad (Iranian host hangs): falls back after the wait and plays ('+ms+'ms) '+JSON.stringify(s));
  ok(ms>=7500&&ms<16000,'5b fallback waited about 8 s ('+ms+'ms)');
});

await run('position', r=>r.abort('connectionrefused'), r=>r.fulfill(LOCAL), async(p,st,wp)=>{
  await go(p,'?t=600'); await toggle(p); const s=await wp(20);
  ok(Math.abs(secsOf(s.el)-600)<=5,'6 position kept across the switch (?t=600 → '+s.el+')');
});

await run('both-down', r=>r.abort('connectionrefused'), r=>r.abort('connectionrefused'), async(p,st,wp,hits)=>{
  await go(p); await toggle(p); await p.waitForTimeout(3000); const s=await st();
  ok(/بارگذاری نشد/.test(s.status)&&!!(await p.$('.miniplayer [data-retry]')),'7 both hosts down → error with retry: '+s.status);
  const before=hits.ir+hits.world; await p.click('.miniplayer [data-retry]'); await p.waitForTimeout(2500);
  ok(hits.ir+hits.world>before,'7b retry tries the hosts again');
});

await run('pause-while-loading', r=>{/* hangs */}, r=>r.fulfill(LOCAL), async(p,st,wp,hits)=>{
  await go(p); await toggle(p); await p.waitForTimeout(1000); await toggle(p); await p.waitForTimeout(9000);
  const s=await st(); ok(s.icon==='play-icon'&&hits.world===0,'8 pausing while loading cancels the fallback (no surprise playback) '+JSON.stringify(s)+' world '+hits.world);
});
await b.close();
})();
