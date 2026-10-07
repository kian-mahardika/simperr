"""Create matching SQL seed from the catalog JSON and initial frontend scenario."""
import json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
books=json.loads((root/'catalog-data.js').read_text().split('=',1)[1].strip().removesuffix(';'))
def q(v):return "'"+str(v).replace("'","''")+"'"
lines=['-- Data rancangan. Bukan hasil ekspor inventaris resmi PKN STAN.','begin;',"insert into public.system_parameter(id,max_loans,loan_days,late_fee_per_day,room_max_minutes,version) values(true,5,14,1000,120,1) on conflict(id) do nothing;"]
lines.append("insert into public.room(id,name,capacity) select n,'Ruang Diskusi '||n,20 from generate_series(1,10) n on conflict do nothing;")
people=[('Nadia Prameswari','Akuntansi Sektor Publik STR','6 PPPN-2'),('Raka Mahendra','Manajemen Keuangan Negara STR','4 Penerimaan-2'),('Dina Larasati','Manajemen Aset Publik STR','4-1'),('Fajar Rahadian','D3 Pajak','4-1'),('Tiara Wening','Akuntansi Sektor Publik STR AP','8 Audit-1'),('Bagas Firmansyah','D3 Akuntansi','6-2'),('Salma Kirana','D3 PBB/Penilai','6-1'),('Rizky Aditya','D3 Kebendaharaan Negara','4-1'),('Alya Puspita','D3 Kepabeanan dan Cukai','4-1'),('Yuda Pratama','D3 Manajemen Aset','6-1'),('Maya Anindita','Manajemen Aset Publik STR','6 PBP-1'),('Ilham Nugraha','Manajemen Keuangan Negara STR','4 Penerimaan-3')]
for i,(name,program,klass) in enumerate(people,1):
 vals=[f'M{i:03d}',f'419999{i:04d}',f'SIM-2026-{i:03d}',name,f'anggota{i}@example.test',program,klass]
 lines.append('insert into public.member(id,nim,member_no,name,email,program,class_label) values('+','.join(map(q,vals))+') on conflict(id) do nothing;')
for b in books:
 vals=[b[x] for x in ('id','title','author','category','isbn','year','publisher','shelf','replacementValue','cover','source')]
 lines.append('insert into public.book(id,title,author,category,catalog_code,publication_year,publisher,shelf,replacement_value,cover_path,source) values('+','.join(str(x) if isinstance(x,int) else q(x) for x in vals)+') on conflict(id) do nothing;')
 for c in b['copies']:lines.append('insert into public.book_copy(barcode,book_id) values('+q(c['barcode'])+','+q(b['id'])+') on conflict(barcode) do nothing;')
