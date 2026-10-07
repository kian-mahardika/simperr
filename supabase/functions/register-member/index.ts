import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const URL=Deno.env.get('SUPABASE_URL')!;
const keyFrom=(modern:string,legacy:string)=>{try{return JSON.parse(Deno.env.get(modern)||'{}').default||Deno.env.get(legacy)||''}catch{return Deno.env.get(legacy)||''}};
const ANON=keyFrom('SUPABASE_PUBLISHABLE_KEYS','SUPABASE_ANON_KEY'),SERVICE=keyFrom('SUPABASE_SECRET_KEYS','SUPABASE_SERVICE_ROLE_KEY');
const ORIGIN=Deno.env.get('SITE_ORIGIN')||'*';
const headers={'Access-Control-Allow-Origin':ORIGIN,'Access-Control-Allow-Headers':'authorization,apikey,content-type','Content-Type':'application/json'};
const reply=(value:unknown,status=200)=>new Response(JSON.stringify(value),{status,headers});
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response(null,{headers});
 if(req.method!=='POST')return reply({error:'Metode tidak diizinkan'},405);
 const token=req.headers.get('Authorization')?.replace(/^Bearer /i,'');if(!token)return reply({error:'Masuk terlebih dahulu'},401);
 const client=createClient(URL,ANON,{global:{headers:{Authorization:`Bearer ${token}`}}});
 const {data:{user}}=await client.auth.getUser(token);if(!user)return reply({error:'Sesi tidak valid'},401);
 const admin=createClient(URL,SERVICE);
 const {data:staff}=await admin.from('app_role').select('role').eq('auth_uid',user.id).single();
 if(staff?.role!=='LIBRARIAN')return reply({error:'Hanya pustakawan dapat mendaftarkan anggota'},403);
 let createdId:string|null=null,createdMemberId:string|null=null;
 try{
  const {nim,name,email,program,klass}=await req.json();
  if(!/^\d{10}$/.test(nim)||![name,email,program,klass].every((x:unknown)=>typeof x==='string'&&x.trim().length>0))return reply({error:'Data anggota tidak lengkap'},400);
  const random=crypto.getRandomValues(new Uint8Array(18));const temporaryPassword=btoa(String.fromCharCode(...random)).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
  const {data:auth,error:authError}=await admin.auth.admin.createUser({email:`${nim}@simper.local`,password:temporaryPassword,email_confirm:true,user_metadata:{nim,name}});
  if(authError||!auth.user)return reply({error:authError?.message||'Akun tidak dibuat'},409);
  createdId=auth.user.id;
  const memberId=`M-${crypto.randomUUID()}`,memberNo=`SIM-${new Date().getFullYear()}-${memberId.slice(-8).toUpperCase()}`;
  const {error:memberError}=await admin.from('member').insert({id:memberId,auth_uid:createdId,nim,member_no:memberNo,name:name.trim(),email:email.trim(),program:program.trim(),class_label:klass.trim(),status:'PENDING_VERIFICATION'});
  if(memberError)throw memberError;
  createdMemberId=memberId;
  const {error:roleError}=await admin.from('app_role').insert({auth_uid:createdId,role:'MEMBER'});
  if(roleError)throw roleError;
  await admin.from('audit_event').insert({actor_uid:user.id,action:'MEMBER_REGISTERED',entity:'member',entity_id:memberId});
  return reply({memberId,memberNo,temporaryPassword});
 }catch(e){if(createdMemberId)await admin.from('member').delete().eq('id',createdMemberId);if(createdId)await admin.auth.admin.deleteUser(createdId);return reply({error:String(e).slice(0,160)},500)}
});
