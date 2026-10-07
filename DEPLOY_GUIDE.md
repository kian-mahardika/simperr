# Deploy SIMPER: GitHub Desktop → Supabase → Vercel

Dokumen ini dibuat untuk alur setup paling pendek. Jangan commit secret key, password, atau file `.env`.

## Yang sudah disiapkan

- `supabase/SETUP_ALL.sql` = schema + RLS + RPC + seed dalam **satu file**.
- Vercel build otomatis membaca `SUPABASE_URL` dan `SUPABASE_PUBLISHABLE_KEY` lalu membuat `dist/config.js`.
- `SUPABASE_SECRET_KEY` tidak pernah dibutuhkan oleh frontend/Vercel.
- `supabase/scripts/provision-users.mjs` membuat 12 akun anggota + 3 akun staf dan aman dijalankan ulang.
- `supabase/functions/*` berisi 4 Edge Functions.

## Nilai yang perlu kamu salin dari Supabase

Dari project Supabase, buka **Connect** atau **Settings → API Keys**:

1. **Project URL** → bentuknya `https://PROJECT_REF.supabase.co`
2. **Publishable key** → diawali `sb_publishable_...`
3. **Secret key** → diawali `sb_secret_...` (setup lokal/provisioning saja; JANGAN ke Vercel/GitHub)
4. **Project Ref / Project ID** → bagian `PROJECT_REF` dari URL di atas

## Vercel Environment Variables

Buat tepat dua variable berikut untuk Production + Preview + Development:

- `SUPABASE_URL` = Project URL Supabase
- `SUPABASE_PUBLISHABLE_KEY` = Publishable key Supabase

Jangan masukkan `SUPABASE_SECRET_KEY`, service-role key, atau Midtrans server key ke frontend Vercel.

## Login demo setelah provisioning

- Anggota: `4199990001` s.d. `4199990012`
- Pustakawan: `4199990901`
- Keuangan: `4199990902`
- Admin: `4199990903`
- Password: nilai `SIMPER_SEED_PASSWORD` yang kamu pilih sendiri saat provisioning (minimal 12 karakter)

## Edge Function secrets opsional

Di Supabase → Edge Functions → Secrets:

- `SITE_ORIGIN` = URL production Vercel, contoh `https://nama-project.vercel.app`
- `MIDTRANS_SERVER_KEY` = hanya jika QRIS Midtrans benar-benar mau diuji
- `MIDTRANS_ENV` = `sandbox` saat uji; `production` hanya saat merchant production siap

Supabase menyediakan URL dan key internalnya sendiri untuk Edge Functions; tidak perlu kamu input ulang.
