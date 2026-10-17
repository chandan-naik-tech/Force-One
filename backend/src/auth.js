import {Router} from 'express';import bcrypt from 'bcryptjs';import jwt from 'jsonwebtoken';import rateLimit from 'express-rate-limit';import {get,run} from './db.js';import {wrap} from './util.js';
const secret=()=>{if(!process.env.JWT_SECRET||process.env.JWT_SECRET.length<24)throw new Error('JWT_SECRET must be set (24+ chars)');return process.env.JWT_SECRET};
export const requireAuth=(req,res,next)=>{try{req.user=jwt.verify(req.cookies.token,secret());next()}catch{res.status(401).json({error:'Sign in to continue'})}};
export const isAuthed=req=>{try{jwt.verify(req.cookies.token,secret());return true}catch{return false}};
export async function ensureAdmin(){secret();
  if(!get('select count(*) c from admins').c&&process.env.ADMIN_EMAIL&&process.env.ADMIN_PASSWORD){run('insert into admins(email,password_hash) values(?,?)',process.env.ADMIN_EMAIL.toLowerCase(),await bcrypt.hash(process.env.ADMIN_PASSWORD,12));console.log('Admin user created')}}
export const router=Router();
router.post('/login',rateLimit({windowMs:15*60e3,max:10,message:{error:'Too many attempts. Try again in 15 minutes.'}}),wrap(async(req,res)=>{
  const{email='',password=''}=req.body||{};const u=get('select * from admins where email=?',String(email).toLowerCase());
  if(!u||!(await bcrypt.compare(String(password),u.password_hash)))return res.status(401).json({error:'Email or password is incorrect'});
  res.cookie('token',jwt.sign({id:u.id,email:u.email},secret(),{expiresIn:'7d'}),{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',maxAge:7*864e5});res.json({email:u.email})}));
router.post('/logout',(req,res)=>{res.clearCookie('token');res.json({ok:true})});
router.get('/me',requireAuth,(req,res)=>res.json({email:req.user.email}));
router.post('/password',requireAuth,wrap(async(req,res)=>{const{current='',next=''}=req.body||{};const u=get('select * from admins where id=?',req.user.id);
  if(!u||!(await bcrypt.compare(String(current),u.password_hash)))return res.status(400).json({error:'Current password is incorrect'});
  if(String(next).length<8)return res.status(400).json({error:'New password must be at least 8 characters'});
  run('update admins set password_hash=? where id=?',await bcrypt.hash(String(next),12),u.id);res.json({ok:true})}));
export default {router,ensureAdmin};
