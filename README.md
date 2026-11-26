# Portal Penerimaan Mahasiswa Baru

Portal ini berjalan dengan Next.js, Supabase Auth/Postgres, dan Cloudflare R2.

## Menjalankan secara lokal

1. Pastikan `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, serta kredensial bucket R2 tersedia pada `.env.local`/`.env` (atau salin `.env.example` lalu isi nilainya). Jangan pernah memakai atau mengekspos Supabase service-role key di browser.
3. Jalankan `supabase/schema.sql` melalui Supabase SQL Editor.
4. Jalankan `npm install`, lalu `npm run dev`.

Halaman portal dan informasi hanya dapat diakses setelah login. Pengunjung tanpa sesi diarahkan ke `/login`, dengan pilihan masuk atau membuat akun dari formulir yang sama. Akun baru otomatis menjadi pendaftar; Supabase Auth dapat meminta konfirmasi email sebelum akun bisa masuk. Untuk menetapkan akun panitia, minta operator tepercaya mengubah profil akun tersebut lewat SQL Editor:

```sql
update public.profiles
set role = 'admin'
where user_id = (select id from auth.users where email = 'admin@domain-anda.id');
```

Jangan menyediakan pendaftaran mandiri untuk peran admin. Profil harus sudah ada sebelum peran diubah; akun baru tidak dapat mengangkat dirinya sendiri.

## Cloudflare R2

Buat bucket R2 privat, lalu atur `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, dan `R2_BUCKET_NAME`. Endpoint upload hanya menerima pengguna yang sudah login, memeriksa pemilik nomor pendaftaran, dan membatasi dokumen ke PDF/JPG/PNG/WEBP berukuran maksimal 5 MB. Panitia membuka berkas melalui URL sementara yang kedaluwarsa setelah 60 detik; jangan menjadikan bucket dokumen pendaftar publik.

## Jika pendaftaran gagal di Supabase

- Formulir pendaftaran dan reset meminta kata sandi minimal 8 karakter. Huruf besar, angka, dan simbol tidak diwajibkan. Supabase tetap dapat menerapkan batas minimum yang lebih tinggi melalui konfigurasi Auth proyek.
- Jika konfirmasi email aktif, pendaftar perlu membuka tautan konfirmasi sebelum masuk. Profil dibuat setelah login pertama yang berhasil.
- Untuk tautan lupa kata sandi, tambahkan alamat lokal `http://localhost:3000/login` dan alamat situs production `https://domain-anda/login` ke **Supabase Dashboard → Authentication → URL Configuration → Redirect URLs**.
- `Database error saving new user` berasal dari Supabase Auth sebelum aplikasi membuat profil. Periksa **Supabase Dashboard → Logs → Auth/Postgres** pada waktu percobaan; periksa juga trigger/function kustom pada `auth.users`. Pastikan trigger tidak mengharuskan kolom yang tidak tersedia atau menulis ke tabel profil dengan policy yang menolak insert.
- Jalankan `supabase/schema.sql` di SQL Editor. Migrasi ini menambahkan `portal_content` dan kolom `documents`/`review_note` yang dibutuhkan portal.

## Deploy ke Vercel

Hubungkan repositori GitHub ke Vercel, tambahkan variabel Supabase dan R2 pada pengaturan proyek Vercel, lalu deploy. Jalankan skema SQL satu kali di proyek Supabase yang sama. Build dijalankan dengan `npm run build`.

Skema membuat lima data pendaftar contoh yang hanya dapat dibaca/diubah admin, termasuk variasi draft, diajukan, perlu perbaikan, status verifikasi, hasil seleksi, dan nama contoh berkas. Berkas contoh tersebut bukan file R2 sungguhan. Untuk uji multi-akun di deployment, daftarkan akun pendaftar melalui halaman dan lengkapi profil serta berkasnya.
