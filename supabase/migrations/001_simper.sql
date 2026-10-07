-- SIMPER / Supabase PostgreSQL. Jalankan dalam proyek baru.
create extension if not exists pgcrypto;
create extension if not exists btree_gist;
create or replace function public.service_date() returns date language sql stable as $$ select (now() at time zone 'Asia/Jakarta')::date $$;
create table public.app_role(auth_uid uuid primary key references auth.users(id) on delete cascade, role text not null check(role in ('MEMBER','LIBRARIAN','FINANCE','ADMIN')));
create table public.member(id text primary key, auth_uid uuid unique references auth.users(id), nim text not null unique, member_no text not null unique, name text not null, email text, program text, class_label text, status text not null default 'ACTIVE' check(status in ('ACTIVE','PENDING_VERIFICATION','SUSPENDED')));
create table public.book(id text primary key, title text not null, author text, category text, catalog_code text unique, publication_year int, publisher text, shelf text not null, replacement_value integer not null check(replacement_value>0), cover_path text, source text not null);
create table public.book_copy(barcode text primary key, book_id text not null references public.book(id), status text not null default 'AVAILABLE' check(status in ('AVAILABLE','RESERVED','ON_LOAN','LOST','DAMAGED')));
create index on public.book_copy(book_id,status);
create table public.system_parameter(id boolean primary key default true check(id), max_loans int not null default 5, loan_days int not null default 14 check(loan_days between 1 and 90), late_fee_per_day int not null default 1000 check(late_fee_per_day>=0), room_max_minutes int not null default 120, version int not null default 1);
create table public.loan(id text primary key, member_id text not null references public.member(id), book_id text not null references public.book(id), copy_barcode text references public.book_copy(barcode), request_date date not null default public.service_date(), pickup_date date, loan_date date, due_date date, return_date date, status text not null default 'PENDING_CONFIRMATION' check(status in ('PENDING_CONFIRMATION','READY_PICKUP','ACTIVE','RETURNED','LATE_RETURNED','LOST','CANCELLED')), loan_days_snapshot int, parameter_version int, handled_by uuid references auth.users(id), returned_by uuid references auth.users(id), check(due_date is null or loan_date is not null and due_date>loan_date));
create unique index one_open_loan_per_copy on public.loan(copy_barcode) where status in ('READY_PICKUP','ACTIVE');
create index on public.loan(member_id,status);
create table public.obligation_case(id text primary key, loan_id text not null unique references public.loan(id), member_id text not null references public.member(id), kind text not null check(kind in ('LATE','LOST')), amount integer not null check(amount>0), days_late int, note text, status text not null default 'AWAITING_PAYMENT' check(status in ('AWAITING_PAYMENT','CLOSED')), created_at timestamptz not null default now());
create table public.payment(id uuid primary key default gen_random_uuid(), case_id text not null references public.obligation_case(id), order_id text not null unique, amount integer not null check(amount>0), provider_transaction_id text unique, qr_url text, status text not null default 'INITIATING' check(status in ('INITIATING','PENDING','SETTLED','EXPIRED','DENIED')), receipt_id text unique, created_at timestamptz not null default now(), paid_at timestamptz);
create unique index one_open_payment_per_case on public.payment(case_id) where status in ('INITIATING','PENDING','SETTLED');
create table public.room(id int primary key check(id between 1 and 10), name text not null unique, capacity int not null default 20);
create table public.room_booking(id text primary key, room_id int not null references public.room(id), member_id text not null references public.member(id), start_at timestamptz not null, end_at timestamptz not null, status text not null check(status in ('SUBMITTED','APPROVED','REJECTED','CANCELLED')), purpose text not null, participants int not null check(participants>0), check(end_at>start_at), exclude using gist(room_id with =,tstzrange(start_at,end_at,'[)') with &&) where(status in ('SUBMITTED','APPROVED')));
create table public.audit_event(id bigint generated always as identity primary key, actor_uid uuid, action text not null, entity text not null, entity_id text not null, detail jsonb not null default '{}'::jsonb, created_at timestamptz not null default now());
create index on public.audit_event(created_at desc);
create sequence public.receipt_seq;

create or replace function public.is_staff(roles text[]) returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.app_role where auth_uid=auth.uid() and role=any(roles)) $$;
create or replace function public.my_member_id() returns text language sql stable security definer set search_path=public as $$ select id from public.member where auth_uid=auth.uid() $$;
revoke all on function public.is_staff(text[]) from public;
revoke all on function public.my_member_id() from public;
grant execute on function public.is_staff(text[]), public.my_member_id() to authenticated;

