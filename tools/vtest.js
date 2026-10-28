const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
// Video block + audio/video interplay. YouTube is stubbed, Rabt is routed to .testaudio (run make-test-audio.js once).
const ok=(c,m)=>console.log((c?'PASS ':'FAIL ')+m);
(async()=>{
  const b = await chromium.launch({args:['--host-resolver-rules=MAP site.test 127.0.0.1']});
  const ctx = await b.newContext({viewport:{width:1440,height:900}});
  // keep the real Rabt file out of this test: point it at the local long sample
  await ctx.route('https://play.rabt.host/**',r=>r.abort('connectionrefused'));  // behave like a listener abroad
  await ctx.route('https://player.rabt.space/**',r=>r.fulfill({status:302,headers:{location:'http://site.test:8767/.testaudio/long.mp3'}}));
  let yt=0; await ctx.route(/youtube/,r=>{yt++; r.fulfill({status:200,contentType:'text/html',body:'<html><body>yt stub</body></html>'});});
  const p = await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://site.test:8767/pages/episode.html',{waitUntil:'load'}); await p.waitForTimeout(800);
  ok(await p.isVisible('#ep-video .video.is-soon .video__soon'),'1 no id yet → poster with «ویدیو به‌زودی», no play button');
  ok(!(await p.$('#ep-video .video__play')),'1b no play button without an id');
  ok(yt===0,'2 nothing requested from YouTube on page load ('+yt+')');
  // simulate an id being filled in
  await p.evaluate(()=>{const e=Object.assign({},Jadval.ep(1),{video:'aqz-KE-bpKQ'});document.getElementById('ep-video').innerHTML=Jadval.videoHTML(e);});
  ok(await p.isVisible('#ep-video .video__play'),'3 with an id → play button shown');
  ok(yt===0,'3b still nothing from YouTube before the click ('+yt+')');
  // start audio, then the video: audio must pause
  await p.click('[data-fullplayer] [data-toggle]'); await p.waitForTimeout(2500);
  const icon1=await p.evaluate(()=>document.querySelector('[data-fullplayer] [data-toggle] span').className);
  ok(icon1==='pause-icon','4 audio playing ('+icon1+')');
  await p.click('#ep-video .video__play'); await p.waitForTimeout(1200);
  const src=await p.getAttribute('#ep-video iframe','src');
  ok(/^https:\/\/www\.youtube-nocookie\.com\/embed\/aqz-KE-bpKQ\?autoplay=1/.test(src||''),'5 click → youtube-nocookie iframe with autoplay: '+src);
  const icon2=await p.evaluate(()=>document.querySelector('[data-fullplayer] [data-toggle] span').className);
  ok(icon2==='play-icon','6 audio paused when video starts ('+icon2+')');
  // play audio again → pauseVideo is posted to the iframe
  await p.evaluate(()=>{const f=document.querySelector('#ep-video iframe');window.__sent=[];const w=f.contentWindow;const o=w.postMessage.bind(w);try{w.postMessage=function(m,t){window.__sent.push(m);};}catch(e){window.__sent.push('cross-origin');}});
  await p.click('[data-fullplayer] [data-toggle]'); await p.waitForTimeout(1500);
  const sent=await p.evaluate(()=>window.__sent);
  const iconPre=await p.evaluate(()=>document.querySelector('[data-fullplayer] [data-toggle] span').className);
  ok(iconPre==='pause-icon','6b audio plays again ('+iconPre+')');
  // a YouTube "playing" state message pauses the audio
  await p.evaluate(()=>window.dispatchEvent(new MessageEvent('message',{origin:'https://www.youtube-nocookie.com',data:JSON.stringify({event:'onStateChange',info:1})})));
  await p.waitForTimeout(600);
  const icon3=await p.evaluate(()=>document.querySelector('[data-fullplayer] [data-toggle] span').className);
  ok(icon3==='play-icon','7 video reporting «playing» pauses the audio ('+icon3+')');
  await p.click('[data-fullplayer] [data-toggle]'); await p.waitForTimeout(1500);
  await p.evaluate(()=>window.dispatchEvent(new MessageEvent('message',{origin:'https://evil.example',data:JSON.stringify({event:'onStateChange',info:1})})));
  await p.waitForTimeout(600);
  const icon4=await p.evaluate(()=>document.querySelector('[data-fullplayer] [data-toggle] span').className);
  ok(icon4==='pause-icon','7b the same message from another origin is ignored; audio keeps playing ('+icon4+')');
  await p.click('[data-fullplayer] [data-toggle]');
  // home page
  await p.goto('http://site.test:8767/pages/home.html',{waitUntil:'load'}); await p.waitForTimeout(800);
  ok(await p.isVisible('#home-video .video'),'8 home shows the video block');
  ok((await p.textContent('#listen-h'))==='کجا ببینیم و بشنویم؟','9 heading renamed');
  const names=await p.$$eval('#listen .listen__item strong',a=>a.map(x=>x.textContent));
  ok(names.join(',')==='یوتیوب,اسپاتیفای,اپل پادکست,کست‌باکس,فیدیبو','10 platforms: '+names.join('، '));
  const fnames=await p.$$eval('.site-footer .flink',a=>a.map(x=>x.textContent.trim()));
  ok(fnames.includes('Spotify')&&fnames.includes('YouTube'),'11 footer: '+fnames.join(', '));
  ok(await p.getAttribute('#listen .listen__item:nth-child(2)','href')==='https://open.spotify.com/show/6nDitoTOxK6xNQ3phc6gcu','11b Spotify links to the show');
  for (const w of [390,768]) { await p.setViewportSize({width:w,height:800}); await p.waitForTimeout(300); ok(await p.evaluate(()=>document.documentElement.scrollWidth)===w,'12 no horizontal scroll at '+w); }
  console.log('errors', JSON.stringify(errs));
  await b.close();
})();
