const { chromium } = require('playwright'); const http=require('http'),fs=require('fs'),path=require('path');
const srv=http.createServer((q,s)=>{const f=path.join(__dirname,decodeURIComponent(q.url.split('?')[0]));fs.readFile(f,(e,d)=>{if(e){s.writeHead(404);return s.end();}s.writeHead(200,{'content-type':f.endsWith('.js')?'text/javascript':'text/html'});s.end(d);});}).listen(8766);
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:1024,height:1024}}); p.on('console',m=>console.log('console',m.text())); p.on('pageerror',e=>console.log('err',e.message));
for(const [out,q] of process.argv.slice(2).map(a=>a.split('|'))){await p.goto('http://localhost:8766/scene.html?'+q); await p.waitForFunction('window.done',null,{timeout:120000}); await p.screenshot({path:out,omitBackground:true}); console.log('ok',out);}
await b.close(); srv.close();})();
