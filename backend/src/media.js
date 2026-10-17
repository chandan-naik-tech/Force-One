import {Router} from 'express';import multer from 'multer';import sharp from 'sharp';import crypto from 'crypto';import fs from 'fs';import path from 'path';
import {all,get,run,tx} from './db.js';import {requireAuth} from './auth.js';import {put,remove,presign,isLocal,localPath} from './storage.js';import {wrap} from './util.js';
const r=Router();const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:30*1024*1024,files:30},
  fileFilter:(req,f,cb)=>/^image\/(jpeg|png|webp|heic|heif|avif)$/.test(f.mimetype)?cb(null,true):cb(Object.assign(new Error('Only JPG, PNG, WebP, HEIC or AVIF images are allowed'),{status:400}))});
const VIDEO={'video/mp4':'mp4','video/webm':'webm','video/quicktime':'mov','model/gltf-binary':'glb'};
const out=m=>m&&{...m,featured:!!m.featured};const FIRST=k=>`(select coalesce(min(sort_order),0)-1 from media where kind='${k}')`;
r.get('/',(req,res)=>{const{kind,category}=req.query;const w=[],p=[];
  if(kind){p.push(kind);w.push('kind=?')}if(category){p.push(category);w.push('category=?')}else w.push("category<>'ASSET'");
  res.json(all(`select * from media where ${w.join(' and ')} order by featured desc, sort_order asc, created_at desc, rowid desc`,...p).map(out))});
r.post('/images',requireAuth,upload.array('files',30),wrap(async(req,res)=>{const category=String(req.body.category||'OTHERS').toUpperCase();const items=[];
  for(const f of req.files||[]){const id=crypto.randomUUID();const img=sharp(f.buffer).rotate();
    const main=await img.clone().resize({width:2400,height:2400,fit:'inside',withoutEnlargement:true}).webp({quality:82}).toBuffer({resolveWithObject:true});
    const thumb=await img.clone().resize({width:800,withoutEnlargement:true}).webp({quality:75}).toBuffer();
    const key=`images/${id}.webp`,thumbKey=`images/${id}-thumb.webp`;
    const[url,thumbUrl]=await Promise.all([put(key,main.data,'image/webp'),put(thumbKey,thumb,'image/webp')]);
    run(`insert into media(id,kind,category,title,url,thumb_url,key,thumb_key,width,height,sort_order) values(?,'image',?,?,?,?,?,?,?,?,${FIRST('image')})`,id,category,f.originalname.replace(/\.[^.]+$/,'').slice(0,120),url,thumbUrl,key,thumbKey,main.info.width,main.info.height);
    items.push(out(get('select * from media where id=?',id)))}
  res.status(201).json({items})}));
r.post('/presign',requireAuth,wrap(async(req,res)=>{const ext=VIDEO[req.body.type];if(!ext)return res.status(400).json({error:'Use MP4, WebM or MOV videos, or a .glb 3D model'});
  res.json(await presign(`${ext==='glb'?'models':'videos'}/${crypto.randomUUID()}.${ext}`,req.body.type))}));
if(isLocal)r.put('/local/:dir/:file',requireAuth,(req,res,next)=>{const key=`${req.params.dir}/${req.params.file}`;
  if(!/^(videos|models)\/[\w-]+\.(mp4|webm|mov|glb)$/.test(key))return res.status(400).json({error:'Invalid file name'});
  const p=localPath(key);fs.mkdirSync(path.dirname(p),{recursive:true});const w=fs.createWriteStream(p);req.pipe(w);w.on('finish',()=>res.json({ok:true}));w.on('error',next)});
r.post('/',requireAuth,(req,res)=>{const{source='upload',url,key=null,category='OTHERS',title='',description=''}=req.body;
  if(!url)return res.status(400).json({error:'A video URL is required'});
  if(source==='youtube'&&!/(youtu\.be\/|youtube\.com\/)/.test(url))return res.status(400).json({error:'Enter a valid YouTube link'});
  const id=crypto.randomUUID();run(`insert into media(id,kind,source,category,title,description,url,key,sort_order) values(?,'video',?,?,?,?,?,?,${FIRST('video')})`,id,source,String(category).toUpperCase(),title,description,url,key);
  res.status(201).json(out(get('select * from media where id=?',id)))});
r.patch('/:id',requireAuth,(req,res)=>{const b=req.body,set=[],p=[];
  for(const f of['title','description','category','featured']){if(f in b){p.push(f==='category'?String(b[f]).toUpperCase():f==='featured'?(b[f]?1:0):b[f]);set.push(`${f}=?`)}}
  if(!set.length)return res.status(400).json({error:'Nothing to update'});
  if(!run(`update media set ${set.join(',')} where id=?`,...p,req.params.id).changes)return res.status(404).json({error:'Not found'});
  const row=get('select * from media where id=?',req.params.id);if(b.featured===true)run('update media set featured=0 where kind=? and id<>?',row.kind,row.id);res.json(out(row))});
r.post('/reorder',requireAuth,(req,res)=>{const ids=req.body.ids;if(!Array.isArray(ids))return res.status(400).json({error:'ids required'});
  tx(()=>ids.forEach((id,i)=>run('update media set sort_order=? where id=?',i,String(id))));res.json({ok:true})});
r.delete('/:id',requireAuth,wrap(async(req,res)=>{const row=get('select key,thumb_key from media where id=?',req.params.id);run('delete from media where id=?',req.params.id);if(row)await remove([row.key,row.thumb_key]);res.json({ok:true})}));
export default r;
