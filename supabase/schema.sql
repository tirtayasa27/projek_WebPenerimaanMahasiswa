create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  registration_number text not null unique,
  role text not null default 'applicant' check (role in ('applicant', 'admin')),
  full_name text not null,
  email text not null,
  phone text not null default '',
  birth_place text not null default '',
  birth_date date,
  gender text not null default '',
  address text not null default '',
  school text not null default '',
  study_choice text not null default '',
  second_choice text not null default '',
  path text not null default '',
  documents jsonb not null default '{}'::jsonb,
  verification text not null default 'Draft',
  result text not null default 'Belum diumumkan',
  review_note text not null default '',
  created_at timestamptz not null default now()
);

alter table public.profiles add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.profiles add column if not exists documents jsonb not null default '{}'::jsonb;
alter table public.profiles add column if not exists verification text not null default 'Draft';
alter table public.profiles add column if not exists result text not null default 'Belum diumumkan';
alter table public.profiles add column if not exists review_note text not null default '';

create unique index if not exists profiles_user_id_unique on public.profiles(user_id);

create or replace function public.is_pmb_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where user_id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_pmb_admin() from public;
grant execute on function public.is_pmb_admin() to authenticated;

alter table public.profiles enable row level security;
grant select, insert, update on public.profiles to authenticated;

drop policy if exists "profiles_select_owner_or_admin" on public.profiles;
create policy "profiles_select_owner_or_admin"
  on public.profiles for select to authenticated
  using (user_id = auth.uid() or public.is_pmb_admin());

drop policy if exists "profiles_insert_applicant" on public.profiles;
create policy "profiles_insert_applicant"
  on public.profiles for insert to authenticated
  with check (user_id = auth.uid() and role = 'applicant');

drop policy if exists "profiles_update_owner_or_admin" on public.profiles;
create policy "profiles_update_owner_or_admin"
  on public.profiles for update to authenticated
  using (user_id = auth.uid() or public.is_pmb_admin())
  with check ((user_id = auth.uid() and role = 'applicant') or public.is_pmb_admin());

