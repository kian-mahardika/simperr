import {catalogSeed} from './catalog-data.js';
import {SUPABASE_CONFIG} from './config.js';
const STORE = 'simper-data-v3';
const SESSION = 'simper-session-v3';
const TOKEN = 'simper-auth-token-v1';
const remoteEnabled=Boolean(SUPABASE_CONFIG.url&&SUPABASE_CONFIG.publishableKey);
let remoteToken=sessionStorage.getItem(TOKEN);
const programStats = [
  ['Manajemen Keuangan Negara STR', 1393],
  ['Akuntansi Sektor Publik STR', 1120],
  ['Manajemen Aset Publik STR', 569],
  ['D3 Pajak', 298],
  ['Akuntansi Sektor Publik STR AP', 257],
  ['Program lainnya', 332]
];
const classDirectory={"Akuntansi Sektor Publik STR":["6 PPPN-2","6 PPPN-1","6 PPPN-4","6 Audit-10","6 Audit-2","6 Audit-3","6 Audit-4","6 Audit-5","6 Audit-6","6 Audit-7","6 Audit-8","6 Audit-9","2-3","4-10","4-4","4-5","4-9","8 PPPN-5","2-2","2-4","4-1","4-2","4-6","4-7","4-8","8 Audit-1","8 Audit-2","8 Audit-3","8 Audit-5","8 PPPN-1","8 PPPN-2","8 PPPN-4","8 Audit-4","8 PPPN-3","6 Sisfo-4","2-1","6 Audit-1","6 Sisfo-3","8 Sisfo-2","6 PPPN-3","6 Sisfo-1","8 Sisfo-1","2-5","6 Sisfo-2","4-3","4 Kur 23"],"Akuntansi Sektor Publik STR AP":["8 Audit-1","10 PPPN-PBB","8 Audit-2","10 PPPN-BC","4 Audit","8 PPPN BC PBB","10 Sisfo","8 Audit-BL","8 PPPN Pajak 1","8 PPPN Pajak 2","8 Sisfo","8 Sisfo-BL"],"D3 Akuntansi":["6-2","6-3","4-4","4-2","4-3","4-1 BL","6-1 BL","6-4"],"D3 Kebendaharaan Negara":["4-1","6-1","4-2 BL"],"D3 Kepabeanan dan Cukai":["4-1","6-2 BL","6-1"],"D3 Manajemen Aset":["6-1","4-1"],"D3 Pajak":["4-1","4-5","4-2","4-3","4-4","6-4","6-5","6-2","6-3","6-1 BL","4-6 BL"],"D3 PBB/Penilai":["6-1","6-2","6-3","6-4","4-1"],"Manajemen Aset Publik STR":["6 PBP-1","6 PBP-2","4-1","4-3","4-4","4-5","4-7","4-6","6 MPAS-1","6 MPAS-2","6 MPAS-3","6 MPAS-4","6 MPAS-5","4-2","2-2","2-4","6 Lelang","2-3","8 Lelang","8 PBP-1","2-1","8 PBP-2","8 MPAS-2","8 MPAS-1","4-8"],"Manajemen Keuangan Negara STR":["4 Penerimaan-2","4 Penerimaan-3","4 Penerimaan-4","4 Penerimaan-5","4 Penerimaan-1","4 Penerimaan-6","4 Penerimaan-7","4 Penerimaan-8","4 Treasuri-1","4 Treasuri-2","4 Treasuri-3","4 Treasuri-4","6 Penerimaan-2","6 Penerimaan-3","6 Penerimaan-9","2-2","2-3","2-4","2-5","6 Penerimaan-11","6 Penerimaan-12","6 Penerimaan-4","6 Penerimaan-5","6 Penerimaan-6","6 Penerimaan-7","6 Penerimaan-8","2-10","2-11","2-12","2-6","2-7","2-8","2-9","6 Penerimaan-10","8 Penerimaan-1","8 Penerimaan-2","8 Penerimaan-3","8 Penerimaan-4","8 Penerimaan-5","8 Penerimaan-6","8 Penerimaan-7","8 Penerimaan-8","8 Penerimaan-9","6 Treasuri-1","6 Treasuri-2","6 Treasuri-3","6 Treasuri-4","8 Treasuri-1","8 Treasuri-2","8 Treasuri-3","8 Treasuri-4","6 Penerimaan-1","6 Treasuri-5","8 Penerimaan-10","8 Treasuri-5","2-1"]};
const roomNames = Array.from({length:10},(_,i)=>`Ruang Diskusi ${i+1}`);
const titles = {
  dashboard:['Ikhtisar Perpustakaan','Ringkasan layanan dan aktivitas perpustakaan.'],
  catalog:['Katalog Buku','Temukan judul dan lihat ketersediaan setiap eksemplar.'],
  circulation:['Peminjaman & Pengembalian','Pantau pengajuan, jatuh tempo, dan serah terima buku.'],
  rooms:['Ruang Diskusi','Lihat jadwal, ajukan ruang, dan kelola persetujuan.'],
  lost:['Kehilangan & Denda','Lihat kewajiban keterlambatan dan kehilangan beserta kwitansi pembayaran.'],
  members:['Keanggotaan','Perekaman dan verifikasi anggota perpustakaan.'],
  audit:['Jejak Audit','Riwayat tindakan pada transaksi dan data master.'],
  settings:['Parameter Sistem','Kelola aturan layanan yang berlaku.']
};
const menu = [
  ['dashboard','Ikhtisar'],['catalog','Katalog'],['circulation','Sirkulasi'],
  ['rooms','Ruang Diskusi'],['lost','Kehilangan & Denda'],['members','Anggota'],
  ['audit','Audit'],['settings','Parameter']
];
const roleMenus = {
  MEMBER:['dashboard','catalog','circulation','rooms','lost'],
  LIBRARIAN:['dashboard','catalog','circulation','rooms','lost','members'],
  FINANCE:['dashboard','lost'],
  ADMIN:['dashboard','audit','settings']
};
const roleNames={MEMBER:'Anggota',LIBRARIAN:'Pustakawan',FINANCE:'Keuangan',ADMIN:'Admin'};
const $=s=>document.querySelector(s);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const localDate=(d=new Date())=>{let y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`};
const offsetDate=n=>{const d=new Date();d.setDate(d.getDate()+n);return localDate(d)};
const fmt=d=>d?new Intl.DateTimeFormat('id-ID',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(`${String(d).slice(0,10)}T12:00:00`)):'—';
const fmtLong=d=>new Intl.DateTimeFormat('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date(`${d}T12:00:00`));
const money=n=>'Rp '+Number(n||0).toLocaleString('id-ID');
const id=(p,items)=>`${p}-${new Date().getFullYear()}-${String(items.length+1).padStart(6,'0')}`;
const roomLabel=n=>roomNames[Number(n)-1]||`Ruang ${n}`;
const findMember=n=>state.members.find(m=>m.id===n);
const findBook=n=>state.books.find(b=>b.id===n);
const available=b=>b.copies.filter(c=>c.status==='AVAILABLE').length;
const activeLoan=l=>['ACTIVE','OVERDUE'].includes(l.status);
const derivedStatus=l=>l.status==='ACTIVE'&&l.dueDate<localDate()?'OVERDUE':l.status;
const loanStatus=l=>derivedStatus(l);
const own=x=>role!=='MEMBER'||x.memberId===currentMember;
const badge=(t,kind)=>`<span class="badge ${kind}">${esc(t)}</span>`;
const statusTag=s=>{
  const names={PENDING_CONFIRMATION:'Menunggu konfirmasi',READY_PICKUP:'Siap diambil',ACTIVE:'Aktif',OVERDUE:'Terlambat',RETURNED:'Dikembalikan',LATE_RETURNED:'Terlambat',LOST:'Hilang',SUBMITTED:'Diajukan',APPROVED:'Disetujui',REJECTED:'Ditolak',CANCELLED:'Dibatalkan',REPORTED:'Dilaporkan',AWAITING_PAYMENT:'Menunggu pembayaran',ASSESSED:'Dinilai',CLOSED:'Selesai',PENDING_VERIFICATION:'Menunggu verifikasi',VERIFIED:'Terverifikasi',SUSPENDED:'Ditangguhkan'};
  const kinds={ACTIVE:'ok',APPROVED:'ok',RETURNED:'neutral',CLOSED:'ok',VERIFIED:'ok',READY_PICKUP:'info',OVERDUE:'warn',LATE_RETURNED:'warn',LOST:'warn',REJECTED:'warn',SUSPENDED:'warn',PENDING_CONFIRMATION:'pending',SUBMITTED:'pending',REPORTED:'pending',AWAITING_PAYMENT:'pending',PENDING_VERIFICATION:'pending'};
  return badge(names[s]||s,kinds[s]||'info');
};
const empty=(title,detail)=>`<div class="empty"><strong>${esc(title)}</strong><span>${esc(detail)}</span></div>`;
const panel=(content,extra='')=>`<section class="panel ${extra}">${content}</section>`;
const heading=(k,t,extra='')=>`<div class="section-head"><div><span class="section-kicker">${esc(k)}</span><h2>${esc(t)}</h2></div>${extra}</div>`;
const field=(label,control,extra='')=>`<div class="field"><label>${esc(label)}</label>${control}${extra}</div>`;
const select=(name,opts,selected)=>`<select name="${name}">${opts.map(([v,t])=>`<option value="${esc(v)}" ${String(v)===String(selected)?'selected':''}>${esc(t)}</option>`).join('')}</select>`;
const formText=(name,placeholder='',type='text',required=true)=>`<input type="${type}" name="${name}" placeholder="${esc(placeholder)}" ${required?'required':''}>`;
const memberOptions=()=>state.members.map(m=>[m.id,`${m.name} · ${m.memberNo} (${m.status})`]);
const bookOptions=()=>state.books.map(b=>[b.id,`${b.title} · ${available(b)} tersedia`]);
const audit=(action,entity,entityId,detail)=>state.audit.unshift({id:crypto.randomUUID(),at:new Date().toISOString(),actor:session?.name||roleNames[role],action,entity,entityId,detail});
function makeSeed(){
  const books=[
    ['B001','Akuntansi Sektor Publik','Indra Bastian','Akuntansi','9789790618228',2022,4],
    ['B002','Sistem Informasi Akuntansi','Krismiaji','Sistem Informasi','9789790619348',2021,3],
    ['B003','Manajemen Keuangan Publik','Mahmudi','Keuangan Publik','9786021286898',2023,5],
    ['B004','Audit Sektor Publik','Ihyaul Ulum','Audit','9786023185045',2020,3],
    ['B005','Dasar-Dasar Perpajakan','Siti Resmi','Perpajakan','9789790618570',2022,4],
    ['B006','Database Systems: Design, Implementation & Management','Carlos Coronel','Sistem Informasi','9780357673034',2023,2],
    ['B007','Metodologi Penelitian Bisnis','Uma Sekaran','Metodologi','9789790615494',2021,3],
    ['B008','Pengendalian Internal Sistem Informasi','Tim Editorial SIMPER','Sistem Informasi','SIM-000008',2026,2],
    ['B009','Hukum Keuangan Negara','Tim Editorial SIMPER','Hukum','SIM-000009',2026,2],
    ['B010','Perencanaan dan Penganggaran Publik','Tim Koleksi','Keuangan Publik','SIM-000010',2024,4],
    ['B011','Audit Sistem Informasi','Tim Koleksi','Audit','SIM-000011',2023,3],
    ['B012','Tata Kelola Teknologi Informasi','Tim Koleksi','Sistem Informasi','SIM-000012',2022,4],
    ['B013','Manajemen Aset Negara','Tim Koleksi','Keuangan Publik','SIM-000013',2021,3],
    ['B014','Pengantar Analitika Data','Tim Koleksi','Metodologi','SIM-000014',2024,5],
    ['B015','Hukum Administrasi Negara','Tim Koleksi','Hukum','SIM-000015',2023,4],
    ['B016','Perpajakan Indonesia','Tim Koleksi','Perpajakan','SIM-000016',2024,3],
    ['B017','Manajemen Risiko Organisasi Publik','Tim Koleksi','Audit','SIM-000017',2025,4],
    ['B018','Akuntansi Pemerintahan','Tim Koleksi','Akuntansi','SIM-000018',2023,5]
  ].map(([id,title,author,category,isbn,year,total],i)=>({id,title,author,category,isbn,year,publisher:'Data awal',shelf:`Rak ${String.fromCharCode(65+i%8)}-${String(i%20+1).padStart(2,'0')}`,replacementValue:100000+i*5000,cover:`./covers/B${String(i+19).padStart(4,'0')}.svg`,source:'Data awal rancangan',copies:Array.from({length:total},(_,i)=>({barcode:`${id}-${String(i+1).padStart(2,'0')}`,status:'AVAILABLE'}))}));
  const members=[
    {id:'M001',nim:'4199990001',memberNo:'SIM-2026-001',name:'Nadia Prameswari',email:'nadia@example.test',program:'Akuntansi Sektor Publik STR',klass:'6 PPPN-2',status:'ACTIVE'},
    {id:'M002',nim:'4199990002',memberNo:'SIM-2026-002',name:'Raka Mahendra',email:'raka@example.test',program:'Manajemen Keuangan Negara STR',klass:'4 Penerimaan-2',status:'ACTIVE'},
    {id:'M003',nim:'4199990003',memberNo:'SIM-2026-003',name:'Dina Larasati',email:'dina@example.test',program:'Manajemen Aset Publik STR',klass:'4-1',status:'ACTIVE'},
    {id:'M004',nim:'4199990004',memberNo:'SIM-2026-004',name:'Fajar Rahadian',email:'fajar@example.test',program:'D3 Pajak',klass:'4-1',status:'PENDING_VERIFICATION'},
    {id:'M005',nim:'4199990005',memberNo:'SIM-2026-005',name:'Tiara Wening',email:'tiara@example.test',program:'Akuntansi Sektor Publik STR AP',klass:'8 Audit-1',status:'ACTIVE'},
    {id:'M006',nim:'4199990006',memberNo:'SIM-2026-006',name:'Bagas Firmansyah',email:'bagas@example.test',program:'D3 Akuntansi',klass:'6-2',status:'ACTIVE'},
    {id:'M007',nim:'4199990007',memberNo:'SIM-2026-007',name:'Salma Kirana',email:'salma@example.test',program:'D3 PBB/Penilai',klass:'6-1',status:'ACTIVE'},
    {id:'M008',nim:'4199990008',memberNo:'SIM-2026-008',name:'Rizky Aditya',email:'rizky@example.test',program:'D3 Kebendaharaan Negara',klass:'4-1',status:'ACTIVE'},
    {id:'M009',nim:'4199990009',memberNo:'SIM-2026-009',name:'Alya Puspita',email:'alya@example.test',program:'D3 Kepabeanan dan Cukai',klass:'4-1',status:'ACTIVE'},
    {id:'M010',nim:'4199990010',memberNo:'SIM-2026-010',name:'Yuda Pratama',email:'yuda@example.test',program:'D3 Manajemen Aset',klass:'6-1',status:'ACTIVE'},
    {id:'M011',nim:'4199990011',memberNo:'SIM-2026-011',name:'Maya Anindita',email:'maya@example.test',program:'Manajemen Aset Publik STR',klass:'6 PBP-1',status:'ACTIVE'},
    {id:'M012',nim:'4199990012',memberNo:'SIM-2026-012',name:'Ilham Nugraha',email:'ilham@example.test',program:'Manajemen Keuangan Negara STR',klass:'4 Penerimaan-3',status:'ACTIVE'}
  ];
  books[0].copies[0].status='ON_LOAN';books[3].copies[0].status='ON_LOAN';books[1].copies[0].status='LOST';
  for(const i of [5,6,7,8,9,10,11,12])books[i].copies[0].status='ON_LOAN';
  const loans=[
    {id:'LN-2026-000001',memberId:'M001',bookId:'B001',barcode:'B001-01',requestDate:offsetDate(-4),loanDate:offsetDate(-4),dueDate:offsetDate(10),status:'ACTIVE',parameterVersion:1},
    {id:'LN-2026-000002',memberId:'M002',bookId:'B004',barcode:'B004-01',requestDate:offsetDate(-20),loanDate:offsetDate(-20),dueDate:offsetDate(-6),status:'ACTIVE',parameterVersion:1},
    {id:'LN-2026-000003',memberId:'M003',bookId:'B005',barcode:'B005-01',requestDate:offsetDate(-24),loanDate:offsetDate(-24),dueDate:offsetDate(-10),returnDate:offsetDate(-12),returnId:'RT-2026-000001',status:'RETURNED',parameterVersion:1},
    {id:'LN-2026-000004',memberId:'M001',bookId:'B002',barcode:'B002-01',requestDate:offsetDate(-18),loanDate:offsetDate(-18),dueDate:offsetDate(-4),status:'LOST',parameterVersion:1},
    {id:'LN-2026-000005',memberId:'M003',bookId:'B003',barcode:null,requestDate:offsetDate(-1),loanDate:null,dueDate:null,status:'PENDING_CONFIRMATION',parameterVersion:null},
    ...[
      ['M005','B006',-9,5],['M006','B007',-11,3],['M007','B008',-18,-4],['M008','B009',-3,11],
      ['M009','B010',-6,8],['M010','B011',-1,13],['M011','B012',-7,7],['M012','B013',-12,2]
    ].map(([memberId,bookId,issued,due],i)=>({id:`LN-2026-${String(i+6).padStart(6,'0')}`,memberId,bookId,barcode:`${bookId}-01`,requestDate:offsetDate(issued),loanDate:offsetDate(issued),dueDate:offsetDate(due),status:'ACTIVE',parameterVersion:1})),
    {id:'LN-2026-000014',memberId:'M006',bookId:'B015',barcode:null,requestDate:offsetDate(-1),loanDate:null,dueDate:null,status:'PENDING_CONFIRMATION',parameterVersion:null},
    {id:'LN-2026-000015',memberId:'M009',bookId:'B017',barcode:null,requestDate:localDate(),loanDate:null,dueDate:null,status:'PENDING_CONFIRMATION',parameterVersion:null},
    {id:'LN-2026-000016',memberId:'M003',bookId:'B014',barcode:'B014-01',requestDate:offsetDate(-21),loanDate:offsetDate(-20),dueDate:offsetDate(-6),returnDate:offsetDate(-3),status:'LATE_RETURNED',parameterVersion:1}
  ];
  const bookings=[
    {id:'RB-2026-000001',memberId:'M001',roomId:1,date:offsetDate(1),start:'09:00',end:'11:00',participants:4,purpose:'Diskusi kelompok',status:'APPROVED'},
    {id:'RB-2026-000002',memberId:'M002',roomId:2,date:offsetDate(1),start:'13:00',end:'15:00',participants:3,purpose:'Bimbingan tugas',status:'SUBMITTED'},
    {id:'RB-2026-000003',memberId:'M003',roomId:3,date:offsetDate(2),start:'10:00',end:'11:00',participants:5,purpose:'Belajar bersama',status:'APPROVED'},
    ...[
      ['M005',4,1,'08:00','10:00','Diskusi tugas akhir','APPROVED'],
      ['M006',5,1,'10:00','12:00','Persiapan presentasi','APPROVED'],
      ['M007',6,2,'13:00','15:00','Kajian kelompok','SUBMITTED'],
      ['M008',7,2,'09:00','11:00','Diskusi mata kuliah','APPROVED'],
      ['M009',8,2,'15:00','17:00','Bimbingan akademik','SUBMITTED'],
      ['M010',9,3,'08:00','09:00','Belajar mandiri','APPROVED'],
      ['M011',10,3,'13:00','15:00','Pengerjaan proyek','APPROVED'],
      ['M012',1,3,'13:00','15:00','Diskusi kelompok','SUBMITTED']
    ].map(([memberId,roomId,day,start,end,purpose,status],i)=>({id:`RB-2026-${String(i+4).padStart(6,'0')}`,memberId,roomId,date:offsetDate(day),start,end,participants:3+i%4,purpose,status}))
  ];
  const cases=[
    {id:'KS-2026-000001',type:'LOST',loanId:'LN-2026-000004',memberId:'M001',reportedAt:offsetDate(-2),notes:'Buku tidak ditemukan setelah kegiatan belajar.',status:'AWAITING_PAYMENT',amount:175000,payment:null},
    {id:'KS-2026-000002',type:'LATE',loanId:'LN-2026-000016',memberId:'M003',reportedAt:offsetDate(-3),notes:'3 hari × Rp 1.000',daysLate:3,status:'CLOSED',amount:3000,payment:{id:'PM-2026-000001',orderId:'SIMPER-2026-000001',status:'SETTLED',amount:3000,receiptId:'KW-2026-00000001',paidAt:offsetDate(-2)}}
  ];
  const accounts=[...members.map(m=>({nim:m.nim,memberId:m.id,name:m.name,role:'MEMBER'})),
    {nim:'4199990901',memberId:null,name:'Ayu Pustakawati',role:'LIBRARIAN'},
    {nim:'4199990902',memberId:null,name:'Dimas Prakoso',role:'FINANCE'},
    {nim:'4199990903',memberId:null,name:'Sinta Maharani',role:'ADMIN'}];
  return {books:[...books,...catalogSeed],members,loans,bookings,cases,accounts,audit:[{id:'seed-1',at:new Date().toISOString(),actor:'Sistem',action:'DATA_INITIALIZED',entity:'System',entityId:'SIMPER',detail:'Data layanan tersedia.'}],config:{maxLoans:5,loanDays:14,lateFeePerDay:1000,roomMaxMinutes:120,version:1}};
}
let state;
try {state=JSON.parse(localStorage.getItem(STORE))||makeSeed()}catch{state=makeSeed()}
let session=null,role=null,view='dashboard',currentMember=null,filters={catalog:'',category:'',availability:'',catalogLimit:24,loanStatus:'',loanMember:'',bookingDate:offsetDate(1),bookingRoom:'1',bookingStatus:'',memberSearch:'',auditSearch:''},selectedSlot='';
const remembered=state.accounts?.find(a=>a.nim===sessionStorage.getItem(SESSION));
if(remembered){session=remembered;role=remembered.role;currentMember=remembered.memberId}
function save(){if(!remoteEnabled)localStorage.setItem(STORE,JSON.stringify(state));render()}
async function api(path,{method='GET',body,range}={}){
  const response=await fetch(`${SUPABASE_CONFIG.url.replace(/\/$/,'')}/${path}`,{method,headers:{apikey:SUPABASE_CONFIG.publishableKey,Authorization:`Bearer ${remoteToken}`,'Content-Type':'application/json',...(range?{Range:range}:{})},body:body===undefined?undefined:JSON.stringify(body)});
  const result=await response.text();let data;try{data=result?JSON.parse(result):null}catch{data=result}
  if(!response.ok)throw Error(data?.message||data?.error||`Server: ${response.status}`);
  return data;
}
async function rows(table){
  const all=[];
  for(let start=0;;start+=1000){
    const batch=await api(`rest/v1/${table}?select=*`,{range:`${start}-${start+999}`});
    all.push(...batch);if(batch.length<1000)break;
  }
  return all;
}
async function rpc(name,args){return api(`rest/v1/rpc/${name}`,{method:'POST',body:args})}
async function refreshRemote(){
  if(!remoteEnabled||!remoteToken)return;
  const [books,copies,members,loans,cases,payments,bookings,params,audits]=await Promise.all(['book','book_copy','member','loan','obligation_case','payment','room_booking','system_parameter','audit_event'].map(rows));
  const copyMap=new Map();for(const c of copies){if(!copyMap.has(c.book_id))copyMap.set(c.book_id,[]);copyMap.get(c.book_id).push({barcode:c.barcode,status:c.status})}
  const byCase=new Map();for(const p of payments){const old=byCase.get(p.case_id);if(!old||p.created_at>old.created_at)byCase.set(p.case_id,p)}
  state.books=books.map(b=>({id:b.id,title:b.title,author:b.author,category:b.category,isbn:b.catalog_code,year:b.publication_year,publisher:b.publisher,shelf:b.shelf,replacementValue:b.replacement_value,cover:b.cover_path,source:b.source,copies:copyMap.get(b.id)||[]}));
  state.members=members.map(m=>({id:m.id,nim:m.nim,memberNo:m.member_no,name:m.name,email:m.email,program:m.program,klass:m.class_label,status:m.status}));
  state.loans=loans.map(l=>({id:l.id,memberId:l.member_id,bookId:l.book_id,barcode:l.copy_barcode,requestDate:l.request_date,pickupDate:l.pickup_date,loanDate:l.loan_date,dueDate:l.due_date,returnDate:l.return_date,status:l.status,parameterVersion:l.parameter_version,loanDays:l.loan_days_snapshot}));
  state.cases=cases.map(c=>{const p=byCase.get(c.id);return{id:c.id,loanId:c.loan_id,memberId:c.member_id,type:c.kind,reportedAt:c.created_at,notes:c.note,amount:c.amount,daysLate:c.days_late,status:c.status,payment:p?{orderId:p.order_id,qrUrl:p.qr_url,status:p.status,receiptId:p.receipt_id,paidAt:p.paid_at,amount:p.amount}:null}});
  const localDay=t=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(t));
  const localTime=t=>new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Jakarta',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(t));
  state.bookings=bookings.map(b=>({id:b.id,memberId:b.member_id,roomId:b.room_id,date:localDay(b.start_at),start:localTime(b.start_at),end:localTime(b.end_at),status:b.status,purpose:b.purpose,participants:b.participants}));
  const cfg=params[0];if(cfg)state.config={maxLoans:cfg.max_loans,loanDays:cfg.loan_days,lateFeePerDay:cfg.late_fee_per_day,roomMaxMinutes:cfg.room_max_minutes,version:cfg.version};
  state.audit=audits.map(a=>({id:a.id,at:a.created_at,actor:a.actor_uid||'Sistem',action:a.action,entity:a.entity,entityId:a.entity_id,detail:JSON.stringify(a.detail)}));
  render();
}
async function runRemote(action){try{await action();await refreshRemote();return true}catch(e){return fail(e.message||'Transaksi gagal')}}
let toastTimer;
let paymentPoll;
function toast(message,error=false){const el=$('#toast');el.textContent=message;el.className=`toast show${error?' error':''}`;clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),3800)}
function allowed(action){if(!roleMenus[role].includes(view))return false;return action()}
function fail(m){toast(m,true);return false}
async function login(nim,password){
  let account=state.accounts.find(a=>a.nim===String(nim).trim());
  if(!account&&!remoteEnabled)return false;
  if(remoteEnabled){
    try{
      const response=await fetch(`${SUPABASE_CONFIG.url.replace(/\/$/,'')}/auth/v1/token?grant_type=password`,{method:'POST',headers:{apikey:SUPABASE_CONFIG.publishableKey,'Content-Type':'application/json'},body:JSON.stringify({email:`${String(nim).trim()}@simper.local`,password})});
      const data=await response.json();if(!response.ok||!data.access_token)return false;
      remoteToken=data.access_token;sessionStorage.setItem(TOKEN,remoteToken);
      const roles=await rows('app_role');
      if(!roles[0])throw Error('Peran akun belum tersedia');
      const members=await rows('member');
      const member=members.find(m=>m.nim===String(nim).trim());
      if(roles[0].role==='MEMBER'&&!member)throw Error('Profil anggota belum tersedia');
      account={nim:String(nim).trim(),memberId:member?.id||null,name:member?.name||data.user?.user_metadata?.name||roleNames[roles[0].role],role:roles[0].role};
      if(!state.accounts.some(a=>a.nim===account.nim))state.accounts.push(account);
    }catch{remoteToken=null;sessionStorage.removeItem(TOKEN);return false}
  }else if(password!=='12345')return false;
  session=account;role=account.role;currentMember=account.memberId;view='dashboard';
  sessionStorage.setItem(SESSION,account.nim);
  if(remoteEnabled){try{await refreshRemote()}catch{session=null;remoteToken=null;sessionStorage.removeItem(TOKEN);return false}}
  else audit('LOGIN_SUCCESS','Account',account.nim,`${roleNames[role]} masuk ke SIMPER.`);
  save();return true;
}
function logout(){
  if(paymentPoll)clearInterval(paymentPoll);
  if(session&&!remoteEnabled){audit('LOGOUT','Account',session.nim,'Sesi berakhir.');localStorage.setItem(STORE,JSON.stringify(state))}
  sessionStorage.removeItem(SESSION);sessionStorage.removeItem(TOKEN);remoteToken=null;session=null;role=null;currentMember=null;view='dashboard';render();
}
function render(){
  document.querySelector('#startup')?.remove();
  if(!session){$('#loginPage').hidden=false;$('#appShell').hidden=true;return}
  $('#loginPage').hidden=true;$('#appShell').hidden=false;
  if(!roleMenus[role].includes(view))view='dashboard';
  $('#profileName').textContent=session.name;$('#profileRole').textContent=roleNames[role];
  $('#pageTitle').textContent=titles[view][0];$('#pageSub').textContent=titles[view][1];$('#todayLabel').textContent=fmtLong(localDate());
  $('#nav').innerHTML=menu.filter(([v])=>roleMenus[role].includes(v)).map(([v,t])=>`<button type="button" data-view="${v}" class="${view===v?'active':''}" ${view===v?'aria-current="page"':''}>${t}</button>`).join('');
  const output={dashboard:renderDashboard,catalog:renderCatalog,circulation:renderCirculation,rooms:renderRooms,lost:renderLost,members:renderMembers,audit:renderAudit,settings:renderSettings};
  $('#app').innerHTML=output[view]();
  $('#app').classList.remove('page-enter');void $('#app').offsetWidth;$('#app').classList.add('page-enter');
}
function renderDashboard(){
  const mine=role==='MEMBER';
  const loanList=state.loans.filter(l=>!mine||l.memberId===currentMember);
  const bookingList=state.bookings.filter(b=>!mine||b.memberId===currentMember);
  const caseList=state.cases.filter(c=>!mine||c.memberId===currentMember);
  const stats=role==='FINANCE'?[
    [caseList.length,'KASUS TERCATAT','Kehilangan dan denda'],[caseList.filter(c=>c.status==='AWAITING_PAYMENT').length,'MENUNGGU PEMBAYARAN','Tagihan terbuka'],[caseList.filter(c=>c.payment?.receiptId).length,'KWITANSI TERBIT','Pembayaran terverifikasi'],[caseList.filter(c=>c.status==='CLOSED').length,'KASUS SELESAI','Terverifikasi']
  ]:role==='ADMIN'?[
    [state.members.length,'ANGGOTA TERDAFTAR','Data keanggotaan'],[state.books.length,'JUDUL BUKU','Koleksi katalog'],[state.audit.length,'PERISTIWA AUDIT','Tercatat dalam sistem'],[state.config.version,'VERSI PARAMETER','Aturan layanan']
  ]:[
    [loanList.filter(l=>activeLoan(l)).length,mine?'PINJAMAN AKTIF':'BUKU DIPINJAM','Sedang beredar'],
    [loanList.filter(l=>loanStatus(l)==='OVERDUE').length,'TERLAMBAT','Lewat jatuh tempo'],
    [bookingList.filter(b=>['SUBMITTED','APPROVED'].includes(b.status)).length,mine?'BOOKING SAYA':'BOOKING BERJALAN','Diajukan dan disetujui'],
    [mine?state.books.reduce((n,b)=>n+available(b),0):state.loans.filter(l=>l.status==='PENDING_CONFIRMATION').length,mine?'EKSEMPLAR TERSEDIA':'PENGAJUAN BUKU','Menunggu konfirmasi']
  ];
  const statsHtml=`<div class="stats">${stats.map(([n,label,note])=>`<div class="stat"><div class="stat-value">${n}</div><div class="stat-label">${label}</div><div class="stat-note">${note}</div></div>`).join('')}</div>`;
  if(role==='FINANCE'){
    const receipts=caseList.filter(c=>c.payment?.receiptId);
    return `${statsHtml}<div class="main-grid"><div>${panel(`${heading('KWITANSI','Pembayaran terverifikasi',`<button class="button secondary small" data-view="lost">Lihat semua kasus</button>`)}<div class="list-cards">${receipts.map(c=>`<div class="list-card"><div><strong>${esc(c.payment.receiptId)} · ${esc(findMember(c.memberId)?.name)}</strong><small>${esc(c.id)} · ${money(c.amount)} · ${fmt(c.payment.paidAt)}</small></div>${badge('Selesai','ok')}</div>`).join('')||empty('Belum ada kwitansi','Kwitansi akan muncul setelah pembayaran terverifikasi.')}</div>`)}</div><aside>${panel(`${heading('RINGKASAN','Penyelesaian kasus')}<p class="hint">Nominal pembayaran dan ID kwitansi terhubung ke setiap kasus keterlambatan atau kehilangan.</p><button class="button" data-view="lost">Buka register kasus</button>`)}</aside></div>`;
  }
  if(role==='ADMIN'){
    return `${statsHtml}<div class="main-grid"><div>${panel(`${heading('KONTROL SISTEM','Aktivitas terbaru',`<button class="button secondary small" data-view="audit">Lihat semua</button>`)}${state.audit.slice(0,7).map(a=>`<div class="activity"><span class="activity-mark"></span><div><strong>${esc(a.action.replaceAll('_',' '))} · ${esc(a.actor)}</strong><p>${esc(a.entity)} ${esc(a.entityId)} · ${new Date(a.at).toLocaleString('id-ID')}</p></div></div>`).join('')}`)}</div><aside>${panel(`${heading('PARAMETER','Aturan berjalan')}<div class="kpi-inline"><div><strong>${state.config.maxLoans}</strong>batas buku aktif</div><div><strong>${state.config.loanDays}</strong>hari peminjaman</div><div><strong>${state.config.roomMaxMinutes}</strong>menit booking</div></div><div class="info-strip">Versi parameter v${state.config.version}</div><button class="button secondary" data-view="settings">Kelola parameter</button>`)}</aside></div>`;
  }
  const rows=loanList.filter(l=>!['RETURNED','LATE_RETURNED'].includes(l.status)).slice(0,6).map(l=>`<tr><td><span class="primary">${esc(findBook(l.bookId)?.title)}</span><span class="subline">${esc(l.id)} · ${esc(findMember(l.memberId)?.name)}</span></td><td>${l.status==='READY_PICKUP'?'Ambil di perpustakaan: '+fmt(l.pickupDate):l.dueDate?fmt(l.dueDate):'Menunggu konfirmasi'}</td><td>${statusTag(loanStatus(l))}</td></tr>`).join('');
  const loanPanel=panel(`${heading('MONITORING','Pinjaman terbaru',`<button class="button secondary small" data-view="circulation">Lihat semua</button>`)}<div class="table-wrap"><table class="data-table"><thead><tr><th>BUKU / ANGGOTA</th><th>JATUH TEMPO</th><th>STATUS</th></tr></thead><tbody>${rows||`<tr><td colspan="3">${empty('Belum ada pinjaman','Transaksi baru akan muncul di sini.')}</td></tr>`}</tbody></table></div>`,'tight').replace('<section class="panel tight">','<section class="panel tight"><div style="padding:22px 22px 0">').replace('<div class="table-wrap">','</div><div class="table-wrap">');
  const activity=state.audit.slice(0,5).map(a=>`<div class="activity"><span class="activity-mark"></span><div><strong>${esc(a.action.replaceAll('_',' '))}</strong><p>${esc(a.entityId)} · ${esc(a.detail)}<br>${new Date(a.at).toLocaleString('id-ID')}</p></div></div>`).join('');
  const side=role==='MEMBER'?panel(`${heading('AKSES CEPAT','Layanan saya')}<div class="side-list"><div class="side-item"><span class="side-icon">⌕</span><div><strong>Cari dan ajukan buku</strong><span>Lihat jumlah eksemplar yang tersedia.</span></div></div><div class="side-item"><span class="side-icon">▦</span><div><strong>Pesan ruang diskusi</strong><span>Pilih ruang, tanggal, dan jam tanpa bentrok.</span></div></div><div class="side-item"><span class="side-icon">≡</span><div><strong>Pantau transaksi</strong><span>Pinjaman, booking, dan kasus milik Anda.</span></div></div></div><div class="inline-actions" style="margin-top:16px"><button class="button" data-view="catalog">Buka katalog</button><button class="button secondary" data-view="rooms">Pesan ruang</button></div>`):panel(`${heading('AKTIVITAS','Jejak terbaru')}<div class="side-list">${activity}</div>`);
  const programs=panel(`${heading('DATA ACUAN','Sebaran kelas aktif')}<p class="hint">Distribusi mahasiswa aktif menurut program studi pada tahun akademik 2025/2026.</p>${programStats.slice(0,5).map(([name,n])=>`<div class="program-row"><div class="program-label"><span>${esc(name)}</span><strong>${n.toLocaleString('id-ID')}</strong></div><div class="track"><span style="width:${(n/1393*100).toFixed(1)}%"></span></div></div>`).join('')}<p class="source-note">3.969 mahasiswa aktif tercatat pada 130 label kelas.</p>`);
  const work=role==='ADMIN'?panel(`${heading('KONTROL','Konfigurasi sistem')}<div class="list-cards"><div class="list-card"><div><strong>Audit transaksi</strong><small>Riwayat aktivitas aplikasi.</small></div>${badge(`${state.audit.length} entri`,'info')}</div><div class="list-card"><div><strong>Aturan peminjaman</strong><small>Versi ${state.config.version} · berlaku</small></div>${badge(`${state.config.maxLoans} buku / ${state.config.loanDays} hari`,'info')}</div></div><div class="info-strip">Setiap perubahan parameter disimpan bersama versi dan riwayat tindakan.</div>`):role==='FINANCE'?panel(`${heading('ANTRIAN','Verifikasi pembayaran')}<div class="list-cards">${caseList.filter(c=>c.payment?.status==='PENDING_VERIFICATION').map(c=>`<div class="list-card"><div><strong>${esc(c.id)}</strong><small>${esc(findMember(c.memberId)?.name)} · ${money(c.amount)}</small></div><button class="button small" data-view="lost">Tinjau</button></div>`).join('')||empty('Antrian kosong','Bukti pembayaran baru akan muncul di sini.')}</div>`):programs;
  return `${statsHtml}<div class="main-grid"><div class="stack">${loanPanel}${work}</div><div class="stack">${side}${role==='MEMBER'?panel(`${heading('PROFIL ANGGOTA','Anggota aktif')}<strong>${esc(findMember(currentMember)?.name)}</strong><p class="hint">${esc(findMember(currentMember)?.memberNo)}<br>${esc(findMember(currentMember)?.program)} · Kelas ${esc(findMember(currentMember)?.klass)}</p><p class="tiny-note">Lihat pinjaman dan pemesanan Anda melalui menu layanan.</p>`):panel(`${heading('ARSIP','Ruang diskusi')}<p class="hint">Pemesanan tersedia untuk sepuluh ruang diskusi, dengan pilihan waktu per jam.</p>`)}</div></div>`;
}
function renderCatalog(){
  const cats=[...new Set(state.books.map(b=>b.category))].sort();
  const q=filters.catalog.toLowerCase().trim();
  const books=state.books.filter(b=>(!q||[b.title,b.author,b.isbn,b.category,b.shelf].some(x=>String(x).toLowerCase().includes(q)))&&(!filters.category||b.category===filters.category)&&(!filters.availability||filters.availability==='yes'&&available(b)>0||filters.availability==='no'&&available(b)===0));
  const shown=books.slice(0,filters.catalogLimit);
  return `<div class="filter-panel"><form id="catalogFilter" class="filter-grid three">${field('CARI JUDUL / KODE / RAK',`<input name="catalog" value="${esc(filters.catalog)}" placeholder="Ketik kata kunci…">`)}${field('KATEGORI',select('category',[['','Semua kategori'],...cats.map(c=>[c,c])],filters.category))}${field('KETERSEDIAAN',select('availability',[['','Semua status'],['yes','Tersedia'],['no','Tidak tersedia']],filters.availability))}<div class="inline-actions"><button class="button" type="submit">Terapkan filter</button><button class="button secondary" type="button" data-action="clearCatalog">Reset filter</button></div></form></div><div class="section-head"><div><span class="section-kicker">DAFTAR KOLEKSI</span><h2>${books.length} judul ditemukan</h2><p>Jumlah tersedia dihitung dari status setiap eksemplar.</p></div></div><div class="catalog-grid">${shown.map(b=>`<article class="book-card"><img class="book-cover" src="${esc(b.cover)}" alt="Sampul ${esc(b.title)}" loading="lazy"><span class="section-kicker">${esc(b.category.toUpperCase())} · ${b.year}</span><h3>${esc(b.title)}</h3><p>${esc(b.author)}<br>Kode: ${esc(b.isbn)} · ${esc(b.shelf)}</p><div class="book-bottom"><div><strong>${available(b)} <span class="muted" style="font-size:15px">/ ${b.copies.length}</span></strong><small>eksemplar tersedia</small></div>${role==='MEMBER'?`<button class="button small" data-action="requestBook" data-id="${b.id}" ${available(b)<1?'disabled':''}>Ajukan pinjam</button>`:badge(available(b)?'Tersedia':'Dipinjam',available(b)?'ok':'warn')}</div></article>`).join('')||empty('Tidak ada hasil','Coba kata kunci atau kategori lain.')}</div>${shown.length<books.length?`<div class="load-more"><button class="button secondary" data-action="moreBooks">Muat 24 judul lagi (${books.length-shown.length} tersisa)</button></div>`:''}<div class="info-strip">Lokasi rak dan jumlah eksemplar terdapat pada setiap kartu buku.</div>`;
}
function renderCirculation(){
  const staff=role==='LIBRARIAN';
  const scoped=state.loans.filter(own).filter(l=>(!filters.loanStatus||loanStatus(l)===filters.loanStatus)&&(!filters.loanMember||l.memberId===filters.loanMember));
  const form=staff?panel(`${heading('TRANSAKSI BARU','Buat pengajuan pinjaman')}<form id="loanForm" class="form-grid">${field('ANGGOTA',select('memberId',memberOptions()))}${field('BUKU',select('bookId',bookOptions()))}<div class="wide"><button class="button" type="submit">Buat pengajuan</button></div></form><p class="hint">Konfirmasi menetapkan tanggal ambil. Saat anggota datang, pindai KTM atau masukkan NIM untuk mencatat serah terima.</p>`):panel(`${heading('ALUR PINJAMAN','Pengajuan dan serah terima')}<p class="hint">Ajukan buku melalui katalog. Setelah pustakawan menyiapkan buku, tanggal ambil muncul di sini. Jatuh tempo dihitung sejak KTM diverifikasi saat pengambilan.</p><button class="button secondary" data-view="catalog">Cari buku</button>`);
  const rows=scoped.map(l=>`<tr><td><span class="primary">${esc(l.id)}</span><span class="subline">${esc(findMember(l.memberId)?.name)} · NIM ${esc(findMember(l.memberId)?.nim)}</span></td><td><span class="book-title">${esc(findBook(l.bookId)?.title)}</span><span class="book-meta">${esc(l.barcode||'Belum ditetapkan')} · ${esc(findBook(l.bookId)?.shelf)}</span></td><td>${fmt(l.requestDate)}</td><td>${l.pickupDate?fmt(l.pickupDate):'—'}</td><td>${l.dueDate?fmt(l.dueDate):'Dihitung saat diambil'}</td><td>${statusTag(loanStatus(l))}</td><td>${staff?l.status==='PENDING_CONFIRMATION'?`<button class="button small" data-action="confirmLoan" data-id="${l.id}">Tetapkan tanggal ambil</button>`:l.status==='READY_PICKUP'?`<button class="button small" data-action="handoverLoan" data-id="${l.id}">Pindai KTM / ambil</button>`:activeLoan(l)?`<button class="button secondary small" data-action="returnLoan" data-id="${l.id}">Periksa pengembalian</button>`:'—':role==='MEMBER'&&activeLoan(l)?`<button class="button ghost small" data-action="reportLost" data-id="${l.id}">Laporkan hilang</button>`:'—'}</td></tr>`).join('');
  const stats=`<div class="stats"><div class="stat"><div class="stat-value">${scoped.filter(activeLoan).length}</div><div class="stat-label">SEDANG DIPINJAM</div></div><div class="stat"><div class="stat-value">${scoped.filter(l=>loanStatus(l)==='OVERDUE').length}</div><div class="stat-label">LEWAT JATUH TEMPO</div></div><div class="stat"><div class="stat-value">${scoped.filter(l=>l.status==='READY_PICKUP').length}</div><div class="stat-label">SIAP DIAMBIL</div></div><div class="stat"><div class="stat-value">${scoped.filter(l=>l.status==='PENDING_CONFIRMATION').length}</div><div class="stat-label">PERLU KONFIRMASI</div></div></div>`;
  return `${stats}${form}<div class="filter-panel" style="margin-top:20px"><form id="loanFilter" class="toolbar">${field('STATUS',select('loanStatus',[['','Semua status'],['PENDING_CONFIRMATION','Menunggu'],['READY_PICKUP','Siap diambil'],['ACTIVE','Aktif'],['OVERDUE','Terlambat'],['RETURNED','Dikembalikan'],['LATE_RETURNED','Terlambat dikembalikan'],['LOST','Hilang']],filters.loanStatus))}${staff?field('ANGGOTA',select('loanMember',[['','Semua anggota'],...memberOptions()],filters.loanMember)):''}<button class="button" type="submit">Terapkan</button><button class="button secondary" type="button" data-action="clearLoan">Reset</button><button class="button secondary" type="button" data-action="exportLoans">Unduh CSV</button></form></div>${panel(`${heading('MONITORING',staff?'Seluruh transaksi pinjaman':'Riwayat pinjaman saya')}<div class="table-wrap"><table class="data-table"><thead><tr><th>ID / ANGGOTA</th><th>JUDUL & RAK</th><th>PENGAJUAN</th><th>TANGGAL AMBIL</th><th>JATUH TEMPO</th><th>STATUS</th><th>TINDAKAN</th></tr></thead><tbody>${rows||`<tr><td colspan="7">${empty('Belum ada transaksi','Data akan tampil setelah pengajuan dibuat.')}</td></tr>`}</tbody></table></div><div class="table-foot"><span>Menampilkan ${scoped.length} transaksi</span><span>Batas layanan: ${state.config.maxLoans} buku · ${state.config.loanDays} hari sejak serah terima</span></div>`,'tight').replace('<section class="panel tight">','<section class="panel tight"><div style="padding:22px 22px 0">').replace('<div class="table-wrap">','</div><div class="table-wrap">')}`;
}
function renderRooms(){
  const date=filters.bookingDate||offsetDate(1),roomId=Number(filters.bookingRoom||1),staff=role==='LIBRARIAN';
  const slots=Array.from({length:9},(_,i)=>{const start=`${String(i+8).padStart(2,'0')}:00`,end=`${String(i+9).padStart(2,'0')}:00`;const taken=state.bookings.find(b=>b.roomId===roomId&&b.date===date&&['SUBMITTED','APPROVED'].includes(b.status)&&start<b.end&&end>b.start);return `<button type="button" class="slot ${taken?'taken':selectedSlot===start?'selected':''}" data-action="pickSlot" data-id="${start}" ${taken?'disabled':''}><strong>${start}</strong><small>${taken?'Tidak tersedia':'Tersedia'}</small></button>`}).join('');
  const visible=state.bookings.filter(own).filter(b=>!filters.bookingStatus||b.status===filters.bookingStatus).sort((a,b)=>b.date.localeCompare(a.date));
  const rows=visible.map(b=>`<tr><td><span class="primary">${esc(b.id)}</span><span class="subline">${esc(findMember(b.memberId)?.name)}</span></td><td>${esc(roomLabel(b.roomId))}</td><td>${fmt(b.date)}<span class="subline">${esc(b.start)}–${esc(b.end)}</span></td><td>${esc(b.purpose)}<span class="subline">${b.participants} orang</span></td><td>${statusTag(b.status)}</td><td>${staff&&b.status==='SUBMITTED'?`<div class="inline-actions"><button class="button small" data-action="approveBooking" data-id="${b.id}">Setujui</button><button class="button ghost small" data-action="rejectBooking" data-id="${b.id}">Tolak</button></div>`:role==='MEMBER'&&b.memberId===currentMember&&['SUBMITTED','APPROVED'].includes(b.status)?`<button class="button ghost small" data-action="cancelBooking" data-id="${b.id}">Batalkan</button>`:'—'}</td></tr>`).join('');
  return `<div class="split"><div class="stack">${panel(`${heading('CEK JADWAL','Ketersediaan ruang')}<form id="roomFilter" class="form-grid">${field('RUANG',select('bookingRoom',roomNames.map((n,i)=>[i+1,n]),roomId))}${field('TANGGAL',`<input type="date" name="bookingDate" value="${esc(date)}" min="${localDate()}" required>`)}<div class="wide"><button class="button secondary" type="submit">Lihat jadwal</button></div></form><hr class="divider"><div class="section-head"><div><span class="section-kicker">${fmt(date).toUpperCase()}</span><h3>${esc(roomLabel(roomId))}</h3></div>${badge('08.00–17.00','info')}</div><div class="schedule-grid">${slots}</div><p class="tiny-note">Slot yang diajukan maupun disetujui memblokir pemesanan lain pada jam yang bertumpang tindih.</p>`)}
  ${role==='MEMBER'?panel(`${heading('PENGAJUAN','Pesan ruang diskusi')}<form id="bookingForm" class="form-grid">${field('RUANG',select('roomId',roomNames.map((n,i)=>[i+1,n]),roomId))}${field('TANGGAL',`<input type="date" name="date" min="${localDate()}" value="${esc(date)}" required>`)}${field('MULAI',select('start',Array.from({length:9},(_,i)=>{let t=`${String(i+8).padStart(2,'0')}:00`;return[t,t]}),selectedSlot||'09:00'))}${field('SELESAI',select('end',Array.from({length:9},(_,i)=>{let t=`${String(i+9).padStart(2,'0')}:00`;return[t,t]}),'10:00'))}${field('JUMLAH PEMAKAI',`<input type="number" name="participants" min="1" max="20" value="4" required>`)}${field('KEPERLUAN',formText('purpose','Diskusi kelompok'))}<div class="wide"><button class="button" type="submit">Ajukan pemesanan</button><p class="tiny-note">Batas durasi pemesanan ${state.config.roomMaxMinutes} menit.</p></div></form>`):panel(`${heading('ALUR PERSETUJUAN','Pemeriksaan booking')}<p class="hint">Pustakawan dapat menyetujui atau menolak booking yang diajukan. Pemeriksaan bentrok dilakukan kembali saat persetujuan.</p><div class="kpi-inline"><div><strong>${state.bookings.filter(b=>b.status==='SUBMITTED').length}</strong>menunggu persetujuan</div><div><strong>${state.bookings.filter(b=>b.status==='APPROVED').length}</strong>disetujui</div></div>`)}</div><aside>${panel(`${heading('INFORMASI','Ruang & data acuan')}<p class="hint">Tersedia ${roomNames.length} ruang diskusi dengan pilihan jadwal 08.00–17.00.</p><div class="info-strip">Pemesanan yang diajukan maupun disetujui akan menutup slot agar tidak terjadi bentrok.</div><p class="source-note">Isi jumlah pemakai dan keperluan agar petugas dapat meninjau pengajuan.</p>`)}</aside></div><div style="height:22px"></div><div class="filter-panel"><form id="bookingStatusFilter" class="toolbar">${field('STATUS',select('bookingStatus',[['','Semua status'],['SUBMITTED','Diajukan'],['APPROVED','Disetujui'],['REJECTED','Ditolak'],['CANCELLED','Dibatalkan']],filters.bookingStatus))}<button class="button" type="submit">Terapkan</button></form></div>${panel(`${heading('RIWAYAT',role==='MEMBER'?'Pemesanan saya':'Daftar pemesanan')}<div class="table-wrap"><table class="data-table"><thead><tr><th>ID / PEMESAN</th><th>RUANG</th><th>TANGGAL & JAM</th><th>KEPERLUAN</th><th>STATUS</th><th>TINDAKAN</th></tr></thead><tbody>${rows||`<tr><td colspan="6">${empty('Belum ada pemesanan','Ajukan ruang melalui formulir di atas.')}</td></tr>`}</tbody></table></div>`,'tight').replace('<section class="panel tight">','<section class="panel tight"><div style="padding:22px 22px 0">').replace('<div class="table-wrap">','</div><div class="table-wrap">')}`;
}
function renderLost(){
  const visible=state.cases.filter(own),staff=role==='LIBRARIAN',finance=role==='FINANCE';
  const rows=visible.map(c=>{const l=state.loans.find(x=>x.id===c.loanId);const pay=c.payment;return `<tr><td><span class="primary">${esc(c.id)}</span><span class="subline">${esc(findMember(c.memberId)?.name)} · ${fmt(c.reportedAt)}</span></td><td><strong>${c.type==='LATE'?'Denda keterlambatan':'Ganti rugi kehilangan'}</strong><span class="subline">${esc(findBook(l?.bookId)?.title)} · ${esc(c.loanId)}</span></td><td>${money(c.amount)}<span class="subline">${esc(c.notes||'')}</span></td><td>${statusTag(c.status)}${pay?`<span class="subline">Order: ${esc(pay.orderId||pay.id)}</span>`:''}</td><td>${pay?.receiptId?`<strong>${esc(pay.receiptId)}</strong><span class="subline">${fmt(pay.paidAt)}</span>`:'—'}</td><td>${staff&&c.status==='REPORTED'?`<button class="button small" data-action="assess" data-id="${c.id}">Tetapkan nilai</button>`:role==='MEMBER'&&c.status==='AWAITING_PAYMENT'?`<button class="button small" data-action="payCase" data-id="${c.id}">Bayar</button>`:'—'}</td></tr>`}).join('');
  return `<div class="stats"><div class="stat"><div class="stat-value">${visible.length}</div><div class="stat-label">TOTAL KASUS</div></div><div class="stat"><div class="stat-value">${visible.filter(c=>c.type==='LATE').length}</div><div class="stat-label">DENDA TERLAMBAT</div></div><div class="stat"><div class="stat-value">${visible.filter(c=>c.type==='LOST').length}</div><div class="stat-label">BUKU HILANG</div></div><div class="stat"><div class="stat-value">${visible.filter(c=>c.status==='CLOSED').length}</div><div class="stat-label">SELESAI</div></div></div><div class="split"><div>${panel(`${heading('ATURAN','Rincian kewajiban')}<p class="hint">Denda keterlambatan ${money(state.config.lateFeePerDay)} per hari. Ganti rugi kehilangan mengikuti nilai penggantian buku yang dicatat pada katalog atau penilaian pustakawan.</p><p class="hint">ID kwitansi diterbitkan setelah pembayaran terverifikasi oleh penyedia pembayaran dan dapat dilihat petugas keuangan.</p>`)}</div><aside>${panel(`${heading('PEMBAYARAN','QR satu transaksi')}<p class="hint">Nominal QR mengikuti tagihan pada kasus. Setelah pembayaran sukses terverifikasi, kasus ditutup dan ID kwitansi tercatat otomatis.</p>`)}</aside></div><div style="height:22px"></div>${panel(`${heading('REGISTER KASUS',role==='MEMBER'?'Kewajiban saya':finance?'Kasus dan kwitansi keuangan':'Kehilangan dan denda')}<div class="table-wrap"><table class="data-table"><thead><tr><th>ID / ANGGOTA</th><th>JENIS & BUKU</th><th>NOMINAL</th><th>STATUS</th><th>ID KWITANSI</th><th>TINDAKAN</th></tr></thead><tbody>${rows||`<tr><td colspan="6">${empty('Belum ada kasus','Kasus akan tercatat setelah pemeriksaan pengembalian.')}</td></tr>`}</tbody></table></div>`,'tight').replace('<section class="panel tight">','<section class="panel tight"><div style="padding:22px 22px 0">').replace('<div class="table-wrap">','</div><div class="table-wrap">')}`;
}
function renderMembers(){
  const q=filters.memberSearch.trim().toLowerCase();
  const list=state.members.filter(m=>!q||[m.name,m.nim,m.memberNo,m.email,m.program,m.klass].some(v=>String(v).toLowerCase().includes(q)));
  const rows=list.map(m=>`<tr><td><span class="primary">${esc(m.name)}</span><span class="subline">NIM ${esc(m.nim)} · ${esc(m.memberNo)}</span></td><td>${esc(m.program)}<span class="subline">Kelas ${esc(m.klass)}</span></td><td>${statusTag(m.status)}</td><td>${m.status==='PENDING_VERIFICATION'?`<button class="button small" data-action="verifyMember" data-id="${m.id}">Verifikasi</button>`:'—'}</td></tr>`).join('');
  const firstProgram=Object.keys(classDirectory)[0];
  const table=panel(`${heading('DAFTAR ANGGOTA','Perekaman anggota')}<form id="memberFilter" class="toolbar"><div class="field grow"><label>CARI NAMA / NIM / PROGRAM</label><input name="memberSearch" value="${esc(filters.memberSearch)}" placeholder="Cari anggota…"></div><button class="button" type="submit">Cari</button><button class="button secondary" type="button" data-action="clearMember">Reset</button></form><div class="table-wrap" style="margin-top:20px"><table class="data-table"><thead><tr><th>NAMA / NIM</th><th>PROGRAM & KELAS</th><th>STATUS</th><th>TINDAKAN</th></tr></thead><tbody>${rows||`<tr><td colspan="4">${empty('Tidak ditemukan','Periksa kembali kata pencarian.')}</td></tr>`}</tbody></table></div>`,'tight').replace('<section class="panel tight">','<section class="panel tight"><div style="padding:22px 22px 0">').replace('<div class="table-wrap" style="margin-top:20px">','</div><div class="table-wrap" style="margin-top:20px">');
  const reg=panel(`${heading('ANGGOTA BARU','Form registrasi')}<form id="memberForm" class="form-grid">${field('NIM',`<input name="nim" inputmode="numeric" pattern="[0-9]{10}" maxlength="10" placeholder="NIM 10 digit" required>`)}${field('NAMA LENGKAP',formText('name','Nama anggota'))}${field('EMAIL',formText('email','nama@pknstan.ac.id','email'))}<div class="field"><label>PROGRAM STUDI</label><select id="memberProgram" name="program">${Object.keys(classDirectory).map(p=>`<option value="${esc(p)}">${esc(p)}</option>`).join('')}</select></div><div class="field wide"><label>KELAS</label><select id="memberClass" name="klass">${classDirectory[firstProgram].map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('')}</select></div><div class="wide"><button class="button" type="submit">Daftarkan anggota</button><p class="tiny-note">Status anggota baru menunggu verifikasi pustakawan.</p></div></form>`);
  return `<div class="stats"><div class="stat"><div class="stat-value">${state.members.length}</div><div class="stat-label">ANGGOTA TERDAFTAR</div></div><div class="stat"><div class="stat-value">${state.members.filter(m=>m.status==='ACTIVE').length}</div><div class="stat-label">AKTIF</div></div><div class="stat"><div class="stat-value">${state.members.filter(m=>m.status==='PENDING_VERIFICATION').length}</div><div class="stat-label">PERLU VERIFIKASI</div></div><div class="stat"><div class="stat-value">130</div><div class="stat-label">KELAS TERDATA</div><div class="stat-note">Tahun akademik 2025/2026</div></div></div><div class="split"><div>${table}</div><aside>${reg}</aside></div><div class="info-strip">Pilihan program studi dan kelas mengikuti data akademik tahun 2025/2026.</div>`;
}
function renderAudit(){const q=filters.auditSearch.toLowerCase().trim();const list=state.audit.filter(a=>!q||[a.action,a.actor,a.entity,a.entityId,a.detail].some(v=>String(v).toLowerCase().includes(q)));return `${panel(`${heading('BUKTI TRANSAKSI','Peristiwa tercatat',`<button class="button secondary small" data-action="exportAudit">Unduh CSV</button>`)}<p class="hint">Log menampilkan pelaku, waktu, entitas, ID, dan ringkasan tindakan. Tidak berisi password atau nomor telepon.</p><form id="auditFilter" class="toolbar"><div class="field grow"><label>CARI EVENT / ENTITAS / ID</label><input name="auditSearch" value="${esc(filters.auditSearch)}" placeholder="Cari kode peristiwa"></div><button class="button" type="submit">Cari</button></form><div class="table-wrap" style="margin-top:19px"><table class="data-table"><thead><tr><th>WAKTU</th><th>ACTOR</th><th>PERISTIWA</th><th>ENTITAS / ID</th><th>RINGKASAN</th></tr></thead><tbody>${list.map(a=>`<tr><td>${new Date(a.at).toLocaleString('id-ID')}</td><td>${esc(a.actor)}</td><td>${badge(a.action,'info')}</td><td>${esc(a.entity)}<span class="subline">${esc(a.entityId)}</span></td><td>${esc(a.detail)}</td></tr>`).join('')||`<tr><td colspan="5">${empty('Tidak ada hasil','Ubah kata pencarian.')}</td></tr>`}</tbody></table></div><div class="table-foot">${list.length} peristiwa tercatat</div>`,'tight').replace('<section class="panel tight">','<section class="panel tight"><div style="padding:22px 22px 0">').replace('<div class="table-wrap" style="margin-top:19px">','</div><div class="table-wrap" style="margin-top:19px">')}`}
function renderSettings(){return `<div class="split"><div>${panel(`${heading('KONFIGURASI','Parameter operasional')}<form id="configForm" class="form-grid">${field('MAKSIMUM PINJAMAN AKTIF',`<input type="number" name="maxLoans" min="1" max="20" value="${state.config.maxLoans}" required>`)}${field('LAMA PINJAMAN (HARI)',`<input type="number" name="loanDays" min="1" max="90" value="${state.config.loanDays}" required>`)}${field('BATAS BOOKING (MENIT)',`<input type="number" name="roomMaxMinutes" min="60" max="480" step="60" value="${state.config.roomMaxMinutes}" required>`)}<div class="field"><label>VERSI BERLAKU</label><input value="v${state.config.version}" disabled></div><div class="wide"><button class="button" type="submit">Simpan versi baru</button><p class="tiny-note">Pinjaman lama menyimpan versi parameter saat konfirmasi; tanggal jatuh temponya tidak dihitung ulang.</p></div></form>`)}</div><aside>${panel(`${heading('ATURAN LAYANAN','Pengelolaan parameter')}<p class="hint">Batas pinjaman, lama pinjam, dan durasi pemesanan dapat diperbarui sesuai kebijakan layanan.</p><p class="source-note">Perubahan parameter hanya dapat dilakukan Admin dan dicatat dalam riwayat aktivitas.</p>`)}</aside></div>`}
function modal(title,description,fields,button,submit){
  document.querySelector('.modal-backdrop')?.remove();
  const root=document.createElement('div');root.className='modal-backdrop';root.innerHTML=`<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle"><h2 id="modalTitle">${esc(title)}</h2><p>${esc(description)}</p><form id="modalForm">${fields}<div class="modal-actions"><button type="button" class="button secondary" id="closeModal">Batal</button><button class="button" type="submit">${esc(button)}</button></div></form></div>`;
  document.body.append(root);root.addEventListener('click',e=>{if(e.target===root||e.target.id==='closeModal')root.remove()});
  root.querySelector('form').addEventListener('submit',async e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.target));const button=e.target.querySelector('button[type="submit"]');button.disabled=true;button.classList.add('busy');try{if(await submit(data)!==false)root.remove()}finally{button.disabled=false;button.classList.remove('busy')}});
  root.querySelector('input,select,textarea,button')?.focus();
}
function requestBook(bookId,memberId=currentMember){
  if(remoteEnabled)return runRemote(()=>rpc(role==='LIBRARIAN'?'request_book_for':'request_book',role==='LIBRARIAN'?{p_member:memberId,p_book:bookId}:{p_book:bookId}));
  const b=findBook(bookId),m=findMember(memberId);
  if(!b||!m)return fail('Buku atau anggota tidak ditemukan.');
  if(m.status!=='ACTIVE')return fail('Keanggotaan belum aktif. Verifikasi diperlukan.');
  const count=state.loans.filter(l=>l.memberId===memberId&&(activeLoan(l)||['PENDING_CONFIRMATION','READY_PICKUP'].includes(l.status))).length;
  if(count>=state.config.maxLoans)return fail(`Batas ${state.config.maxLoans} pinjaman/pengajuan tercapai.`);
  if(available(b)<1)return fail('Tidak ada eksemplar tersedia.');
  if(state.loans.some(l=>l.memberId===memberId&&l.bookId===bookId&&(activeLoan(l)||['PENDING_CONFIRMATION','READY_PICKUP'].includes(l.status))))return fail('Judul ini sudah dalam pinjaman atau pengajuan aktif.');
  const loan={id:id('LN',state.loans),memberId,bookId,barcode:null,requestDate:localDate(),loanDate:null,dueDate:null,status:'PENDING_CONFIRMATION',parameterVersion:null};
  state.loans.unshift(loan);audit('LOAN_REQUESTED','Loan',loan.id,`${m.memberNo} · ${b.title}`);save();toast('Pengajuan dibuat. Menunggu konfirmasi pustakawan.');return true;
}
function confirmLoan(loanId,pickupDate){
  if(remoteEnabled)return runRemote(()=>rpc('approve_loan',{p_loan:loanId,p_pickup:pickupDate}));
  if(role!=='LIBRARIAN')return fail('Hanya pustakawan dapat mengonfirmasi pinjaman.');
  const l=state.loans.find(x=>x.id===loanId);if(!l||l.status!=='PENDING_CONFIRMATION')return fail('Pengajuan tidak lagi menunggu konfirmasi.');
  const m=findMember(l.memberId),b=findBook(l.bookId);if(m?.status!=='ACTIVE')return fail('Anggota tidak aktif.');
  if(state.loans.filter(x=>x.memberId===m.id&&activeLoan(x)).length>=state.config.maxLoans)return fail('Batas pinjaman aktif tercapai.');
  const copy=b?.copies.find(c=>c.status==='AVAILABLE');if(!copy)return fail('Eksemplar sudah tidak tersedia.');
  if(state.loans.some(x=>x.id!==l.id&&x.barcode===copy.barcode&&activeLoan(x)))return fail('Eksemplar sudah terikat pinjaman lain.');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(pickupDate)||pickupDate<localDate())return fail('Tanggal pengambilan tidak valid.');
  l.barcode=copy.barcode;l.pickupDate=pickupDate;l.parameterVersion=state.config.version;l.loanDays=state.config.loanDays;l.status='READY_PICKUP';copy.status='RESERVED';
  audit('LOAN_READY_PICKUP','Loan',l.id,`${copy.barcode} · ambil ${pickupDate} · parameter v${l.parameterVersion}`);save();toast('Buku disiapkan. Tanggal ambil muncul di dasbor anggota.');return true;
}
function verifyKtm(l,nim){
  const member=findMember(l.memberId);
  return member&&String(nim).trim()===member.nim;
}
function handoverLoan(loanId,nim){
  if(remoteEnabled)return runRemote(()=>rpc('handover_loan',{p_loan:loanId,p_scanned_nim:nim}));
  if(role!=='LIBRARIAN')return fail('Hanya pustakawan dapat menyerahkan buku.');
  const l=state.loans.find(x=>x.id===loanId);if(!l||l.status!=='READY_PICKUP')return fail('Pinjaman tidak siap diambil.');
  if(!verifyKtm(l,nim))return fail('NIM KTM tidak sesuai dengan peminjam.');
  if(localDate()<l.pickupDate)return fail('Tanggal pengambilan belum tiba.');
  const c=findBook(l.bookId)?.copies.find(x=>x.barcode===l.barcode);
  if(c?.status!=='RESERVED')return fail('Eksemplar tidak dalam status siap diambil.');
  const due=new Date(`${localDate()}T12:00:00`);due.setDate(due.getDate()+l.loanDays);
  l.loanDate=localDate();l.dueDate=localDate(due);l.status='ACTIVE';l.verifiedNim=nim;c.status='ON_LOAN';
  audit('BOOK_HANDED_OVER','Loan',l.id,`KTM ${nim} · ${l.barcode} · jatuh tempo ${l.dueDate}`);save();toast('KTM terverifikasi. Pinjaman aktif dan jatuh tempo ditetapkan.');return true;
}
function returnLoan(loanId,nim,condition='BAIK',resolution='RETURNED'){
  if(remoteEnabled)return runRemote(()=>rpc('complete_loan',{p_loan:loanId,p_scanned_nim:nim,p_result:resolution}));
  if(role!=='LIBRARIAN')return fail('Hanya pustakawan dapat memproses pengembalian.');
  const l=state.loans.find(x=>x.id===loanId);if(!l||!activeLoan(l))return fail('Pinjaman sudah selesai atau tidak aktif.');
  if(!verifyKtm(l,nim))return fail('NIM KTM tidak sesuai dengan peminjam.');
  const c=findBook(l.bookId)?.copies.find(c=>c.barcode===l.barcode);if(!c||c.status!=='ON_LOAN')return fail('Status eksemplar tidak sesuai.');
  if(!['BAIK','CATATAN'].includes(condition))return fail('Kondisi eksemplar tidak valid.');
  if(!['RETURNED','LOST'].includes(resolution))return fail('Hasil pemeriksaan tidak valid.');
  l.returnDate=localDate();l.returnId=id('RT',state.loans.filter(x=>x.returnId));l.returnCondition=condition;l.verifiedNim=nim;
  if(resolution==='LOST'){
    const amount=findBook(l.bookId).replacementValue;
    l.status='LOST';c.status='LOST';
    state.cases.unshift({id:id('KS',state.cases),type:'LOST',loanId:l.id,memberId:l.memberId,reportedAt:localDate(),notes:'Kehilangan diverifikasi saat pemeriksaan pengembalian.',status:'AWAITING_PAYMENT',amount,payment:null});
  }else{
    const days=Math.max(0,Math.round((new Date(`${localDate()}T12:00:00`)-new Date(`${l.dueDate}T12:00:00`))/86400000));
    l.status=days?'LATE_RETURNED':'RETURNED';c.status='AVAILABLE';
    if(days)state.cases.unshift({id:id('KS',state.cases),type:'LATE',loanId:l.id,memberId:l.memberId,reportedAt:localDate(),notes:`${days} hari × ${money(state.config.lateFeePerDay)}`,daysLate:days,status:'AWAITING_PAYMENT',amount:days*state.config.lateFeePerDay,payment:null});
  }
  audit('RETURN_VERIFIED','Return',l.returnId,`KTM ${nim} · ${l.barcode} · hasil ${l.status}`);save();toast(resolution==='LOST'?'Kasus kehilangan dan ganti rugi tercatat.':l.status==='LATE_RETURNED'?'Pengembalian terlambat dan denda tercatat.':'Pengembalian selesai.');return true;
}
function reportLost(loanId){
  if(remoteEnabled)return runRemote(()=>rpc('report_lost',{p_loan:loanId}));
  if(!['MEMBER','LIBRARIAN'].includes(role))return fail('Akses tidak sesuai.');
  const l=state.loans.find(x=>x.id===loanId);if(!l||!activeLoan(l))return fail('Hanya pinjaman aktif yang dapat dilaporkan.');
  if(role==='MEMBER'&&l.memberId!==currentMember)return fail('Hanya pinjaman milik Anda yang dapat dilaporkan.');
  if(state.cases.some(c=>c.loanId===l.id&&c.status!=='CANCELLED'))return fail('Kasus untuk pinjaman ini sudah ada.');
  modal('Laporkan buku hilang',`${findBook(l.bookId)?.title} · ${l.id}`,field('CATATAN',`<textarea name="notes" placeholder="Jelaskan singkat kejadian" required maxlength="400"></textarea>`),'Simpan laporan',d=>{
    const c=findBook(l.bookId)?.copies.find(x=>x.barcode===l.barcode);if(!c||c.status!=='ON_LOAN')return fail('Status eksemplar berubah.');
    const item={id:id('KS',state.cases),type:'LOST',loanId:l.id,memberId:l.memberId,reportedAt:localDate(),notes:d.notes.trim(),status:'REPORTED',amount:null,payment:null};state.cases.unshift(item);l.status='LOST';c.status='LOST';audit('LOSS_REPORTED','LostBookCase',item.id,`Pinjaman ${l.id} · ${d.notes.trim().slice(0,70)}`);save();toast('Kasus kehilangan tercatat.');return true;
  });return true;
}
function bookRoom(d){
  if(remoteEnabled){
    const start=new Date(`${d.date}T${d.start}:00+07:00`),end=new Date(`${d.date}T${d.end}:00+07:00`);
    if(Number.isNaN(start.getTime())||Number.isNaN(end.getTime()))return fail('Tanggal atau jam tidak valid.');
    return runRemote(()=>rpc('request_room',{p_room:Number(d.roomId),p_start:start.toISOString(),p_end:end.toISOString(),p_purpose:d.purpose,p_participants:Number(d.participants)}));
  }
  if(role!=='MEMBER')return fail('Hanya anggota yang dapat mengajukan booking.');
  if(findMember(currentMember)?.status!=='ACTIVE')return fail('Keanggotaan belum aktif.');
  const roomId=Number(d.roomId),n=Number(d.participants),minutes=(Number(d.end.slice(0,2))*60+Number(d.end.slice(3)))-(Number(d.start.slice(0,2))*60+Number(d.start.slice(3)));
  if(!roomNames[roomId-1]||d.date<localDate()||d.start<'08:00'||d.end>'17:00'||minutes<=0||minutes>state.config.roomMaxMinutes||!Number.isInteger(n)||n<1||n>20)return fail('Periksa tanggal, waktu, durasi, dan jumlah pemakai.');
  if(!d.purpose.trim())return fail('Keperluan harus diisi.');
  if(state.bookings.some(b=>b.roomId===roomId&&b.date===d.date&&['SUBMITTED','APPROVED'].includes(b.status)&&d.start<b.end&&d.end>b.start))return fail('Slot bertabrakan dengan booking lain. Pilih waktu berbeda.');
  const b={id:id('RB',state.bookings),memberId:currentMember,roomId,date:d.date,start:d.start,end:d.end,participants:n,purpose:d.purpose.trim(),status:'SUBMITTED'};state.bookings.unshift(b);audit('BOOKING_SUBMITTED','RoomBooking',b.id,`${roomLabel(roomId)} · ${d.date} ${d.start}–${d.end}`);filters.bookingDate=d.date;filters.bookingRoom=String(roomId);selectedSlot='';save();toast('Pemesanan diajukan. Menunggu persetujuan.');return true;
}
function approveBooking(bookingId){
  if(remoteEnabled)return runRemote(()=>rpc('decide_room',{p_booking:bookingId,p_approve:true,p_reason:null}));
  if(role!=='LIBRARIAN')return fail('Hanya pustakawan dapat memutuskan booking.');
  const b=state.bookings.find(x=>x.id===bookingId);if(!b||b.status!=='SUBMITTED')return fail('Booking tidak menunggu persetujuan.');
  if(state.bookings.some(x=>x.id!==b.id&&x.roomId===b.roomId&&x.date===b.date&&x.status==='APPROVED'&&b.start<x.end&&b.end>x.start))return fail('Terdapat bentrok dengan booking yang disetujui.');
  b.status='APPROVED';audit('BOOKING_APPROVED','RoomBooking',b.id,`${roomLabel(b.roomId)} · ${b.date} ${b.start}–${b.end}`);save();toast('Booking disetujui.');return true;
}
function csvCell(v){let s=String(v??'');if(/^[\s]*[=+@-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"'}
function downloadCsv(filename,rows){const csv='\ufeff'+rows.map(r=>r.map(csvCell).join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
document.addEventListener('click',async e=>{
  if(!session)return;
  const v=e.target.closest('[data-view]');if(v){const target=v.dataset.view;if(roleMenus[role].includes(target)){view=target;if(remoteEnabled)await refreshRemote();else render();window.scrollTo({top:0,behavior:'smooth'})}return}
  const b=e.target.closest('[data-action]');if(!b)return;
  const action=b.dataset.action,key=b.dataset.id;
  if(action==='clearCatalog'){filters.catalog='';filters.category='';filters.availability='';filters.catalogLimit=24;render();return}
  if(action==='moreBooks'){filters.catalogLimit+=24;render();return}
  if(action==='clearLoan'){filters.loanStatus='';filters.loanMember='';render();return}
  if(action==='clearMember'){filters.memberSearch='';render();return}
  if(action==='pickSlot'){selectedSlot=key;const el=document.querySelector('#bookingForm select[name="start"]');if(el)el.value=key;const end=document.querySelector('#bookingForm select[name="end"]');if(end)end.value=`${String(Number(key.slice(0,2))+1).padStart(2,'0')}:00`;document.querySelectorAll('.slot.selected').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');return}
  if(action==='requestBook'&&role==='MEMBER'){requestBook(key);return}
  if(action==='confirmLoan'){modal('Siapkan buku',`Tentukan tanggal buku ${key} dapat diambil di perpustakaan.`,field('TANGGAL PENGAMBILAN',`<input type="date" name="pickupDate" min="${localDate()}" value="${offsetDate(1)}" required>`),'Konfirmasi tanggal ambil',d=>confirmLoan(key,d.pickupDate));return}
  if(action==='handoverLoan'){modal('Verifikasi KTM saat pengambilan',`Pindai KTM atau ketik NIM anggota untuk ${key}.`,field('SCAN KTM / NIM',`<input name="nim" inputmode="numeric" pattern="[0-9]{10}" autocomplete="off" required autofocus placeholder="NIM pada KTM">`),'Aktifkan pinjaman',d=>handoverLoan(key,d.nim));return}
  if(action==='returnLoan'){modal('Periksa pengembalian',`Pindai KTM atau masukkan NIM untuk ${key}, lalu tentukan hasil pemeriksaan.`,`${field('SCAN KTM / NIM',`<input name="nim" inputmode="numeric" pattern="[0-9]{10}" autocomplete="off" required autofocus>`)}${field('HASIL PEMERIKSAAN',select('resolution',[['RETURNED','Buku dikembalikan'],['LOST','Buku hilang']]))}${field('KONDISI EKSEMPLAR',select('condition',[['BAIK','Baik'],['CATATAN','Ada catatan kondisi']]))}`,'Simpan hasil pemeriksaan',d=>returnLoan(key,d.nim,d.condition,d.resolution));return}
  if(action==='reportLost'){reportLost(key);return}
  if(action==='approveBooking'){approveBooking(key);return}
  if(action==='rejectBooking'&&role==='LIBRARIAN'){
    const booking=state.bookings.find(x=>x.id===key);if(!booking||booking.status!=='SUBMITTED')return fail('Booking tidak dapat ditolak.');
    modal('Tolak pemesanan',`Pemesanan ${key} akan ditolak.`,field('ALASAN',`<textarea name="reason" required maxlength="300" placeholder="Alasan penolakan"></textarea>`),'Tolak booking',d=>{if(remoteEnabled)return runRemote(()=>rpc('decide_room',{p_booking:key,p_approve:false,p_reason:d.reason.trim()}));booking.status='REJECTED';booking.reason=d.reason.trim();audit('BOOKING_REJECTED','RoomBooking',key,booking.reason);save();toast('Booking ditolak.');return true});return;
  }
  if(action==='cancelBooking'&&role==='MEMBER'){
    const booking=state.bookings.find(x=>x.id===key);if(!booking||booking.memberId!==currentMember||!['SUBMITTED','APPROVED'].includes(booking.status))return fail('Booking tidak dapat dibatalkan.');
    modal('Batalkan pemesanan',`Slot ${roomLabel(booking.roomId)} pada ${fmt(booking.date)} akan dilepas.`,'<p class="hint">Pembatalan dicatat dalam jejak transaksi.</p>','Ya, batalkan',()=>{if(remoteEnabled)return runRemote(()=>rpc('cancel_room',{p_booking:key}));booking.status='CANCELLED';audit('BOOKING_CANCELLED','RoomBooking',key,'Dibatalkan oleh anggota.');save();toast('Booking dibatalkan.');return true});return;
  }
  if(action==='assess'&&role==='LIBRARIAN'){
    const c=state.cases.find(x=>x.id===key);if(!c||c.status!=='REPORTED')return fail('Kasus tidak dapat dinilai.');
    modal('Tetapkan nilai ganti rugi',`Kasus ${key}. Nilai ditetapkan oleh petugas berwenang.`,`${field('NILAI (RUPIAH)',`<input type="number" name="amount" min="1" step="1" required placeholder="Masukkan nilai">`)}${field('DASAR PENILAIAN',`<textarea name="reason" required maxlength="300" placeholder="Alasan atau acuan penilaian"></textarea>`)}`,'Simpan penilaian',d=>{const n=Number(d.amount);if(!Number.isSafeInteger(n)||n<=0)return fail('Nilai harus berupa angka positif.');if(remoteEnabled)return runRemote(()=>rpc('assess_loss',{p_case:key,p_amount:n,p_reason:d.reason.trim()}));c.amount=n;c.assessment=d.reason.trim();c.status='AWAITING_PAYMENT';audit('LOSS_ASSESSED','LostBookCase',key,`${money(n)} · ${c.assessment.slice(0,70)}`);save();toast('Nilai ganti rugi dicatat.');return true});return;
  }
  if(action==='payCase'&&role==='MEMBER'){
    const c=state.cases.find(x=>x.id===key);
    if(!c||c.memberId!==currentMember||c.status!=='AWAITING_PAYMENT')return fail('Tagihan tidak tersedia.');
    if(remoteEnabled){
      try{
        const order=await api('functions/v1/create-payment',{method:'POST',body:{caseId:key}});
        c.payment={orderId:order.orderId,qrUrl:order.qrUrl,amount:order.amount,status:'PENDING'};
        modal('QR pembayaran',`${key} · nominal tetap ${money(order.amount)}. Satu order untuk satu kasus.`,`<div class="qr-box"><img src="${esc(order.qrUrl)}" alt="QRIS pembayaran ${esc(key)}"><p>Order ${esc(order.orderId)} · ${money(order.amount)}</p><p>Status diperbarui otomatis setelah penyedia mengonfirmasi pembayaran.</p></div>`,'Tutup',()=>true);
        if(paymentPoll)clearInterval(paymentPoll);
        paymentPoll=setInterval(async()=>{try{const status=await api(`functions/v1/payment-status?caseId=${encodeURIComponent(key)}`);if(status.status==='CLOSED'){clearInterval(paymentPoll);paymentPoll=null;document.querySelector('.modal-backdrop')?.remove();await refreshRemote();toast('Pembayaran diterima. Kwitansi telah terbit.')}}catch{}},5000);
      }catch(err){fail(err.message||'QR belum dapat diterbitkan.')}
      return;
    }
    if(c.payment?.qrUrl){
      modal('QR pembayaran',`${key} · nominal tetap ${money(c.amount)}. Satu order untuk satu kasus.`,`<div class="qr-box"><img src="${esc(c.payment.qrUrl)}" alt="QR pembayaran ${esc(key)}"><p>Order ${esc(c.payment.orderId)} · ${money(c.amount)}</p></div>`,'Tutup',()=>true);
    }else{
      modal('Pembayaran QR',`${key} · ${money(c.amount)}. QR diterbitkan oleh penyedia pembayaran setelah layanan Supabase dan akun merchant terhubung.`,`<p class="hint">Hubungi pengelola sistem untuk mengaktifkan pembayaran. Tagihan tetap tercatat dan tidak berubah.</p>`,'Tutup',()=>true);
    }
    return;
  }
  if(action==='verifyMember'&&role==='LIBRARIAN'){
    const m=findMember(key);if(!m||m.status!=='PENDING_VERIFICATION')return fail('Anggota tidak menunggu verifikasi.');
    modal('Verifikasi anggota',`${m.name} · ${m.memberNo}. Periksa data identitas sesuai proses institusi sebelum verifikasi nyata.`,'<p class="hint">Status anggota akan berubah menjadi aktif.</p>','Aktifkan anggota',()=>{if(remoteEnabled)return runRemote(()=>rpc('verify_member',{p_member:m.id}));m.status='ACTIVE';audit('MEMBER_VERIFIED','Member',m.id,`${m.memberNo} diaktifkan.`);save();toast('Anggota diaktifkan.');return true});return;
  }
  if(action==='exportLoans'&&['MEMBER','LIBRARIAN'].includes(role)){
    const data=state.loans.filter(own).filter(l=>(!filters.loanStatus||loanStatus(l)===filters.loanStatus)&&(!filters.loanMember||l.memberId===filters.loanMember));
    downloadCsv('simper-monitoring-pinjaman.csv',[['ID','Nomor anggota','Nama anggota','Buku','Barcode','Tanggal pinjam','Jatuh tempo','Status'],...data.map(l=>[l.id,findMember(l.memberId)?.memberNo,findMember(l.memberId)?.name,findBook(l.bookId)?.title,l.barcode,l.loanDate,l.dueDate,loanStatus(l)])]);audit('REPORT_EXPORTED','Loan','CSV',`${data.length} baris, peran ${roleNames[role]}`);save();toast('CSV monitoring diunduh.');return;
  }
  if(action==='exportAudit'&&role==='ADMIN'){downloadCsv('simper-audit-log.csv',[['Waktu','Actor','Event','Entitas','ID','Detail'],...state.audit.map(a=>[a.at,a.actor,a.action,a.entity,a.entityId,a.detail])]);audit('AUDIT_EXPORTED','AuditLog','CSV','Log audit diunduh.');save();toast('CSV audit diunduh.');return}
});
document.addEventListener('submit',e=>{
  if(!session)return;
  if(!e.target.closest('#app'))return;
  e.preventDefault();const form=e.target,d=Object.fromEntries(new FormData(form));
  if(form.id==='catalogFilter'){filters.catalog=d.catalog||'';filters.category=d.category||'';filters.availability=d.availability||'';filters.catalogLimit=24;render();return}
  if(form.id==='loanFilter'){filters.loanStatus=d.loanStatus||'';filters.loanMember=role==='LIBRARIAN'?d.loanMember||'':'';render();return}
  if(form.id==='roomFilter'){filters.bookingDate=d.bookingDate;filters.bookingRoom=d.bookingRoom;selectedSlot='';render();return}
  if(form.id==='bookingStatusFilter'){filters.bookingStatus=d.bookingStatus||'';render();return}
  if(form.id==='memberFilter'){filters.memberSearch=d.memberSearch||'';render();return}
  if(form.id==='auditFilter'){filters.auditSearch=d.auditSearch||'';render();return}
  if(form.id==='loanForm'&&role==='LIBRARIAN'){requestBook(d.bookId,d.memberId);return}
  if(form.id==='bookingForm'){bookRoom(d);return}
  if(form.id==='memberForm'&&role==='LIBRARIAN'){
    const nim=String(d.nim||'').trim(),email=d.email.trim().toLowerCase(),name=d.name.trim(),klass=d.klass.trim();
    if(!/^\d{10}$/.test(nim)||!name||!klass||!email)return fail('Lengkapi NIM 10 digit dan data anggota.');
    if(!classDirectory[d.program]?.includes(klass))return fail('Kelas tidak sesuai dengan program studi.');
    if(state.accounts.some(a=>a.nim===nim)||state.members.some(m=>m.email.toLowerCase()===email))return fail('NIM atau email sudah terdaftar.');
    if(remoteEnabled){
      api('functions/v1/register-member',{method:'POST',body:{nim,name,email,program:d.program,klass}}).then(async result=>{
        await refreshRemote();
        modal('Akun anggota tercatat',`NIM ${nim} menunggu verifikasi pustakawan.`,`<p class="hint">Kata sandi sementara untuk diberikan kepada anggota:</p><div class="info-strip"><strong>${esc(result.temporaryPassword)}</strong></div><p class="tiny-note">Anggota perlu mengganti kata sandi setelah masuk.</p>`,'Tutup',()=>true);
      }).catch(err=>fail(err.message||'Pendaftaran gagal.'));
      return;
    }
    const memberNo=`SIM-${new Date().getFullYear()}-${String(state.members.length+1).padStart(3,'0')}`;
    const m={id:`M${String(state.members.length+1).padStart(3,'0')}`,nim,memberNo,name,email,klass,program:d.program,status:'PENDING_VERIFICATION'};
    state.members.push(m);state.accounts.push({nim,memberId:m.id,name,role:'MEMBER'});
    audit('MEMBER_REGISTERED','Member',m.id,`${m.memberNo} · NIM ${m.nim}`);save();toast('Anggota tercatat. Verifikasi sebelum meminjam.');return;
  }
  if(form.id==='configForm'&&role==='ADMIN'){
    const maxLoans=Number(d.maxLoans),loanDays=Number(d.loanDays),roomMaxMinutes=Number(d.roomMaxMinutes);
    if(!Number.isInteger(maxLoans)||maxLoans<1||maxLoans>20||!Number.isInteger(loanDays)||loanDays<1||loanDays>90||!Number.isInteger(roomMaxMinutes)||roomMaxMinutes<60||roomMaxMinutes>480||roomMaxMinutes%60)return fail('Nilai parameter di luar rentang yang diizinkan.');
    if(remoteEnabled){runRemote(()=>rpc('update_parameter',{p_max_loans:maxLoans,p_loan_days:loanDays,p_room_minutes:roomMaxMinutes}));return}
    const before=`${state.config.maxLoans}/${state.config.loanDays}/${state.config.roomMaxMinutes}`;state.config={maxLoans,loanDays,roomMaxMinutes,version:state.config.version+1};audit('PARAMETER_CHANGED','SystemParameter',`v${state.config.version}`,`${before} → ${maxLoans}/${loanDays}/${roomMaxMinutes}`);save();toast('Versi parameter baru disimpan.');return;
  }
});
$('#loginForm').addEventListener('submit',async e=>{
  e.preventDefault();const d=Object.fromEntries(new FormData(e.target));
  if(await login(d.nim,d.password)){e.target.reset();$('#loginError').textContent=''}
  else $('#loginError').textContent='NIM atau kata sandi tidak sesuai.';
});
$('#logoutButton').addEventListener('click',logout);
document.addEventListener('change',e=>{
  if(e.target.id==='memberProgram'){
    const classes=classDirectory[e.target.value]||[];
    $('#memberClass').innerHTML=classes.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('');
  }
});
render();
if(remoteEnabled&&session&&remoteToken)refreshRemote().catch(logout);
