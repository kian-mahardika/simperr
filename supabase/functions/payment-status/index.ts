import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const URL=Deno.env.get('SUPABASE_URL')!;
const keyFrom=(modern:string,legacy:string)=>{try{return JSON.parse(Deno.env.get(modern)||'{}').default||Deno.env.get(legacy)||''}catch{return Deno.env.get(legacy)||''}};
const ANON=keyFrom('SUPABASE_PUBLISHABLE_KEYS','SUPABASE_ANON_KEY');
const ORIGIN=Deno.env.get('SITE_ORIGIN')||'*';
const headers={'Access-Control-Allow-Origin':ORIGIN,'Access-Control-Allow-Headers':'authorization,apikey,content-type','Content-Type':'application/json'};
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response(null,{headers});
 const token=req.headers.get('Authorization')?.replace(/^Bearer /i,'');
 if(!token)return new Response(JSON.stringify({error:'Masuk terlebih dahulu'}),{status:401,headers});
 const client=createClient(URL,ANON,{global:{headers:{Authorization:`Bearer ${token}`}}});
 const {data:{user}}=await client.auth.getUser(token);
 if(!user)return new Response(JSON.stringify({error:'Sesi tidak valid'}),{status:401,headers});
 const caseId=new URL(req.url).searchParams.get('caseId');
 const {data:bill,error}=await client.from('obligation_case').select('id,amount,status,payment(order_id,amount,status,qr_url,receipt_id,paid_at)').eq('id',caseId).single();
 return new Response(JSON.stringify(error?{error:'Kasus tidak ditemukan'}:bill),{status:error?404:200,headers});
});
