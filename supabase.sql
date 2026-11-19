-- =====================================================================
-- FUJI FLORIST v2 - skema database (Supabase)
-- Jalankan SEKALI di Supabase > SQL Editor > New query > Run.
-- Aman dijalankan berulang kali, dan aman untuk database LAMA:
-- data produk lama dipertahankan, kolom/tabel baru ditambahkan.
-- =====================================================================

-- 1) PRODUK ------------------------------------------------------------
create table if not exists produk (
  id bigint generated always as identity primary key,
  nama text not null,
  kategori text not null,
  harga integer not null default 0,
  gambar text not null default '',
  created_at timestamptz not null default now()
);
alter table produk add column if not exists deskripsi text not null default '';
alter table produk add column if not exists diskon_tipe text not null default 'none';
alter table produk add column if not exists diskon_nilai integer not null default 0;
alter table produk add column if not exists diskon_mulai timestamptz;
alter table produk add column if not exists diskon_selesai timestamptz;
alter table produk add column if not exists aktif boolean not null default true;
alter table produk add column if not exists unggulan boolean not null default false;
alter table produk add column if not exists stok text not null default 'tersedia';
alter table produk add column if not exists updated_at timestamptz not null default now();

do $$ begin
  alter table produk add constraint produk_harga_ok check (harga >= 0 and harga <= 100000000);
exception when duplicate_object then null; end $$;
do $$ begin
  alter table produk add constraint produk_diskon_ok check (diskon_tipe in ('none','persen','nominal') and diskon_nilai >= 0);
exception when duplicate_object then null; end $$;
do $$ begin
  alter table produk add constraint produk_stok_ok check (stok in ('tersedia','habis'));
exception when duplicate_object then null; end $$;

-- Rapikan data lama: nama kategori lama -> slug, foto lama -> foto baru
update produk set kategori = case kategori
  when 'Papan Bunga Grand Opening' then 'pembukaan'
  when 'Papan Bunga Pernikahan' then 'pernikahan'
  when 'Papan Bunga Duka Cita' then 'duka-cita'
  when 'Papan Bunga Ulang Tahun & Perayaan' then 'ulang-tahun'
  when 'Custom Papan Bunga Bebas' then 'papan-bunga-custom'
  else regexp_replace(lower(trim(kategori)), '\s+', '-', 'g') end;
update produk set gambar = regexp_replace(gambar, '^/gambar-produk/(\d+|custom)\.jpg$', '/img/produk/\1.webp')
  where gambar ~ '^/gambar-produk/(\d+|custom)\.jpg$';

create index if not exists produk_kategori_idx on produk (kategori);
create index if not exists produk_aktif_idx on produk (aktif);

-- 2) KATEGORI ----------------------------------------------------------
create table if not exists kategori (
  slug text primary key,
  nama text not null,
  deskripsi text not null default '',
  gambar text not null default '',
  urutan integer not null default 0,
  aktif boolean not null default true
);
insert into kategori (slug, nama, deskripsi, gambar, urutan) values
  ('pernikahan','Papan Bunga Pernikahan','Papan bunga pernikahan untuk ucapan selamat menikah, akad, dan resepsi di Bandung. Pilih desain yang meriah, tulis nama kedua mempelai dan ucapan sesuai keinginan Anda, lalu kami antar ke lokasi acara sesuai jadwal yang disepakati.','/img/kategori/8.webp',1),
  ('ulang-tahun','Papan Bunga Ulang Tahun','Kirim kejutan dan ucapan ulang tahun lewat papan bunga yang ceria untuk keluarga, sahabat, rekan kerja, maupun ulang tahun perusahaan. Tulisan ucapan bisa kami sesuaikan dengan permintaan Anda.','/img/kategori/7.webp',2),
  ('pembukaan','Papan Bunga Grand Opening','Papan bunga grand opening dan pembukaan usaha baru untuk mendoakan kelancaran bisnis kolega, klien, atau mitra Anda di Bandung. Tulisan ucapan dan nama pengirim dapat dibuat custom.','/img/kategori/11.webp',3),
  ('duka-cita','Papan Bunga Duka Cita','Papan bunga duka cita sebagai tanda belasungkawa dan penghormatan. Kami bantu menyiapkan tulisan yang sopan dan mengantarnya ke rumah duka atau pemakaman di Bandung sesuai jadwal yang disepakati.','/img/kategori/9.webp',4),
  ('graduation','Bunga Wisuda & Graduation','Buket dan papan bunga wisuda untuk merayakan kelulusan anak, saudara, atau sahabat. Tersedia pilihan buket, bunga dalam box, dan papan ucapan graduation.','/img/kategori/10.webp',5),
  ('papan-bunga-custom','Papan Bunga Custom','Butuh desain atau tulisan khusus? Papan bunga custom bisa dibuat sesuai ukuran, warna, dan ucapan yang Anda inginkan. Kirim detailnya lewat WhatsApp dan kami bantu dari konsep sampai pengiriman.','/img/kategori/13.webp',6),
  ('buket-bunga','Buket Bunga','Buket bunga segar dan hand bouquet untuk hadiah ulang tahun, anniversary, wisuda, atau sekadar memberi kejutan. Tersedia rangkaian mawar, bunga campur, hingga buket elegan dengan wrapping cantik.','/img/kategori/1.webp',7),
  ('bunga-standing','Bunga Standing','Standing flower yang anggun untuk dekorasi acara, ucapan selamat, atau hadiah bernuansa mewah. Cocok untuk kantor, hotel, dan resepsi.','/img/kategori/4.webp',8),
  ('bunga-meja','Bunga Meja','Rangkaian bunga meja dalam vas atau box untuk mempercantik ruang tamu, kantor, meja resepsionis, dan acara. Segar, rapi, dan mudah diletakkan di mana saja.','/img/kategori/3.webp',9),
  ('parcel-bunga','Parcel Bunga','Parcel bunga dan hadiah spesial berisi bunga cantik yang dipadukan dengan cokelat atau pelengkap lainnya. Pilihan tepat untuk momen romantis, ulang tahun, dan ucapan terima kasih.','/img/kategori/5.webp',10),
  ('parcel-buah','Parcel Buah','Parcel buah segar dan bingkisan sehat untuk menjenguk orang sakit, hampers, atau hadiah keluarga. Dikemas rapi dan siap diberikan.','/img/kategori/6.webp',11),
  ('bunga-buah','Bunga & Buah','Perpaduan rangkaian bunga dan buah segar dalam keranjang atau box eksklusif. Pas untuk hadiah, ucapan selamat, maupun hampers istimewa.','/img/kategori/12.webp',12)
