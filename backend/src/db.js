import Database from 'better-sqlite3';import fs from 'fs';import path from 'path';import {fileURLToPath} from 'url';
const base=fileURLToPath(new URL('..',import.meta.url));
export const dbFile=path.resolve(base,process.env.DATABASE_PATH||'./data/forceone.db');
fs.mkdirSync(path.dirname(dbFile),{recursive:true});
export const db=new Database(dbFile);db.pragma('journal_mode = WAL');db.pragma('foreign_keys = ON');
db.exec(`
create table if not exists admins(id integer primary key autoincrement,email text unique not null,password_hash text not null);
create table if not exists settings(key text primary key,value text not null default '{}');
create table if not exists meta(key text primary key,value text);
create table if not exists media(id text primary key,kind text not null check(kind in('image','video')),source text not null default 'upload',
  category text not null default 'OTHERS',title text not null default '',description text not null default '',url text not null,thumb_url text,key text,thumb_key text,
  featured integer not null default 0,sort_order integer not null default 0,width integer,height integer,created_at text not null default (datetime('now')));
create index if not exists media_kind_idx on media(kind,category);
create table if not exists items(id text primary key,type text not null,data text not null default '{}',created_at text not null default (datetime('now')));
create index if not exists items_type_idx on items(type);`);
export const all=(sql,...p)=>db.prepare(sql).all(...p);
export const get=(sql,...p)=>db.prepare(sql).get(...p);
export const run=(sql,...p)=>db.prepare(sql).run(...p);
export const tx=fn=>db.transaction(fn)();