# Starting states; dates relative to installation date.
lines.extend([
 "update public.book_copy set status='ON_LOAN' where barcode='B0019-01';",
 "update public.book_copy set status='RESERVED' where barcode='B0020-01';",
 "update public.book_copy set status='LOST' where barcode='B0021-01';",
 "insert into public.loan(id,member_id,book_id,copy_barcode,request_date,loan_date,due_date,status,loan_days_snapshot,parameter_version) values('LN-SEED-001','M001','B0019','B0019-01',public.service_date()-5,public.service_date()-4,public.service_date()+10,'ACTIVE',14,1) on conflict do nothing;",
 "insert into public.loan(id,member_id,book_id,copy_barcode,request_date,pickup_date,status,loan_days_snapshot,parameter_version) values('LN-SEED-002','M002','B0020','B0020-01',public.service_date()-1,public.service_date()+1,'READY_PICKUP',14,1) on conflict do nothing;",
 "insert into public.loan(id,member_id,book_id,request_date,status) values('LN-SEED-003','M003','B0022',public.service_date(),'PENDING_CONFIRMATION') on conflict do nothing;",
 "insert into public.loan(id,member_id,book_id,copy_barcode,request_date,loan_date,due_date,return_date,status,loan_days_snapshot,parameter_version) values('LN-SEED-004','M001','B0021','B0021-01',public.service_date()-20,public.service_date()-19,public.service_date()-5,public.service_date()-1,'LOST',14,1) on conflict do nothing;",
 "insert into public.obligation_case(id,loan_id,member_id,kind,amount,note) values('KS-SEED-001','LN-SEED-004','M001','LOST',105000,'Nilai penggantian sesuai katalog') on conflict do nothing;",
 "insert into public.room_booking(id,room_id,member_id,start_at,end_at,status,purpose,participants) values('RB-SEED-001',1,'M001',((public.service_date()+1)::timestamp+interval '9 hours') at time zone 'Asia/Jakarta',((public.service_date()+1)::timestamp+interval '11 hours') at time zone 'Asia/Jakarta','APPROVED','Diskusi kelompok',4) on conflict do nothing;",
])
for i in range(5,17):
 member=f'M{i%12+1:03d}'
 book=f'B{i+19:04d}'
 barcode=f'{book}-01'
 lines.append(f"update public.book_copy set status='ON_LOAN' where barcode='{barcode}';")
 lines.append(f"insert into public.loan(id,member_id,book_id,copy_barcode,request_date,loan_date,due_date,status,loan_days_snapshot,parameter_version) values('LN-SEED-{i:03d}','{member}','{book}','{barcode}',public.service_date()-{i+4},public.service_date()-{i+3},public.service_date()+{11-i},'ACTIVE',14,1) on conflict do nothing;")
for i in range(17,21):
 member=f'M{i%12+1:03d}'
 book=f'B{i+19:04d}'
 barcode=f'{book}-01'
 lines.append(f"insert into public.loan(id,member_id,book_id,copy_barcode,request_date,loan_date,due_date,return_date,status,loan_days_snapshot,parameter_version) values('LN-SEED-{i:03d}','{member}','{book}','{barcode}',public.service_date()-30,public.service_date()-29,public.service_date()-15,public.service_date()-17,'RETURNED',14,1) on conflict do nothing;")
lines.extend([
 "insert into public.loan(id,member_id,book_id,copy_barcode,request_date,loan_date,due_date,return_date,status,loan_days_snapshot,parameter_version) values('LN-SEED-021','M003','B0041','B0041-01',public.service_date()-23,public.service_date()-22,public.service_date()-8,public.service_date()-5,'LATE_RETURNED',14,1) on conflict do nothing;",
 "insert into public.obligation_case(id,loan_id,member_id,kind,amount,days_late,note,status) values('KS-SEED-002','LN-SEED-021','M003','LATE',3000,3,'3 hari × Rp1.000','CLOSED') on conflict do nothing;",
 "insert into public.payment(case_id,order_id,amount,status,receipt_id,paid_at) values('KS-SEED-002','SIMPER-SEED-PAID-001',3000,'SETTLED','KW-2026-00000001',now()-interval '4 days') on conflict(order_id) do nothing;",
 "select setval('public.receipt_seq',greatest(1,(select last_value from public.receipt_seq))); ",
])
for i in range(2,11):
 room=(i-1)%10+1
 member=f'M{i%12+1:03d}'
 lines.append(f"insert into public.room_booking(id,room_id,member_id,start_at,end_at,status,purpose,participants) values('RB-SEED-{i:03d}',{room},'{member}',((public.service_date()+{1+i%3})::timestamp+interval '9 hours') at time zone 'Asia/Jakarta',((public.service_date()+{1+i%3})::timestamp+interval '11 hours') at time zone 'Asia/Jakarta','APPROVED','Diskusi kelompok',4) on conflict do nothing;")
lines.append('commit;')
(root/'supabase'/'seed.sql').write_text('\n'.join(lines)+'\n')
print(len(books),'books,',sum(len(x['copies']) for x in books),'copies')
