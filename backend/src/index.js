import './env.js';import express from 'express';import helmet from 'helmet';import cookieParser from 'cookie-parser';import path from 'path';import fs from 'fs';import {fileURLToPath} from 'url';
import {get,dbFile} from './db.js';import {seedIfEmpty} from './seed.js';import {isLocal,uploadDir} from './storage.js';import auth from './auth.js';import media from './media.js';import content from './content.js';
const app=express();app.set('trust proxy',1);
app.use(helmet({contentSecurityPolicy:false,crossOriginResourcePolicy:{policy:'cross-origin'}}));
app.use(express.json({limit:'1mb'}));app.use(cookieParser());
app.get('/api/health',(req,res)=>{let db=false;try{get('select 1');db=true}catch{}res.status(db?200:503).json({ok:db,database:db?'sqlite':false,storage:isLocal?'local-disk':'cloud-s3'})});
if(isLocal){fs.mkdirSync(uploadDir,{recursive:true});app.use('/uploads',express.static(uploadDir,{maxAge:'1y',immutable:true}))}
app.use('/api/auth',auth.router);app.use('/api/media',media);app.use('/api',content);
app.use('/api',(req,res)=>res.status(404).json({error:'Not found'}));
const dist=path.join(path.dirname(fileURLToPath(import.meta.url)),'../../frontend/dist');
if(fs.existsSync(dist)){app.use('/assets',express.static(path.join(dist,'assets'),{maxAge:'1y',immutable:true}));app.use(express.static(dist));app.get('*',(req,res)=>res.sendFile(path.join(dist,'index.html')))}
app.use((err,req,res,next)=>{if(!err.status&&err.code!=='LIMIT_FILE_SIZE')console.error(err);
  const big=err.code==='LIMIT_FILE_SIZE';res.status(big?413:err.status||500).json({error:big?'Image is larger than 30 MB':err.status?err.message:'Something went wrong on the server'})});
seedIfEmpty();await auth.ensureAdmin();
app.listen(process.env.PORT||4000,()=>console.log('Force One server running on :'+(process.env.PORT||4000)));