alter table public.app_role enable row level security;
alter table public.member enable row level security;
alter table public.book enable row level security;
alter table public.book_copy enable row level security;
alter table public.loan enable row level security;
alter table public.obligation_case enable row level security;
alter table public.payment enable row level security;
alter table public.room enable row level security;
alter table public.room_booking enable row level security;
alter table public.system_parameter enable row level security;
alter table public.audit_event enable row level security;
create policy role_self on public.app_role for select to authenticated using(auth_uid=auth.uid());
create policy member_read on public.member for select to authenticated using(auth_uid=auth.uid() or public.is_staff(array['LIBRARIAN','FINANCE','ADMIN']));
create policy book_read on public.book for select to authenticated using(true);
create policy copy_read on public.book_copy for select to authenticated using(true);
create policy loan_read on public.loan for select to authenticated using(member_id=public.my_member_id() or public.is_staff(array['LIBRARIAN','FINANCE','ADMIN']));
create policy case_read on public.obligation_case for select to authenticated using(member_id=public.my_member_id() or public.is_staff(array['LIBRARIAN','FINANCE','ADMIN']));
create policy payment_read on public.payment for select to authenticated using(exists(select 1 from public.obligation_case c where c.id=case_id and (c.member_id=public.my_member_id() or public.is_staff(array['FINANCE','ADMIN']))));
create policy room_read on public.room for select to authenticated using(true);
create policy booking_read on public.room_booking for select to authenticated using(member_id=public.my_member_id() or public.is_staff(array['LIBRARIAN','ADMIN']));
create policy parameter_read on public.system_parameter for select to authenticated using(true);
create policy audit_read on public.audit_event for select to authenticated using(public.is_staff(array['ADMIN']));
-- Explicit API grants: clients may read only through RLS. Writes happen only through RPC/Edge Functions.
revoke all on public.app_role,public.member,public.book,public.book_copy,public.loan,public.obligation_case,public.payment,public.room,public.room_booking,public.system_parameter,public.audit_event from anon;
revoke insert,update,delete,truncate,references,trigger on public.app_role,public.member,public.book,public.book_copy,public.loan,public.obligation_case,public.payment,public.room,public.room_booking,public.system_parameter,public.audit_event from authenticated;
grant select on public.app_role,public.member,public.book,public.book_copy,public.loan,public.obligation_case,public.payment,public.room,public.room_booking,public.system_parameter,public.audit_event to authenticated;
-- No direct client writes. All state transitions pass through locked RPCs or the payment Edge Functions.

create or replace function public.request_book(p_book text) returns text language plpgsql security definer set search_path=public,pg_temp as $$
declare m public.member; n int; new_id text;
begin
 select * into m from public.member where auth_uid=auth.uid() and status='ACTIVE' for update;
 if not found then raise exception 'Keanggotaan belum aktif'; end if;
 select count(*) into n from public.loan where member_id=m.id and status in ('PENDING_CONFIRMATION','READY_PICKUP','ACTIVE');
 if n >= (select max_loans from public.system_parameter where id=true) then raise exception 'Batas pinjaman tercapai'; end if;
 if exists(select 1 from public.loan where member_id=m.id and book_id=p_book and status in ('PENDING_CONFIRMATION','READY_PICKUP','ACTIVE')) then raise exception 'Judul sudah diajukan'; end if;
 if not exists(select 1 from public.book_copy where book_id=p_book and status='AVAILABLE') then raise exception 'Eksemplar tidak tersedia'; end if;
 new_id='LN-'||replace(gen_random_uuid()::text,'-','');
 insert into public.loan(id,member_id,book_id) values(new_id,m.id,p_book);
 insert into public.audit_event(actor_uid,action,entity,entity_id) values(auth.uid(),'LOAN_REQUESTED','loan',new_id);
 return new_id;
end $$;
create or replace function public.approve_loan(p_loan text,p_pickup date) returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare l public.loan; cp text; cfg public.system_parameter;
begin
 if not public.is_staff(array['LIBRARIAN']) then raise exception 'Akses ditolak'; end if;
 if p_pickup is null or p_pickup<public.service_date() then raise exception 'Tanggal ambil tidak valid'; end if;
 select * into l from public.loan where id=p_loan for update;
 if l.status is distinct from 'PENDING_CONFIRMATION' then raise exception 'Status pinjaman berubah'; end if;
 select barcode into cp from public.book_copy where book_id=l.book_id and status='AVAILABLE' order by barcode for update skip locked limit 1;
 if cp is null then raise exception 'Eksemplar tidak tersedia'; end if;
 select * into cfg from public.system_parameter where id=true;
 update public.book_copy set status='RESERVED' where barcode=cp;
 update public.loan set copy_barcode=cp,pickup_date=p_pickup,loan_days_snapshot=cfg.loan_days,parameter_version=cfg.version,status='READY_PICKUP' where id=p_loan;
 insert into public.audit_event(actor_uid,action,entity,entity_id,detail) values(auth.uid(),'LOAN_READY_PICKUP','loan',p_loan,jsonb_build_object('pickup_date',p_pickup,'barcode',cp));
