import {useEffect,useState} from 'react';import {motion,AnimatePresence} from 'framer-motion';import {Upload,X} from 'lucide-react';import {uploadFile} from '../api';import {isVideoUrl} from '../const';
export const toast=(m,err)=>window.dispatchEvent(new CustomEvent('toast',{detail:{m,err}}));
export const ask=m=>new Promise(r=>window.dispatchEvent(new CustomEvent('ask',{detail:{m,r}})));
export function Overlays(){const[t,setT]=useState(null);const[c,setC]=useState(null);
  useEffect(()=>{const a=e=>{setT(e.detail);setTimeout(()=>setT(null),3500)},b=e=>setC(e.detail);addEventListener('toast',a);addEventListener('ask',b);return()=>{removeEventListener('toast',a);removeEventListener('ask',b)}},[]);
  const done=v=>{c.r(v);setC(null)};
  return<><AnimatePresence>{t&&<motion.div initial={{y:30,opacity:0}} animate={{y:0,opacity:1}} exit={{opacity:0}} className={`fixed bottom-5 left-1/2 z-[120] -translate-x-1/2 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-lg ${t.err?'bg-red-600':'bg-navy'}`} role="status">{t.m}</motion.div>}</AnimatePresence>
    <AnimatePresence>{c&&<motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[110] grid place-items-center bg-navy/40 p-4"><motion.div initial={{scale:.95}} animate={{scale:1}} className="w-full max-w-sm rounded-2xl bg-white p-6" role="alertdialog">
      <p className="font-semibold">{c.m}</p><div className="mt-5 flex justify-end gap-2"><button className="btn-ghost !py-2" onClick={()=>done(false)}>Cancel</button><button className="btn !py-2 bg-red-600 text-white hover:bg-red-700" onClick={()=>done(true)}>Delete</button></div></motion.div></motion.div>}</AnimatePresence></>}
export const Label=({l,children})=><label className="block"><span className="mb-1 block text-xs font-semibold text-navy/70">{l}</span>{children}</label>;
export function FileField({value,onChange,accept='image/*'}){const[p,setP]=useState(null);
  const pick=async e=>{const f=e.target.files[0];if(!f)return;setP(0);try{const r=await uploadFile(f,{category:'ASSET',onProgress:setP,save:false});onChange(r.url)}catch(x){toast(x.message,1)}setP(null);e.target.value=''};
  return<div className="flex items-center gap-3">{value&&(/\.glb$/i.test(value)?<span className="rounded bg-sky-100 px-2 py-1 text-xs font-semibold">3D model uploaded</span>:isVideoUrl(value)?<video src={value} className="h-14 w-20 rounded object-cover" muted/>:<img src={value} alt="" className="h-14 w-20 rounded object-cover"/>)}
    <label className="btn-ghost cursor-pointer !px-4 !py-2"><Upload size={14}/>{p===null?(value?'Replace':'Upload'):`${Math.round(p*100)}%`}<input type="file" accept={accept} className="sr-only" onChange={pick}/></label>
    {value&&<button type="button" onClick={()=>onChange('')} className="text-xs text-red-600">Remove</button>}</div>}
export function FilesField({value=[],onChange}){const[busy,setBusy]=useState(false);
  const pick=async e=>{setBusy(true);const out=[...value];for(const f of e.target.files){try{out.push((await uploadFile(f,{category:'ASSET'})).url)}catch(x){toast(x.message,1)}}onChange(out);setBusy(false);e.target.value=''};
  return<div className="flex flex-wrap items-center gap-2">{value.map(u=><div key={u} className="relative"><img src={u} alt="" className="h-14 w-14 rounded object-cover"/><button type="button" aria-label="Remove photo" onClick={()=>onChange(value.filter(x=>x!==u))} className="absolute -right-1 -top-1 rounded-full bg-navy p-0.5 text-white"><X size={12}/></button></div>)}
    <label className="btn-ghost cursor-pointer !px-4 !py-2"><Upload size={14}/>{busy?'Uploading…':'Add photos'}<input type="file" accept="image/*" multiple className="sr-only" onChange={pick}/></label></div>}
export function Form({fields,value,onChange}){const set=(k,v)=>onChange({...value,[k]:v});
  return<div className="grid gap-4 md:grid-cols-2">{fields.map(f=>{if(f.type==='heading')return<h3 key={f.name} className="mt-4 border-b border-sky-200 pb-2 font-display text-lg font-bold md:col-span-2">{f.label}</h3>;const v=value[f.name]??'';return<div key={f.name} className={f.wide||['textarea','images','image','file'].includes(f.type)?'md:col-span-2':''}><Label l={f.label+(f.required?' *':'')}>
    {f.type==='textarea'?<textarea className="input min-h-28" value={v} onChange={e=>set(f.name,e.target.value)}/>
    :f.type==='select'?<select className="input" value={v} onChange={e=>set(f.name,e.target.value)}><option value="">Select…</option>{f.options.map(o=><option key={o}>{o}</option>)}</select>
    :f.type==='checkbox'?<input type="checkbox" className="h-5 w-5 accent-sky-500" checked={!!value[f.name]} onChange={e=>set(f.name,e.target.checked)}/>
    :f.type==='image'||f.type==='file'?<FileField value={v} accept={f.accept} onChange={x=>set(f.name,x)}/>
    :f.type==='images'?<FilesField value={value[f.name]||[]} onChange={x=>set(f.name,x)}/>
    :<input className="input" type={f.type||'text'} value={v} placeholder={f.hint} onChange={e=>set(f.name,f.type==='number'&&e.target.value!==''?+e.target.value:e.target.value)}/>}</Label></div>})}</div>}
