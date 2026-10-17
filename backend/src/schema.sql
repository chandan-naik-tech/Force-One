create table if not exists admins(id serial primary key,email text unique not null,password_hash text not null);
create table if not exists settings(key text primary key,value jsonb not null default '{}');
create table if not exists media(
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('image','video')),
  source text not null default 'upload' check (source in ('upload','youtube')),
  category text not null default 'OTHERS',
  title text not null default '', description text not null default '',
  url text not null, thumb_url text, key text, thumb_key text,
  featured boolean not null default false, sort_order int not null default 0,
  width int, height int, created_at timestamptz not null default now());
create index if not exists media_kind_idx on media(kind, category);
create table if not exists items(
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('journey','memory','feature','service')),
  data jsonb not null default '{}', created_at timestamptz not null default now());
create index if not exists items_type_idx on items(type);
