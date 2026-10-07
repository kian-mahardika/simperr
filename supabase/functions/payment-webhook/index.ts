import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const URL=Deno.env.get('SUPABASE_URL')!;
const keyFrom=(modern:string,legacy:string)=>{try{return JSON.parse(Deno.env.get(modern)||'{}').default||Deno.env.get(legacy)||''}catch{return Deno.env.get(legacy)||''}};
const SERVICE=keyFrom('SUPABASE_SECRET_KEYS','SUPABASE_SERVICE_ROLE_KEY'), KEY=Deno.env.get('MIDTRANS_SERVER_KEY')||'';
const BASE=Deno.env.get('MIDTRANS_ENV')==='production'?'https://api.midtrans.com':'https://api.sandbox.midtrans.com';
const reply=(value:unknown,status=200)=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json'}});
async function digest(value:string){const bytes=await crypto.subtle.digest('SHA-512',new TextEncoder().encode(value));return Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('')}
Deno.serve(async req=>{
 if(req.method!=='POST')return reply({error:'Metode tidak diizinkan'},405);
 try{
  if(!KEY)return reply({error:'Webhook pembayaran belum dikonfigurasi'},503);
  const event=await req.json();
  const {order_id,status_code,gross_amount,signature_key}=event;
  if(![order_id,status_code,gross_amount,signature_key].every(x=>typeof x==='string'))return reply({error:'Payload tidak lengkap'},400);
  if(await digest(order_id+status_code+gross_amount+KEY)!==signature_key)return reply({error:'Signature tidak valid'},401);
  // Server-to-server status check prevents trusting a replayed or stale browser callback.
  const response=await fetch(`${BASE}/v2/${encodeURIComponent(order_id)}/status`,{headers:{Authorization:`Basic ${btoa(KEY+':')}`}});
  if(!response.ok)return reply({error:'Status penyedia belum tersedia'},503);
  const verified=await response.json();
  if(verified.order_id!==order_id)return reply({error:'Order tidak cocok'},400);
  const admin=createClient(URL,SERVICE);
  const {data:pay}=await admin.from('payment').select('amount,status').eq('order_id',order_id).maybeSingle();
  if(!pay)return reply({error:'Order tidak ditemukan'},404);
  const amount=Number(verified.gross_amount);
  if(!Number.isSafeInteger(amount)||amount!==pay.amount)return reply({error:'Nominal tidak sesuai'},409);
  if(verified.transaction_status==='settlement'&&(!verified.fraud_status||verified.fraud_status==='accept')){
    const {data,error}=await admin.rpc('settle_payment',{p_order:order_id,p_amount:amount,p_provider_id:verified.transaction_id});
    if(error)return reply({error:'Pencatatan gagal'},503);
    return reply({ok:true,receiptId:data});
  }
  if(['expire','deny','cancel'].includes(verified.transaction_status)&&pay.status!=='SETTLED')await admin.from('payment').update({status:verified.transaction_status==='expire'?'EXPIRED':'DENIED'}).eq('order_id',order_id).neq('status','SETTLED');
  return reply({ok:true,status:verified.transaction_status});
 }catch{return reply({error:'Notifikasi tidak dapat diproses'},500)}
});
