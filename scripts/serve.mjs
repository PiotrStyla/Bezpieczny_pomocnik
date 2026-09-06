import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {PUBLIC_FILES} from './public-files.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../frontend');
const mime={html:'text/html; charset=utf-8',css:'text/css; charset=utf-8',mjs:'text/javascript; charset=utf-8',js:'text/javascript; charset=utf-8',json:'application/json',png:'image/png',ttf:'font/ttf',txt:'text/plain; charset=utf-8'};
const server=http.createServer(async(req,res)=>{
  let file;
  try{file=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\//,'')||'index.html';}catch{res.writeHead(400);res.end();return;}
  if(!PUBLIC_FILES.includes(file)){res.writeHead(404);res.end('Not found');return;}
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
  try{
    const data=await readFile(resolve(root,file));
    res.writeHead(200,{'Content-Type':mime[file.split('.').pop()]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','X-Frame-Options':'DENY','Permissions-Policy':'camera=(), microphone=(), geolocation=()'});
    res.end(req.method==='HEAD'?undefined:data);
  }catch{res.writeHead(404);res.end('Not found');}
});
server.listen(4186,'127.0.0.1',()=>console.log('Bezpieczny Pomocnik: http://127.0.0.1:4186'));