end $$;
create or replace function public.handover_loan(p_loan text,p_scanned_nim text) returns date language plpgsql security definer set search_path=public,pg_temp as $$
declare l public.loan; expected_nim text; due date;
begin
 if not public.is_staff(array['LIBRARIAN']) then raise exception 'Akses ditolak'; end if;
 select * into l from public.loan where id=p_loan for update;
 if l.status is distinct from 'READY_PICKUP' or l.pickup_date is null or l.pickup_date>public.service_date() then raise exception 'Buku belum siap diambil'; end if;
 select nim into expected_nim from public.member where id=l.member_id;
 if p_scanned_nim is distinct from expected_nim then raise exception 'NIM KTM tidak sesuai'; end if;
 due=public.service_date()+l.loan_days_snapshot;
 update public.book_copy set status='ON_LOAN' where barcode=l.copy_barcode and status='RESERVED';
 if not found then raise exception 'Eksemplar tidak siap'; end if;
 update public.loan set loan_date=public.service_date(),due_date=due,status='ACTIVE',handled_by=auth.uid() where id=p_loan;
 insert into public.audit_event(actor_uid,action,entity,entity_id,detail) values(auth.uid(),'BOOK_HANDED_OVER','loan',p_loan,jsonb_build_object('due_date',due));
 return due;
end $$;
create or replace function public.complete_loan(p_loan text,p_scanned_nim text,p_result text) returns text language plpgsql security definer set search_path=public,pg_temp as $$
declare l public.loan; expected_nim text; days int; amt int; case_id text; fee int;
begin
 if not public.is_staff(array['LIBRARIAN']) then raise exception 'Akses ditolak'; end if;
 select * into l from public.loan where id=p_loan for update;
 if l.status is distinct from 'ACTIVE' or p_result is null or p_result not in ('RETURNED','LOST') then raise exception 'Status atau hasil tidak valid'; end if;
 select nim into expected_nim from public.member where id=l.member_id;
 if p_scanned_nim is distinct from expected_nim then raise exception 'NIM KTM tidak sesuai'; end if;
 if p_result='LOST' then
   select replacement_value into amt from public.book where id=l.book_id;
   update public.book_copy set status='LOST' where barcode=l.copy_barcode;
   if not found then raise exception 'Eksemplar tidak ditemukan'; end if;
   update public.loan set status='LOST',return_date=public.service_date(),returned_by=auth.uid() where id=p_loan;
 else
   days=greatest(0,public.service_date()-l.due_date);
   update public.book_copy set status='AVAILABLE' where barcode=l.copy_barcode;
   if not found then raise exception 'Eksemplar tidak ditemukan'; end if;
   update public.loan set status=case when days>0 then 'LATE_RETURNED' else 'RETURNED' end,return_date=public.service_date(),returned_by=auth.uid() where id=p_loan;
   if days>0 then select late_fee_per_day into fee from public.system_parameter where id=true; amt=days*fee; end if;
 end if;
 if amt>0 then
   case_id='KS-'||replace(gen_random_uuid()::text,'-','');
   insert into public.obligation_case(id,loan_id,member_id,kind,amount,days_late,note) values(case_id,p_loan,l.member_id,case when p_result='LOST' then 'LOST' else 'LATE' end,amt,days,case when p_result='LOST' then 'Ganti rugi sesuai nilai buku' else days||' hari × Rp'||fee end);
 end if;
 insert into public.audit_event(actor_uid,action,entity,entity_id,detail) values(auth.uid(),'RETURN_VERIFIED','loan',p_loan,jsonb_build_object('result',p_result,'case_id',case_id));
 return case_id;
