import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const port=Number(process.env.PORT)||5173;
const host=process.env.HOST||'127.0.0.1';
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/manifest+json'};
const publicFiles=new Set(['index.html','styles.css','src.js','catalog-data.js','config.js','favicon.svg','app-icon.svg','logo.svg','icon-48.png','icon-192.png','icon-512.png','manifest.webmanifest']);

http.createServer(async(req,res)=>{
  let pathname;
  try{pathname=decodeURIComponent(new URL(req.url,`http://${host}:${port}`).pathname)}
  catch{res.writeHead(400);res.end('Bad request');return}
  const name=pathname==='/'?'index.html':pathname.slice(1);
  if(!publicFiles.has(name)&&!/^covers\/[A-Za-z0-9_-]+\.svg$/.test(name)){res.writeHead(404);res.end('Not found');return}
  try{
    const file=await fs.readFile(path.join(root,name));
    res.writeHead(200,{'Content-Type':types[path.extname(name)],'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
    res.end(file);
  }catch{res.writeHead(500);res.end('File unavailable')}
}).listen(port,host,()=>console.log(`SIMPER tersedia di http://${host}:${port}`));
