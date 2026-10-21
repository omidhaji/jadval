// Tiny static server with HTTP Range support (like GitHub Pages / Acast CDN).
const http=require('http'),fs=require('fs'),path=require('path');
// Usage: node rserve.js [project folder]  →  http://localhost:8767/
const root=path.resolve(process.argv[2]||path.join(__dirname,'..'));
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.mp3':'audio/mpeg','.png':'image/png','.jpg':'image/jpeg'};
http.createServer((req,res)=>{
  let p=decodeURIComponent(req.url.split('?')[0]); if(p.endsWith('/')) p+='index.html';
  const f=path.join(root,p);
  fs.stat(f,(err,st)=>{
    if(err){res.writeHead(404);return res.end('nf');}
    const type=types[path.extname(f)]||'application/octet-stream';
    const r=req.headers.range&&/bytes=(\d*)-(\d*)/.exec(req.headers.range);
    if(r){const s=r[1]?+r[1]:0,e=r[2]?+r[2]:st.size-1;
      res.writeHead(206,{'Content-Type':type,'Content-Range':`bytes ${s}-${e}/${st.size}`,'Accept-Ranges':'bytes','Content-Length':e-s+1});
      return fs.createReadStream(f,{start:s,end:e}).pipe(res);}
    res.writeHead(200,{'Content-Type':type,'Content-Length':st.size,'Accept-Ranges':'bytes'});fs.createReadStream(f).pipe(res);
  });
}).listen(8767,()=>console.log('ready'));
