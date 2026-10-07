// Jalankan sekali setelah SETUP_ALL.sql. Script ini idempotent: aman dijalankan ulang bila setup sempat terputus.
// Secret key hanya dipakai dari environment terminal dan tidak pernah dibundel ke website.
const base=process.env.SUPABASE_URL?.replace(/\/$/,'');
const key=process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY;
const password=process.env.SIMPER_SEED_PASSWORD;
if(!base||!key||!password||password.length<12)throw Error('Set SUPABASE_URL, SUPABASE_SECRET_KEY (atau legacy SUPABASE_SERVICE_ROLE_KEY), dan SIMPER_SEED_PASSWORD minimal 12 karakter.');
if(!/^https:\/\//.test(base))throw Error('SUPABASE_URL harus berupa https://...');

const legacyJwt=key.startsWith('eyJ');
const baseHeaders={apikey:key,'Content-Type':'application/json',...(legacyJwt?{Authorization:`Bearer ${key}`}:{})};
async function call(path,method='GET',body,extraHeaders={}){
  const r=await fetch(base+path,{method,headers:{...baseHeaders,...extraHeaders},body:body===undefined?undefined:JSON.stringify(body)});
  const text=await r.text();let data=null;try{data=text?JSON.parse(text):null}catch{data=text}
  if(!r.ok)throw Error(`${path}: ${r.status} ${typeof data==='string'?data:JSON.stringify(data)}`);
  return data;
}

const accounts=[
 ...Array.from({length:12},(_,i)=>({nim:`419999${String(i+1).padStart(4,'0')}`,memberId:`M${String(i+1).padStart(3,'0')}`,role:'MEMBER'})),
 {nim:'4199990901',role:'LIBRARIAN',name:'Ayu Pustakawati'},
 {nim:'4199990902',role:'FINANCE',name:'Dimas Prakoso'},
 {nim:'4199990903',role:'ADMIN',name:'Sinta Maharani'}
];

const existingResponse=await call('/auth/v1/admin/users?page=1&per_page=1000');
const existingUsers=Array.isArray(existingResponse)?existingResponse:(existingResponse?.users||[]);
const byEmail=new Map(existingUsers.map(u=>[String(u.email||'').toLowerCase(),u]));

for(const a of accounts){
 const email=`${a.nim}@simper.local`;
 let user=byEmail.get(email);
 if(!user){
   const result=await call('/auth/v1/admin/users','POST',{email,password,email_confirm:true,user_metadata:{nim:a.nim,...(a.name?{name:a.name}:{})}});
   user=result?.user||result;
   if(!user?.id)throw Error(`Auth ID kosong untuk ${a.nim}`);
   byEmail.set(email,user);
   console.log(`Dibuat: ${a.nim}`);
 }else{
   console.log(`Sudah ada: ${a.nim}`);
 }
 const uid=user.id;
 await call('/rest/v1/app_role?on_conflict=auth_uid','POST',{auth_uid:uid,role:a.role},{Prefer:'resolution=merge-duplicates,return=minimal'});
 if(a.memberId)await call(`/rest/v1/member?id=eq.${encodeURIComponent(a.memberId)}`,'PATCH',{auth_uid:uid},{Prefer:'return=minimal'});
 console.log(`Terhubung: ${a.nim} (${a.role})`);
}
console.log('Provisioning selesai. Login memakai NIM di atas + SIMPER_SEED_PASSWORD yang sama.');
