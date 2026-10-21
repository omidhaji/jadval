// Builds /.testaudio/long.mp3 (~34 min, the sample repeated) for ptest.js,
// so the long test suite never plays the real episode on Rabt (keeps listen stats clean).
const fs=require('fs'),path=require('path');
const proj=path.join(__dirname,'..');
const d=fs.readFileSync(path.join(proj,'assets/audio/sample.mp3'));
fs.mkdirSync(path.join(proj,'.testaudio'),{recursive:true});
fs.writeFileSync(path.join(proj,'.testaudio/long.mp3'),Buffer.concat(Array(23).fill(d)));
console.log('ok');
