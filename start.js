#!/usr/bin/env node
/**
 * One-command launcher:  node start.js   (or start.bat / ./start.sh)
 *  1. creates backend/.env if missing   2. installs dependencies on first run
 *  3. starts backend (SQLite database is created automatically) + frontend and prints a connection summary
 * Flags: --no-open (don't open the browser)  --prod (build the frontend and serve everything from the backend on :PORT)
 */
import {spawn,spawnSync} from 'child_process';import fs from 'fs';import path from 'path';import crypto from 'crypto';import http from 'http';import {fileURLToPath} from 'url';
const root=path.dirname(fileURLToPath(import.meta.url)),be=path.join(root,'backend'),fe=path.join(root,'frontend');
const win=process.platform==='win32',args=process.argv.slice(2),PROD=args.includes('--prod');
const col=(n,s)=>process.stdout.isTTY?`\x1b[${n}m${s}\x1b[0m`:s,blue=s=>col(36,s),green=s=>col(32,s),red=s=>col(31,s),dim=s=>col(2,s),bold=s=>col(1,s);
const say=m=>console.log(`${blue('▸')} ${m}`),die=m=>{console.error(`\n${red('✖')} ${m}\n`);cleanup();process.exit(1)};
if(+process.versions.node.split('.')[0]<20)die(`Node 20 or newer is required (you have ${process.version}). Get it at https://nodejs.org`);
const sh=(cmd,o={})=>spawnSync(cmd,{shell:true,...o}); // one command string (passing an args array with shell:true is deprecated)
let stopping=false;const kids=[];function cleanup(){stopping=true;for(const k of kids){try{win?spawnSync('taskkill',['/pid',String(k.pid),'/t','/f']):k.kill('SIGTERM')}catch{}}}
process.on('SIGINT',()=>{cleanup();process.exit(0)});process.on('SIGTERM',()=>{cleanup();process.exit(0)});process.on('exit',cleanup);
function spawnLogged(tag,cmd,a,cwd){const p=spawn(cmd,a,{cwd,env:process.env,stdio:['ignore','pipe','pipe'],windowsHide:true});kids.push(p);
  const pipe=s=>{let buf='';s.on('data',d=>{buf+=d;const L=buf.split(/\r?\n/);buf=L.pop();for(const l of L)if(l.trim())console.log(`${dim(tag.padEnd(9))} ${l}`)})};pipe(p.stdout);pipe(p.stderr);
  p.on('error',e=>die(`Could not start ${tag}: ${e.message}`));p.on('exit',code=>{if(code&&!stopping)die(`${tag} stopped (exit ${code}). The messages just above explain why.`)});return p}

// 1) env
const envFile=path.join(be,'.env'),example=path.join(be,'.env.example');
if(!fs.existsSync(envFile)){if(!fs.existsSync(example))die('backend/.env.example is missing');
  fs.writeFileSync(envFile,fs.readFileSync(example,'utf8').replace(/^JWT_SECRET=.*$/m,'JWT_SECRET='+crypto.randomBytes(36).toString('hex')));say('Created backend/.env (edit it to change the admin login or add cloud storage)')}
const env=Object.fromEntries(fs.readFileSync(envFile,'utf8').split(/\r?\n/).filter(l=>/^\s*[A-Z_0-9]+\s*=/.test(l)).map(l=>{const i=l.indexOf('=');return[l.slice(0,i).trim(),l.slice(i+1).trim()]}));
const PORT=+env.PORT||4000;
if(!env.JWT_SECRET||env.JWT_SECRET.length<24)die('Set JWT_SECRET (24+ characters) in backend/.env');

// 2) dependencies
for(const[name,dir]of[['backend',be],['frontend',fe]])if(!fs.existsSync(path.join(dir,'node_modules'))){say(`Installing ${name} dependencies (first run only)…`);
  if(sh('npm install --no-audit --no-fund',{cwd:dir,stdio:'inherit'}).status!==0)die(`npm install failed in ${name}/`)}

// 3) run
let siteUrl;
if(PROD){say('Building the website…');if(sh('npm run build',{cwd:fe,stdio:'inherit'}).status!==0)die('Frontend build failed');
  spawnLogged('server','node',['src/index.js'],be);siteUrl=`http://localhost:${PORT}`}
else{spawnLogged('backend','node',['--watch','src/index.js'],be);
  spawnLogged('frontend','node',[path.join(fe,'node_modules','vite','bin','vite.js'),'--port','5173','--strictPort'],fe);siteUrl='http://localhost:5173'}

const health=()=>new Promise(r=>http.get({host:'127.0.0.1',port:PORT,path:'/api/health',timeout:1500},res=>{let b='';res.on('data',d=>b+=d);res.on('end',()=>{try{r(JSON.parse(b))}catch{r(null)}})}).on('error',()=>r(null)));
let h=null;for(let i=0;i<180;i++){h=await health();if(h?.ok)break;if(i&&i%16===0)say('Still starting the backend…');await new Promise(r=>setTimeout(r,500))}
if(!h?.ok)die('The backend did not become healthy. Check the red messages above (is port '+PORT+' already in use?).');
const cloud=h.storage==='cloud-s3';
console.log(`
${green('✔')} ${bold('Force One is running')}

  Website   ${bold(siteUrl)}
  Admin     ${bold(siteUrl+'/admin')}   ${dim(`${env.ADMIN_EMAIL||'(see .env)'} · password from backend/.env`)}
  API       http://localhost:${PORT}/api/health

  Database  ${green('connected')}  ${dim(`SQLite · backend/${(env.DATABASE_PATH||'./data/forceone.db').replace(/^\.\//,'')}`)}
  Storage   ${cloud?green('cloud bucket'):'local disk'}  ${dim(cloud?env.S3_BUCKET:'backend/uploads — fine for development; set S3_* in backend/.env before deploying')}

  ${dim('Press Ctrl+C to stop everything.')}
`);
if(!args.includes('--no-open'))try{spawn(win?'cmd':process.platform==='darwin'?'open':'xdg-open',win?['/c','start','',siteUrl]:[siteUrl],{stdio:'ignore',detached:true}).on('error',()=>{}).unref()}catch{}
await new Promise(()=>{});