end $$;
create or replace function public.settle_payment(p_order text,p_amount int,p_provider_id text) returns text language plpgsql security definer set search_path=public,pg_temp as $$
declare pay public.payment; c public.obligation_case; receipt text;
begin
 -- This RPC is callable only from the Edge Function service role after independent provider verification.
 if auth.role() <> 'service_role' then raise exception 'Akses ditolak'; end if;
 select * into pay from public.payment where order_id=p_order for update;
 if not found then raise exception 'Order tidak ditemukan'; end if;
 select * into c from public.obligation_case where id=pay.case_id for update;
 if p_amount is null or p_provider_id is null or pay.amount<>p_amount or c.amount<>p_amount then raise exception 'Nominal tidak cocok'; end if;
 if pay.status='SETTLED' then return pay.receipt_id; end if;
 if pay.status not in ('PENDING','INITIATING') or c.status<>'AWAITING_PAYMENT' then raise exception 'Status pembayaran tidak valid'; end if;
 receipt='KW-'||to_char(now(),'YYYY')||'-'||lpad(nextval('public.receipt_seq')::text,8,'0');
 update public.payment set status='SETTLED',receipt_id=receipt,paid_at=now(),provider_transaction_id=p_provider_id where id=pay.id;
 update public.obligation_case set status='CLOSED' where id=c.id;
 insert into public.audit_event(action,entity,entity_id,detail) values('PAYMENT_SETTLED','payment',pay.id::text,jsonb_build_object('case_id',c.id,'receipt_id',receipt,'amount',p_amount));
 return receipt;
end $$;
revoke all on function public.request_book(text),public.approve_loan(text,date),public.handover_loan(text,text),public.complete_loan(text,text,text),public.settle_payment(text,int,text) from public;
grant execute on function public.request_book(text),public.approve_loan(text,date),public.handover_loan(text,text),public.complete_loan(text,text,text) to authenticated;
grant execute on function public.settle_payment(text,int,text) to service_role;

create or replace function public.request_book_for(p_member text,p_book text) returns text language plpgsql security definer set search_path=public,pg_temp as $$
declare m public.member; n int; new_id text;
begin
 if not public.is_staff(array['LIBRARIAN']) then raise exception 'Akses ditolak'; end if;
 select * into m from public.member where id=p_member and status='ACTIVE' for update;
 if not found then raise exception 'Anggota tidak aktif'; end if;
 select count(*) into n from public.loan where member_id=p_member and status in ('PENDING_CONFIRMATION','READY_PICKUP','ACTIVE');
 if n >= (select max_loans from public.system_parameter where id=true) then raise exception 'Batas pinjaman tercapai'; end if;
 if exists(select 1 from public.loan where member_id=p_member and book_id=p_book and status in ('PENDING_CONFIRMATION','READY_PICKUP','ACTIVE')) then raise exception 'Judul sudah diajukan'; end if;
 if not exists(select 1 from public.book_copy where book_id=p_book and status='AVAILABLE') then raise exception 'Eksemplar tidak tersedia'; end if;
 new_id='LN-'||replace(gen_random_uuid()::text,'-','');
 insert into public.loan(id,member_id,book_id) values(new_id,p_member,p_book);
 insert into public.audit_event(actor_uid,action,entity,entity_id) values(auth.uid(),'LOAN_REQUESTED_BY_STAFF','loan',new_id);
 return new_id;
end $$;
create or replace function public.report_lost(p_loan text) returns text language plpgsql security definer set search_path=public,pg_temp as $$
declare l public.loan; amount int; case_id text;
begin
 select * into l from public.loan where id=p_loan for update;
 if l.status is distinct from 'ACTIVE' then raise exception 'Pinjaman tidak aktif'; end if;
 if l.member_id is distinct from public.my_member_id() and not public.is_staff(array['LIBRARIAN']) then raise exception 'Akses ditolak'; end if;
 select replacement_value into amount from public.book where id=l.book_id;
 update public.book_copy set status='LOST' where barcode=l.copy_barcode and status='ON_LOAN';
 if not found then raise exception 'Status eksemplar berubah'; end if;
 update public.loan set status='LOST' where id=p_loan;
 case_id='KS-'||replace(gen_random_uuid()::text,'-','');
 insert into public.obligation_case(id,loan_id,member_id,kind,amount,note) values(case_id,p_loan,l.member_id,'LOST',amount,'Kehilangan dilaporkan oleh anggota/petugas');
 insert into public.audit_event(actor_uid,action,entity,entity_id) values(auth.uid(),'LOSS_REPORTED','obligation_case',case_id);
 return case_id;
