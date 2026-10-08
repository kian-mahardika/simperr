import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const URL=Deno.env.get('SUPABASE_URL')!;
const keyFrom=(modern:string,legacy:string)=>{try{return JSON.parse(Deno.env.get(modern)||'{}').default||Deno.env.get(legacy)||''}catch{return Deno.env.get(legacy)||''}};
const ANON=keyFrom('SUPABASE_PUBLISHABLE_KEYS','SUPABASE_ANON_KEY'), SERVICE=keyFrom('SUPABASE_SECRET_KEYS','SUPABASE_SERVICE_ROLE_KEY'), KEY=Deno.env.get('MIDTRANS_SERVER_KEY')||'';
const BASE=Deno.env.get('MIDTRANS_ENV')==='production'?'https://api.midtrans.com':'https://api.sandbox.midtrans.com';
const ORIGIN=Deno.env.get('SITE_ORIGIN')||'*';
const headers={'Access-Control-Allow-Origin':ORIGIN,'Access-Control-Allow-Headers':'authorization,apikey,content-type','Content-Type':'application/json'};
const reply=(value:unknown,status=200)=>new Response(JSON.stringify(value),{status,headers});
const midtransHeaders={Authorization:`Basic ${btoa(KEY+':')}`};
function qrImageUrl(data:{actions?:{name:string,url:string}[],transaction_id?:string}){
  // Only expose an HTTPS URL on the configured Midtrans API host.
  const actions=Array.isArray(data.actions)?data.actions:[];
  for(const name of ['generate-qr-code-v2','generate-qr-code']){
    const value=actions.find(action=>action.name===name)?.url;
    if(typeof value!=='string')continue;
    try{const url=new URL(value);if(url.protocol==='https:'&&url.origin===BASE)return url.href}catch{}
  }
  // Some Midtrans responses omit actions or return an image URL for a different
  // environment. The documented legacy QRIS URL uses the transaction ID.
  if(typeof data.transaction_id==='string'&&/^[a-zA-Z0-9_-]{8,80}$/.test(data.transaction_id))
    return `${BASE}/v2/qris/${encodeURIComponent(data.transaction_id)}/qr-code`;
  return null;
}
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response(null,{headers});
 if(req.method!=='POST')return reply({error:'Metode tidak diizinkan'},405);
 try{
  if(!KEY)return reply({error:'Pembayaran QRIS belum dikonfigurasi oleh admin'},503);
  const token=req.headers.get('Authorization')?.replace(/^Bearer /i,'');
  if(!token)return reply({error:'Masuk terlebih dahulu'},401);
  const userClient=createClient(URL,ANON,{global:{headers:{Authorization:`Bearer ${token}`}}});
  const {data:{user},error:authError}=await userClient.auth.getUser(token);
  if(authError||!user)return reply({error:'Sesi tidak valid'},401);
  const {caseId}=await req.json();
  if(typeof caseId!=='string')return reply({error:'ID kasus diperlukan'},400);
  const admin=createClient(URL,SERVICE);
  const {data:member}=await admin.from('member').select('id').eq('auth_uid',user.id).single();
  const {data:bill}=await admin.from('obligation_case').select('id,member_id,amount,status').eq('id',caseId).single();
  if(!member||!bill||bill.member_id!==member.id)return reply({error:'Kasus tidak ditemukan'},404);
  if(bill.status!=='AWAITING_PAYMENT')return reply({error:'Kasus sudah selesai'},409);
  const {data:prior}=await admin.from('payment').select('order_id,qr_url,status,amount').eq('case_id',bill.id).order('created_at',{ascending:false}).limit(1).maybeSingle();
  if(prior){
    let priorStatus=prior.status;
    if(prior.amount!==bill.amount)return reply({error:'Nominal berubah; perlu rekonsiliasi'},409);
    if(prior.status==='PENDING'&&prior.qr_url)return reply({orderId:prior.order_id,qrUrl:prior.qr_url,amount:bill.amount});
    if(prior.status==='INITIATING'){
      // A previous charge can succeed even when the QR URL was rejected locally.
      // Check Midtrans before considering another order for this case.
      const check=await fetch(`${BASE}/v2/${encodeURIComponent(prior.order_id)}/status`,{headers:midtransHeaders});
      if(!check.ok)return reply({error:'Order sebelumnya perlu diperiksa di Midtrans: '+prior.order_id},409);
      const verified=await check.json();
      if(verified.order_id!==prior.order_id||Number(verified.gross_amount)!==bill.amount)return reply({error:'Status order sebelumnya tidak cocok: '+prior.order_id},409);
      if(verified.transaction_status==='pending'){
        const qrUrl=qrImageUrl(verified);
        if(!qrUrl)return reply({error:'Transaksi sudah ada, tetapi Midtrans belum memberikan ID QR: '+prior.order_id},502);
        const {error:recoverError}=await admin.from('payment').update({status:'PENDING',qr_url:qrUrl,provider_transaction_id:verified.transaction_id}).eq('order_id',prior.order_id).eq('status','INITIATING');
        if(recoverError)return reply({error:'Order perlu diperiksa di Midtrans: '+prior.order_id},502);
        return reply({orderId:prior.order_id,qrUrl,amount:bill.amount});
      }
      if(verified.transaction_status==='settlement'){
        const {error:settleError}=await admin.rpc('settle_payment',{p_order:prior.order_id,p_amount:bill.amount,p_provider_id:verified.transaction_id});
        return reply({error:settleError?'Pembayaran perlu direkonsiliasi: '+prior.order_id:'Pembayaran sudah tercatat; muat ulang halaman'},409);
      }
      if(!['expire','deny','cancel'].includes(verified.transaction_status))return reply({error:'Status order sebelumnya perlu diperiksa: '+prior.order_id},409);
      const {error:closeError}=await admin.from('payment').update({status:verified.transaction_status==='expire'?'EXPIRED':'DENIED'}).eq('order_id',prior.order_id).eq('status','INITIATING');
      if(closeError)return reply({error:'Order sebelumnya perlu diperiksa: '+prior.order_id},409);
      priorStatus=verified.transaction_status==='expire'?'EXPIRED':'DENIED';
    }
    if(!['EXPIRED','DENIED'].includes(priorStatus))return reply({error:'Order telah dibuat; periksa status pembayaran sebelum membuat order baru'},409);
  }
  const orderId=`SIMPER-${crypto.randomUUID()}`;
  const {error:insertError}=await admin.from('payment').insert({case_id:bill.id,order_id:orderId,amount:bill.amount,status:'INITIATING'});
  if(insertError)return reply({error:'Order sedang diproses; muat ulang status'},409);
  const charge=await fetch(`${BASE}/v2/charge`,{method:'POST',headers:{...midtransHeaders,'Content-Type':'application/json','X-Override-Notification':`${URL.replace(/\/$/,'')}/functions/v1/payment-webhook`},body:JSON.stringify({payment_type:'qris',transaction_details:{order_id:orderId,gross_amount:bill.amount},item_details:[{id:bill.id,price:bill.amount,quantity:1,name:'Kewajiban perpustakaan'}]})});
  const body=await charge.json();
  if(!charge.ok||body.transaction_status!=='pending')return reply({error:'Penyedia pembayaran belum menerima transaksi; hubungi petugas dengan ID '+orderId},502);
  const qrUrl=qrImageUrl(body);
  if(!qrUrl)return reply({error:'Midtrans belum memberi ID gambar QR untuk order '+orderId},502);
  const {error:saveError}=await admin.from('payment').update({status:'PENDING',qr_url:qrUrl,provider_transaction_id:body.transaction_id}).eq('order_id',orderId).eq('status','INITIATING');
  if(saveError)return reply({error:'Order perlu direkonsiliasi: '+orderId},502);
  return reply({orderId,qrUrl,amount:bill.amount});
 }catch(e){return reply({error:'Pembayaran tidak dapat diproses',detail:String(e).slice(0,120)},500)}
});
