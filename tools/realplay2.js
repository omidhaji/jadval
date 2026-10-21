const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{
  const b = await chromium.launch({...(process.env.HTTPS_PROXY?{proxy:{server:process.env.HTTPS_PROXY,bypass:'site.test'}}:{}), args:['--host-resolver-rules=MAP site.test 127.0.0.1']});
  const p = await b.newPage({ignoreHTTPSErrors:true, viewport:{width:1440,height:900}});
  const st=()=>p.evaluate(()=>{const f=document.querySelector('[data-fullplayer]');const m=document.querySelector('.miniplayer');return {icon:f.querySelector('[data-toggle] span').className, el:f.querySelector('[data-elapsed]').textContent, status:m.querySelector('[data-status]').textContent}});
  await p.goto('http://site.test:8767/pages/episode.html',{waitUntil:'networkidle'});
  await p.click('[data-fullplayer] [data-toggle]');
  for (let i=0;i<30;i++){ await p.waitForTimeout(1000); const s=await st(); if (s.el!=='00:00') break; }
  console.log('playing?', JSON.stringify(await st()));
  await p.waitForTimeout(3000); console.log('3s later', JSON.stringify(await st()));
  await p.click('[data-fullplayer] [data-skip="30"]'); await p.waitForTimeout(3000);
  console.log('after +30', JSON.stringify(await st()));
  // seek on the timeline to ~50%
  const bar = await p.$('[data-fullplayer] .segs, [data-fullplayer] [role=slider]'); 
  if (bar){ const bb=await bar.boundingBox(); await p.mouse.click(bb.x+bb.width*0.5, bb.y+bb.height/2); await p.waitForTimeout(4000); console.log('after seek 50%', JSON.stringify(await st())); }
  await p.click('[data-fullplayer] [data-toggle]'); await p.waitForTimeout(1000);
  const a=JSON.stringify(await st()); await p.waitForTimeout(1500); console.log('paused', a, JSON.stringify(await st()));
  await b.close();
})();