end $$;
create or replace function public.request_room(p_room int,p_start timestamptz,p_end timestamptz,p_purpose text,p_participants int) returns text language plpgsql security definer set search_path=public,pg_temp as $$
declare m public.member; max_minutes int; booking_id text;
begin
 select * into m from public.member where auth_uid=auth.uid() and status='ACTIVE';
 if not found then raise exception 'Anggota tidak aktif'; end if;
 select room_max_minutes into max_minutes from public.system_parameter where id=true;
 if p_start is null or p_end is null or p_start<=now() or p_end<=p_start or extract(epoch from p_end-p_start)/60>max_minutes or p_participants not between 1 and 20 or nullif(trim(p_purpose),'') is null or p_room not between 1 and 10 then raise exception 'Data pemesanan tidak valid'; end if;
 if (p_start at time zone 'Asia/Jakarta')::date<>(p_end at time zone 'Asia/Jakarta')::date or (p_start at time zone 'Asia/Jakarta')::time < time '08:00' or (p_end at time zone 'Asia/Jakarta')::time > time '17:00' then raise exception 'Waktu di luar jam layanan'; end if;
 booking_id='RB-'||replace(gen_random_uuid()::text,'-','');
 insert into public.room_booking(id,room_id,member_id,start_at,end_at,status,purpose,participants) values(booking_id,p_room,m.id,p_start,p_end,'SUBMITTED',trim(p_purpose),p_participants);
 insert into public.audit_event(actor_uid,action,entity,entity_id) values(auth.uid(),'BOOKING_SUBMITTED','room_booking',booking_id);
 return booking_id;
end $$;
create or replace function public.decide_room(p_booking text,p_approve boolean,p_reason text) returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare b public.room_booking;
begin
 if not public.is_staff(array['LIBRARIAN']) then raise exception 'Akses ditolak'; end if;
 select * into b from public.room_booking where id=p_booking for update;
 if b.status is distinct from 'SUBMITTED' or p_approve is null then raise exception 'Status pemesanan berubah'; end if;
 if not p_approve and nullif(trim(p_reason),'') is null then raise exception 'Alasan penolakan wajib'; end if;
 update public.room_booking set status=case when p_approve then 'APPROVED' else 'REJECTED' end where id=p_booking;
 insert into public.audit_event(actor_uid,action,entity,entity_id,detail) values(auth.uid(),'BOOKING_DECIDED','room_booking',p_booking,jsonb_build_object('approved',p_approve,'reason',p_reason));
end $$;
create or replace function public.cancel_room(p_booking text) returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare b public.room_booking;
begin
 select * into b from public.room_booking where id=p_booking for update;
 if b.member_id is distinct from public.my_member_id() or b.status not in ('SUBMITTED','APPROVED') then raise exception 'Pemesanan tidak dapat dibatalkan'; end if;
 update public.room_booking set status='CANCELLED' where id=p_booking;
 insert into public.audit_event(actor_uid,action,entity,entity_id) values(auth.uid(),'BOOKING_CANCELLED','room_booking',p_booking);
end $$;
create or replace function public.verify_member(p_member text) returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if not public.is_staff(array['LIBRARIAN']) then raise exception 'Akses ditolak'; end if;
 update public.member set status='ACTIVE' where id=p_member and status='PENDING_VERIFICATION';
 if not found then raise exception 'Status anggota berubah'; end if;
 insert into public.audit_event(actor_uid,action,entity,entity_id) values(auth.uid(),'MEMBER_VERIFIED','member',p_member);
end $$;
create or replace function public.update_parameter(p_max_loans int,p_loan_days int,p_room_minutes int) returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if not public.is_staff(array['ADMIN']) then raise exception 'Akses ditolak'; end if;
 if p_max_loans not between 1 and 20 or p_loan_days not between 1 and 90 or p_room_minutes not between 60 and 480 or p_room_minutes%60<>0 then raise exception 'Parameter tidak valid'; end if;
 update public.system_parameter set max_loans=p_max_loans,loan_days=p_loan_days,room_max_minutes=p_room_minutes,version=version+1 where id=true;
 insert into public.audit_event(actor_uid,action,entity,entity_id,detail) values(auth.uid(),'PARAMETER_CHANGED','system_parameter','current',jsonb_build_object('max_loans',p_max_loans,'loan_days',p_loan_days,'room_max_minutes',p_room_minutes));
end $$;
revoke all on function public.request_book_for(text,text),public.report_lost(text),public.request_room(int,timestamptz,timestamptz,text,int),public.decide_room(text,boolean,text),public.cancel_room(text),public.verify_member(text),public.update_parameter(int,int,int) from public;
grant execute on function public.request_book_for(text,text),public.report_lost(text),public.request_room(int,timestamptz,timestamptz,text,int),public.decide_room(text,boolean,text),public.cancel_room(text),public.verify_member(text),public.update_parameter(int,int,int) to authenticated;
