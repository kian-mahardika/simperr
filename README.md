# SIMPER · Sistem Informasi Perpustakaan PKN STAN

Aplikasi web statis untuk katalog, keanggotaan, sirkulasi, ruang diskusi, kasus kehilangan/denda, dan dasbor keuangan. Frontend dapat berjalan dalam mode lokal, tetapi deployment utama disiapkan untuk **Supabase + Vercel**.

> Untuk deployment paling sederhana, ikuti `DEPLOY_GUIDE.md`. File yang perlu dijalankan di Supabase SQL Editor adalah **`supabase/SETUP_ALL.sql`** saja.

## Menjalankan lokal

Gunakan Node.js 20+:

```bash
npm install
npm run dev
```

Buka `http://127.0.0.1:5173`.

Jika `config.js` kosong, aplikasi memakai data browser lokal. Saat build di Vercel, `scripts/build.mjs` otomatis membuat `dist/config.js` dari dua Environment Variables:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`

Jangan pernah memasukkan secret key / service-role key / Midtrans server key ke `config.js`, GitHub, atau Environment Variables frontend Vercel.

## Akun demo

Setelah database dibuat dan script provisioning dijalankan:

| Peran | NIM |
| --- | --- |
| Anggota | `4199990001` hingga `4199990012` |
| Pustakawan | `4199990901` |
| Keuangan | `4199990902` |
| Admin | `4199990903` |

Semua akun memakai password yang kamu pilih sendiri saat menjalankan provisioning (`SIMPER_SEED_PASSWORD`, minimal 12 karakter).

## Supabase

Struktur penting:

- `supabase/SETUP_ALL.sql` — **jalankan sekali** pada project Supabase baru; sudah menggabungkan schema/RLS/RPC + seed.
- `supabase/migrations/001_simper.sql` — sumber schema/RLS/RPC.
- `supabase/seed.sql` — sumber data awal.
- `supabase/functions/create-payment` — membuat order QRIS Midtrans.
- `supabase/functions/payment-webhook` — memverifikasi notifikasi pembayaran.
- `supabase/functions/payment-status` — membaca status pembayaran.
- `supabase/functions/register-member` — membuat akun anggota dari UI pustakawan.
- `supabase/scripts/provision-users.mjs` — membuat 12 akun anggota dan 3 akun staf.
- `supabase/scripts/provision-users.ps1` — helper Windows agar secret/password tidak perlu ditulis sebagai command biasa.

Supabase Edge Functions telah mendukung publishable/secret key baru dan masih memiliki fallback untuk legacy anon/service-role key.

## Vercel

`vercel.json` sudah menetapkan:

- build command: `npm run build`
- output directory: `dist`
- static headers dasar

Pada Vercel, cukup tambahkan:

```text
SUPABASE_URL=https://PROJECT_REF.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Build Vercel sengaja gagal dengan pesan yang jelas bila salah satu variable tersebut belum diisi, supaya website tidak diam-diam terdeploy dalam mode lokal.

## Pembayaran Midtrans (opsional)

Fitur database, login, katalog, sirkulasi, ruang, dan anggota tidak membutuhkan Midtrans. Untuk mengaktifkan QRIS, tambahkan secret di **Supabase Edge Functions**, bukan di Vercel frontend:

- `MIDTRANS_SERVER_KEY`
- `MIDTRANS_ENV=sandbox` saat pengujian
- `SITE_ORIGIN=https://nama-project.vercel.app`

Tanpa `MIDTRANS_SERVER_KEY`, tombol pembayaran akan memberi pesan bahwa QRIS belum dikonfigurasi; fitur lain tetap bisa digunakan.

## Quality check

```bash
npm test
npm run build
```

Audit paket terakhir lulus untuk data katalog, alur pinjaman/pengembalian, denda, kehilangan, ruang, dan jalur pemanggilan Supabase RPC.
