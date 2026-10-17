import {Router} from 'express';import crypto from 'crypto';import {all,get,run} from './db.js';import {requireAuth,isAuthed} from './auth.js';
const r=Router();const KEYS=['vehicle','hero','about','site','copy'],TYPES=['journey','memory','feature','service','variant'],BY_ORDER=['feature','variant'];
const obj=(req,res,next)=>req.body&&typeof req.body==='object'&&!Array.isArray(req.body)?next():res.status(400).json({error:'Invalid data'});
const out=x=>x&&{id:x.id,created_at:x.created_at,data:JSON.parse(x.data)};
r.get('/settings',(req,res)=>{res.set('Cache-Control','no-cache');res.json(Object.fromEntries(all('select key,value from settings').map(x=>[x.key,JSON.parse(x.value)])))});
r.put('/settings/:key',requireAuth,obj,(req,res)=>{if(!KEYS.includes(req.params.key))return res.status(404).json({error:'Unknown setting'});
  run('insert into settings(key,value) values(?,?) on conflict(key) do update set value=excluded.value',req.params.key,JSON.stringify(req.body));res.json(req.body)});
r.get('/items/:type',(req,res)=>{const t=req.params.type;if(!TYPES.includes(t))return res.status(404).json({error:'Unknown type'});
  if(t==='service'&&!isAuthed(req)){const s=get("select value from settings where key='site'");if(!s||!JSON.parse(s.value).showServices)return res.json([])}
  const order=BY_ORDER.includes(t)?"coalesce(cast(json_extract(data,'$.order') as integer),9999), rowid":`coalesce(json_extract(data,'$.date'),'') ${t==='journey'?'asc':'desc'}, rowid desc`;
  res.json(all(`select id,data,created_at from items where type=? order by ${order}`,t).map(out))});
r.post('/items/:type',requireAuth,obj,(req,res)=>{if(!TYPES.includes(req.params.type))return res.status(404).json({error:'Unknown type'});
  const id=crypto.randomUUID();run('insert into items(id,type,data) values(?,?,?)',id,req.params.type,JSON.stringify(req.body));res.status(201).json(out(get('select id,data,created_at from items where id=?',id)))});
r.put('/items/:type/:id',requireAuth,obj,(req,res)=>{const c=run('update items set data=? where id=? and type=?',JSON.stringify(req.body),req.params.id,req.params.type).changes;
  c?res.json(out(get('select id,data,created_at from items where id=?',req.params.id))):res.status(404).json({error:'Not found'})});
r.delete('/items/:type/:id',requireAuth,(req,res)=>{run('delete from items where id=? and type=?',req.params.id,req.params.type);res.json({ok:true})});
r.get('/stats',requireAuth,(req,res)=>{const m=all("select kind,count(*) c from media where category<>'ASSET' group by kind"),i=all('select type,count(*) c from items group by type');
  const g=(a,k,f)=>a.find(x=>x[f]===k)?.c||0;res.json({images:g(m,'image','kind'),videos:g(m,'video','kind'),memories:g(i,'memory','type'),journeys:g(i,'journey','type'),services:g(i,'service','type'),variants:g(i,'variant','type'),features:g(i,'feature','type')})});
export default r;
