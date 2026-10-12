import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'dist');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.mp4':'video/mp4'};
http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const file=path.resolve(root,pathname==='/'?'index.html':'.'+pathname);
  if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return}
  const content=await fs.readFile(file);
  const range=req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
  res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');
  res.setHeader('Accept-Ranges','bytes');
  if(range){const start=Number(range[1]),end=Math.min(range[2]?Number(range[2]):content.length-1,content.length-1);if(start>end||start>=content.length){res.writeHead(416,{'Content-Range':`bytes */${content.length}`});res.end();return}res.writeHead(206,{'Content-Range':`bytes ${start}-${end}/${content.length}`,'Content-Length':end-start+1});res.end(content.subarray(start,end+1))}
  else{res.setHeader('Content-Length',content.length);res.end(content)}
 }catch{res.writeHead(404);res.end('Not found')}
}).listen(4173,'127.0.0.1',()=>console.log('Avigna preview: http://127.0.0.1:4173'));