on conflict (slug) do nothing;

-- 3) PENGATURAN TOKO (satu baris) --------------------------------------
create table if not exists pengaturan (
  id integer primary key default 1 check (id = 1),
  data jsonb not null default '{}'::jsonb
);
insert into pengaturan (id) values (1) on conflict (id) do nothing;

-- 4) TESTIMONI ---------------------------------------------------------
create table if not exists testimoni (
  id bigint generated always as identity primary key,
  nama text not null,
  teks text not null,
  bintang integer not null default 5 check (bintang between 1 and 5),
  aktif boolean not null default true,
  created_at timestamptz not null default now()
);

-- 5) KEAMANAN ADMIN ----------------------------------------------------
create table if not exists admin (
  id integer primary key default 1 check (id = 1),
  pass_hash text,
  sesi_versi integer not null default 0
);
insert into admin (id) values (1) on conflict (id) do nothing;

create table if not exists login_gagal (
  id bigint generated always as identity primary key,
  ip text not null,
  created_at timestamptz not null default now()
);
create index if not exists login_gagal_idx on login_gagal (ip, created_at);

create table if not exists log_admin (
  id bigint generated always as identity primary key,
  aksi text not null,
  detail text not null default '',
  ip text not null default '',
  created_at timestamptz not null default now()
);

-- 6) KUNCI SEMUA TABEL: hanya server (service role) yang boleh akses ------
alter table produk enable row level security;
alter table kategori enable row level security;
alter table pengaturan enable row level security;
alter table testimoni enable row level security;
alter table admin enable row level security;
alter table login_gagal enable row level security;
alter table log_admin enable row level security;
revoke all on table produk, kategori, pengaturan, testimoni, admin, login_gagal, log_admin from anon, authenticated;

-- 7) PENYIMPANAN FOTO ----------------------------------------------------
insert into storage.buckets (id, name, public) values ('produk', 'produk', true) on conflict (id) do nothing;
update storage.buckets set file_size_limit = 5242880, allowed_mime_types = array['image/webp','image/jpeg','image/png'] where id = 'produk';

-- 8) PRODUK CONTOH (hanya jika tabel produk masih kosong) ----------------
insert into produk (nama, kategori, harga, gambar)
select * from (values
  ('Buket Mawar Merah','buket-bunga',0,'/img/produk/1.webp'),
  ('Hand Bouquet Mawar Pink','buket-bunga',0,'/img/produk/2.webp'),
  ('Bunga Meja Elegan','bunga-meja',0,'/img/produk/3.webp'),
  ('Box Bunga Segar','bunga-meja',0,'/img/produk/4.webp'),
  ('Standing Flower Lily','bunga-standing',0,'/img/produk/5.webp'),
  ('Bunga Standing Elegan','bunga-standing',0,'/img/produk/6.webp'),
  ('Forever Flower Premium Box','parcel-bunga',0,'/img/produk/7.webp'),
  ('Parcel Bunga dan Cokelat','parcel-bunga',0,'/img/produk/8.webp'),
  ('Chocolate Gift Box','parcel-buah',0,'/img/produk/9.webp'),
  ('Parcel Buah Premium','parcel-buah',0,'/img/produk/10.webp'),
  ('Papan Ulang Tahun Ceria','ulang-tahun',0,'/img/produk/11.webp'),
  ('Papan Ulang Tahun Spesial','ulang-tahun',0,'/img/produk/12.webp'),
  ('Papan Pernikahan Elegan','pernikahan',0,'/img/produk/13.webp'),
  ('Papan Pernikahan Premium','pernikahan',0,'/img/produk/14.webp'),
  ('Papan Duka Cita Mawar Putih','duka-cita',0,'/img/produk/15.webp'),
  ('Papan Duka Cita Hitam Emas','duka-cita',0,'/img/produk/16.webp'),
  ('Graduation Bloom Box','graduation',0,'/img/produk/17.webp'),
  ('Buket Wisuda Spesial','graduation',0,'/img/produk/18.webp'),
  ('Papan Pembukaan Bisnis Baru','pembukaan',0,'/img/produk/19.webp'),
  ('Papan Bunga Grand Opening','pembukaan',0,'/img/produk/20.webp'),
  ('Bouquet Bunga dan Buah','bunga-buah',0,'/img/produk/21.webp'),
  ('Box Bunga Buah Premium','bunga-buah',0,'/img/produk/22.webp'),
  ('Papan Bunga Custom Tulisan Bebas','papan-bunga-custom',0,'/img/produk/custom.webp')
) as v(nama, kategori, harga, gambar)
where not exists (select 1 from produk);
