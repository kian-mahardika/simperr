import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'dist');
const files=['index.html','styles.css','src.js','catalog-data.js','favicon.svg','app-icon.svg','logo.svg','icon-48.png','icon-192.png','icon-512.png','manifest.webmanifest'];

const url=(process.env.SUPABASE_URL||'').trim();
const publishableKey=(process.env.SUPABASE_PUBLISHABLE_KEY||'').trim();
const isVercel=process.env.VERCEL==='1';

if(Boolean(url)!==Boolean(publishableKey)){
  throw new Error('SUPABASE_URL dan SUPABASE_PUBLISHABLE_KEY harus diisi berpasangan.');
}
if(isVercel&&(!url||!publishableKey)){
  throw new Error('Vercel belum memiliki SUPABASE_URL dan SUPABASE_PUBLISHABLE_KEY. Tambahkan keduanya di Project Settings > Environment Variables lalu Redeploy.');
}
if(url){
  let parsed;
  try{parsed=new URL(url)}catch{throw new Error('SUPABASE_URL bukan URL yang valid. Salin Project URL dari Supabase Connect/API Keys.');}
  if(parsed.protocol!=='https:')throw new Error('SUPABASE_URL untuk deployment harus menggunakan https://');
  if(!publishableKey.startsWith('sb_publishable_')&&!publishableKey.startsWith('eyJ')){
    throw new Error('SUPABASE_PUBLISHABLE_KEY tidak terlihat seperti publishable key Supabase. Jangan gunakan secret/service-role key di Vercel frontend.');
  }
}

await fs.rm(output,{recursive:true,force:true});
await fs.mkdir(output,{recursive:true});
for(const file of files)await fs.copyFile(path.join(root,file),path.join(output,file));
await fs.cp(path.join(root,'covers'),path.join(output,'covers'),{recursive:true});

const config=`// Dibuat otomatis saat build. Jangan taruh secret/service-role key di sini.\nexport const SUPABASE_CONFIG=${JSON.stringify({url,publishableKey})};\n`;
await fs.writeFile(path.join(output,'config.js'),config,'utf8');
console.log(`Build selesai: ${files.length+1} berkas utama dan sampul di dist/. Supabase ${url?'aktif':'lokal/nonaktif'}.`);