create table if not exists public.demo_applicants (
  registration_number text primary key,
  full_name text not null,
  study_choice text not null,
  path text not null,
  verification text not null,
  result text not null default 'Belum diumumkan',
  review_note text not null default '',
  documents jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.demo_applicants enable row level security;
grant select, update on public.demo_applicants to authenticated;

drop policy if exists "demo_applicants_admin_read" on public.demo_applicants;
create policy "demo_applicants_admin_read"
  on public.demo_applicants for select to authenticated
  using (public.is_pmb_admin());

drop policy if exists "demo_applicants_admin_update" on public.demo_applicants;
create policy "demo_applicants_admin_update"
  on public.demo_applicants for update to authenticated
  using (public.is_pmb_admin())
  with check (public.is_pmb_admin());

insert into public.demo_applicants
  (registration_number, full_name, study_choice, path, verification, result, review_note, documents)
values
  ('PMB26-0001', 'Rizky Aditya', 'Manajemen', 'Prestasi', 'Terverifikasi', 'Lulus', '', '{"ijazah":"contoh-ijazah-rizky.pdf","identitas":"contoh-identitas-rizky.pdf","pasfoto":"contoh-pasfoto-rizky.jpg","rapor":"contoh-rapor-rizky.pdf"}'::jsonb),
  ('PMB26-0002', 'Alya Rahma Putri', 'Informatika', 'Reguler', 'Diajukan', 'Belum diumumkan', '', '{"ijazah":"contoh-ijazah-alya.pdf","identitas":"contoh-identitas-alya.pdf","pasfoto":"contoh-pasfoto-alya.jpg","rapor":"contoh-rapor-alya.pdf"}'::jsonb),
  ('PMB26-0003', 'Nadia Putri', 'Psikologi', 'Beasiswa', 'Perlu perbaikan', 'Belum diumumkan', 'Unggah ulang ijazah yang lebih jelas.', '{"ijazah":"contoh-ijazah-nadia.pdf"}'::jsonb),
  ('PMB26-0004', 'Fajar Ramadhan', 'Akuntansi', 'Reguler', 'Terverifikasi', 'Tidak lulus', '', '{"ijazah":"contoh-ijazah-fajar.pdf","identitas":"contoh-identitas-fajar.pdf","pasfoto":"contoh-pasfoto-fajar.jpg","rapor":"contoh-rapor-fajar.pdf"}'::jsonb),
  ('PMB26-0005', 'Dina Safitri', 'Ilmu Komunikasi', 'Reguler', 'Draft', 'Belum diumumkan', '', '{}'::jsonb)
on conflict (registration_number) do nothing;

create sequence if not exists public.pmb_registration_seq start with 6;

do $$
declare
  highest_registration bigint;
  sequence_value bigint;
begin
  select coalesce(max(substring(registration_number from '-([0-9]+)$')::bigint), 5)
    into highest_registration
    from public.profiles
    where registration_number ~ '^PMB[0-9]{2}-[0-9]+$';
  select last_value into sequence_value from public.pmb_registration_seq;
  if highest_registration > sequence_value then
    perform setval('public.pmb_registration_seq', highest_registration, true);
  end if;
end;
$$;

create or replace function public.next_pmb_registration_number()
returns text
language sql
security definer
set search_path = public
as $$
  select 'PMB' || to_char(current_date, 'YY') || '-' ||
    lpad(nextval('public.pmb_registration_seq')::text, 4, '0');
$$;

revoke all on function public.next_pmb_registration_number() from public;
grant execute on function public.next_pmb_registration_number() to authenticated;

create table if not exists public.portal_content (
  id integer primary key check (id = 1),
  programs jsonb not null default '[]'::jsonb,
  schedules jsonb not null default '[]'::jsonb,
  routes jsonb not null default '[]'::jsonb,
  announcements jsonb not null default '[]'::jsonb,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

alter table public.portal_content enable row level security;
grant select on public.portal_content to anon, authenticated;
grant insert, update on public.portal_content to authenticated;

drop policy if exists "portal_content_public_read" on public.portal_content;
create policy "portal_content_public_read"
  on public.portal_content for select to anon, authenticated
  using (true);

drop policy if exists "portal_content_admin_insert" on public.portal_content;
create policy "portal_content_admin_insert"
  on public.portal_content for insert to authenticated
  with check (public.is_pmb_admin());

drop policy if exists "portal_content_admin_update" on public.portal_content;
create policy "portal_content_admin_update"
  on public.portal_content for update to authenticated
  using (public.is_pmb_admin())
  with check (public.is_pmb_admin());

insert into public.portal_content (id, programs, schedules, routes, announcements)
values (
  1,
  '[
    {"name":"Informatika","faculty":"Fakultas Teknologi","quota":120,"icon":"⌘","description":"Bangun solusi digital untuk masa depan."},
    {"name":"Manajemen","faculty":"Fakultas Ekonomi","quota":100,"icon":"↗","description":"Pimpin bisnis dan ciptakan peluang."},
    {"name":"Psikologi","faculty":"Fakultas Humaniora","quota":80,"icon":"◉","description":"Pahami manusia, hadirkan perubahan."},
    {"name":"Ilmu Komunikasi","faculty":"Fakultas Humaniora","quota":90,"icon":"✳","description":"Ceritakan ide yang menggerakkan dunia."},
    {"name":"Sistem Informasi","faculty":"Fakultas Teknologi","quota":90,"icon":"▦","description":"Hubungkan teknologi dan strategi bisnis."},
    {"name":"Akuntansi","faculty":"Fakultas Ekonomi","quota":80,"icon":"◫","description":"Jadi ahli keuangan yang berdampak."},
    {"name":"Desain Komunikasi Visual","faculty":"Fakultas Desain","quota":60,"icon":"✎","description":"Wujudkan gagasan melalui desain."},
    {"name":"Teknik Industri","faculty":"Fakultas Teknologi","quota":75,"icon":"⚙","description":"Rancang sistem yang lebih efisien."}
  ]'::jsonb,
  '[
    {"date":"01 Apr – 30 Jun 2026","title":"Pendaftaran gelombang 1","status":"Dibuka"},
    {"date":"05 Jul 2026","title":"Ujian seleksi gelombang 1","status":"Segera"},
    {"date":"12 Jul 2026","title":"Pengumuman hasil seleksi","status":"Segera"}
  ]'::jsonb,
  '[
    {"name":"Reguler","description":"Seleksi melalui tes potensi akademik berbasis komputer.","status":"Aktif"},
    {"name":"Prestasi","description":"Apresiasi untuk pencapaian akademik maupun non-akademik.","status":"Aktif"},
    {"name":"Beasiswa","description":"Dukungan pendidikan untuk potensi yang layak diperjuangkan.","status":"Aktif"}
  ]'::jsonb,
  '[
    {"date":"20 MEI 2026","title":"Pendaftaran mahasiswa baru gelombang 1 telah dibuka","body":"Wujudkan masa depanmu bersama Universitas Cakrawala Nusantara. Pendaftaran dibuka hingga 30 Juni 2026."},
    {"date":"15 MEI 2026","title":"Beasiswa Cakrawala untuk calon mahasiswa berprestasi","body":"Kesempatan beasiswa pendidikan bagi calon mahasiswa dengan prestasi akademik dan non-akademik."},
    {"date":"08 MEI 2026","title":"Kenali lebih dekat program studi pilihanmu","body":"Ikuti sesi informasi dan konsultasi program studi bersama dosen dan mahasiswa kami."}
  ]'::jsonb
)
on conflict (id) do nothing;
