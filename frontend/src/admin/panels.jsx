import {useEffect,useMemo,useState} from 'react';import {Link} from 'react-router-dom';import {Star,Trash2,Pencil,Plus,ChevronLeft,ChevronRight,Search} from 'lucide-react';
import {api,uploadFile} from '../api';import {CATEGORIES} from '../const';import {Form,toast,ask,Label} from './ui';import {SETTINGS,ITEMS} from './schemas';

export function Dashboard(){const[s,setS]=useState(null);useEffect(()=>{api.get('/stats').then(setS).catch(e=>toast(e.message,1))},[]);
  const cards=[['Images','images','gallery'],['Videos','videos','videos'],['Variants','variants','variants'],['Features','features','features'],['Memories','memories','memories'],['Journeys','journeys','journey'],['Services','services','services']];
  return<div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-7">{cards.map(([l,k,to])=><Link key={k} to={to} className="rounded-2xl border border-sky-200 bg-white p-5 transition hover:border-sky-500"><p className="text-xs font-semibold text-sky-500">Total {l.toLowerCase()}</p><p className="mt-2 font-display text-4xl font-extrabold">{s?s[k]:'–'}</p></Link>)}</div>}

export function SettingsPanel({k}){const[v,setV]=useState(null);const[busy,setBusy]=useState(false);
  useEffect(()=>{api.get('/settings').then(s=>setV(s[k]||{})).catch(e=>toast(e.message,1))},[k]);
  const save=async()=>{setBusy(true);try{await api.put('/settings/'+k,v);toast('Saved')}catch(e){toast(e.message,1)}setBusy(false)};
  if(!v)return<p className="text-navy/50">Loading…</p>;
  return<div className="max-w-3xl"><Form fields={SETTINGS[k]} value={v} onChange={setV}/><button disabled={busy} onClick={save} className="btn-primary mt-6">{busy?'Saving…':'Save changes'}</button></div>}

export function ItemsPanel({type}){const S=ITEMS[type];const[list,setList]=useState(null);const[edit,setEdit]=useState(null);const[q,setQ]=useState('');const[busy,setBusy]=useState(false);
  const load=()=>api.get('/items/'+type).then(setList).catch(e=>toast(e.message,1));useEffect(()=>{setEdit(null);load()},[type]);
  const save=async()=>{const miss=S.fields.find(f=>f.required&&!edit.data[f.name]);if(miss)return toast(`${miss.label} is required`,1);setBusy(true);
    try{edit.id?await api.put(`/items/${type}/${edit.id}`,edit.data):await api.post('/items/'+type,edit.data);toast('Saved');setEdit(null);load()}catch(e){toast(e.message,1)}setBusy(false)};
  const del=async x=>{if(await ask(`Delete “${S.label(x.data)}”? This can't be undone.`)){try{await api.del(`/items/${type}/${x.id}`);toast('Deleted');load()}catch(e){toast(e.message,1)}}};
  const shown=useMemo(()=>(list||[]).filter(x=>JSON.stringify(x.data).toLowerCase().includes(q.toLowerCase())),[list,q]);
  if(edit)return<div className="max-w-3xl"><h2 className="mb-5 text-2xl font-bold">{edit.id?'Edit':'New'} entry</h2><Form fields={S.fields} value={edit.data} onChange={data=>setEdit({...edit,data})}/>
    <div className="mt-6 flex gap-2"><button disabled={busy} onClick={save} className="btn-primary">{busy?'Saving…':'Save'}</button><button onClick={()=>setEdit(null)} className="btn-ghost">Cancel</button></div></div>;
  return<div><div className="mb-5 flex flex-wrap gap-3"><div className="relative min-w-52 flex-1"><Search size={16} className="absolute left-3 top-2.5 text-navy/40"/><input className="input !pl-9" placeholder="Search" value={q} onChange={e=>setQ(e.target.value)}/></div><button className="btn-primary !py-2" onClick={()=>setEdit({data:{}})}><Plus size={16}/>Add {S.title.toLowerCase()}</button></div>
    {!list?<p className="text-navy/50">Loading…</p>:!shown.length?<p className="rounded-2xl border border-dashed border-sky-300 p-10 text-center text-navy/60">{list.length?'Nothing matches your search.':'Nothing here yet. Add your first entry.'}</p>
    :<ul className="divide-y divide-sky-100 rounded-2xl border border-sky-200 bg-white">{shown.map(x=><li key={x.id} className="flex items-center gap-3 p-4"><div className="min-w-0 flex-1"><p className="truncate font-semibold">{S.label(x.data)}</p><p className="truncate text-sm text-navy/50">{S.sub(x.data)}</p></div>
      <button className="p-2 text-navy/60 hover:text-sky-500" aria-label="Edit" onClick={()=>setEdit(x)}><Pencil size={16}/></button><button className="p-2 text-navy/60 hover:text-red-600" aria-label="Delete" onClick={()=>del(x)}><Trash2 size={16}/></button></li>)}</ul>}</div>}

export function MediaPanel({kind}){const[items,setItems]=useState(null);const[cat,setCat]=useState('ALL');const[q,setQ]=useState('');const[staged,setStaged]=useState([]);const[ucat,setUcat]=useState('OTHERS');const[edit,setEdit]=useState(null);const[yt,setYt]=useState({url:'',title:''});const[drag,setDrag]=useState(false);
  const load=()=>api.get('/media?kind='+kind).then(setItems).catch(e=>toast(e.message,1));useEffect(()=>{setItems(null);setStaged([]);load()},[kind]);
  const accept=kind==='image'?/^image\//:/^video\/(mp4|webm|quicktime)$/;
  const stage=files=>{const ok=[...files].filter(f=>accept.test(f.type));if(ok.length<files.length)toast(kind==='image'?'Some files were skipped — images only':'Some files were skipped — use MP4, WebM or MOV',1);
    setStaged(s=>[...s,...ok.map(f=>({f,url:URL.createObjectURL(f),p:0}))])};
  const upload=async()=>{const todo=staged.filter(s=>!s.done);let fail=0;for(const s of todo){setStaged(a=>a.map(x=>x===s?{...x,err:null}:x));
    try{await uploadFile(s.f,{category:ucat,onProgress:p=>setStaged(a=>a.map(x=>x.f===s.f?{...x,p}:x))});setStaged(a=>a.map(x=>x.f===s.f?{...x,p:1,done:1}:x))}catch(e){fail++;setStaged(a=>a.map(x=>x.f===s.f?{...x,err:e.message}:x))}}
    await load();setStaged(a=>a.filter(x=>!x.done));toast(fail?`${fail} upload(s) failed`:'Upload complete',!!fail)};
  const addYt=async()=>{try{await api.post('/media',{source:'youtube',url:yt.url,title:yt.title||'YouTube video',category:ucat});setYt({url:'',title:''});load();toast('Video added')}catch(e){toast(e.message,1)}};
  const patch=async(m,b)=>{try{await api.patch('/media/'+m.id,b);load()}catch(e){toast(e.message,1)}};
  const del=async m=>{if(await ask(`Delete “${m.title||'this item'}”? The file will be removed permanently.`)){try{await api.del('/media/'+m.id);toast('Deleted');load()}catch(e){toast(e.message,1)}}};
  const plain=cat==='ALL'&&!q;const move=async(i,d)=>{const a=[...items],j=i+d;if(j<0||j>=a.length)return;[a[i],a[j]]=[a[j],a[i]];setItems(a);try{await api.post('/media/reorder',{ids:a.map(x=>x.id)})}catch(e){toast(e.message,1);load()}};
  const shown=(items||[]).filter(m=>(cat==='ALL'||m.category===cat)&&(m.title+m.description).toLowerCase().includes(q.toLowerCase()));
  return<div>
    <div onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);stage(e.dataTransfer.files)}} className={`rounded-2xl border-2 border-dashed p-6 text-center transition ${drag?'border-sky-500 bg-sky-100':'border-sky-300 bg-sky-50'}`}>
      <p className="font-semibold">Drag {kind}s here{kind==='image'?' (up to 30 MB each, optimised automatically)':' (MP4, WebM or MOV)'}</p>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-3"><label className="btn-primary cursor-pointer !py-2">Choose files<input type="file" multiple accept={kind==='image'?'image/*':'video/mp4,video/webm,video/quicktime'} className="sr-only" onChange={e=>{stage(e.target.files);e.target.value=''}}/></label>
        <select className="input !w-auto" value={ucat} onChange={e=>setUcat(e.target.value)} aria-label="Category for new uploads">{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
      {kind==='video'&&<div className="mx-auto mt-4 flex max-w-xl flex-wrap gap-2"><input className="input flex-1" placeholder="Or paste a YouTube link" value={yt.url} onChange={e=>setYt({...yt,url:e.target.value})}/><input className="input w-40" placeholder="Title" value={yt.title} onChange={e=>setYt({...yt,title:e.target.value})}/><button className="btn-ghost !py-2" disabled={!yt.url} onClick={addYt}>Add</button></div>}</div>
    {staged.length>0&&<div className="mt-4 rounded-2xl border border-sky-200 p-4"><div className="grid grid-cols-3 gap-3 md:grid-cols-6">{staged.map(s=><div key={s.url} className="relative overflow-hidden rounded-lg bg-sky-100">{kind==='image'?<img src={s.url} alt="" className="aspect-square w-full object-cover"/>:<video src={s.url} className="aspect-square w-full object-cover" muted/>}
      <div className="absolute inset-x-0 bottom-0 h-1 bg-white/60"><div className={`h-full ${s.err?'bg-red-500':'bg-sky-500'}`} style={{width:`${(s.err?1:s.p)*100}%`}}/></div>{s.err&&<p className="absolute inset-0 grid place-items-center bg-red-600/85 p-1 text-center text-[11px] text-white">{s.err}</p>}</div>)}</div>
      <div className="mt-4 flex gap-2"><button className="btn-primary !py-2" onClick={upload}>Upload {staged.length} file{staged.length>1?'s':''}</button><button className="btn-ghost !py-2" onClick={()=>setStaged([])}>Clear</button></div></div>}
    <div className="my-6 flex flex-wrap gap-3"><div className="relative min-w-52 flex-1"><Search size={16} className="absolute left-3 top-2.5 text-navy/40"/><input className="input !pl-9" placeholder="Search titles and descriptions" value={q} onChange={e=>setQ(e.target.value)}/></div>
      <select className="input !w-auto" value={cat} onChange={e=>setCat(e.target.value)} aria-label="Filter by category"><option value="ALL">All categories</option>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
    {!items?<p className="text-navy/50">Loading…</p>:!shown.length?<p className="rounded-2xl border border-dashed border-sky-300 p-10 text-center text-navy/60">{items.length?'Nothing matches your filters.':`No ${kind}s yet. Drop files above to add some.`}</p>
    :<div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">{shown.map((m,i)=><div key={m.id} className="overflow-hidden rounded-xl border border-sky-200 bg-white">
      <div className="relative aspect-[4/3] bg-sky-100">{m.kind==='image'?<img src={m.thumb_url||m.url} alt={m.title} loading="lazy" className="h-full w-full object-cover"/>:<video src={m.url+'#t=0.5'} preload="metadata" className="h-full w-full object-cover" muted/>}
        {m.featured&&<span className="absolute left-2 top-2 rounded-full bg-sky-500 px-2 py-0.5 text-[11px] font-semibold text-white">Featured</span>}</div>
      <div className="p-3"><p className="truncate text-sm font-semibold">{m.title||'Untitled'}</p><p className="text-xs text-navy/50">{m.category}</p>
        <div className="mt-2 flex items-center gap-1"><button aria-label="Set featured" title="Set featured" onClick={()=>patch(m,{featured:!m.featured})} className={`p-1.5 ${m.featured?'text-sky-500':'text-navy/50 hover:text-sky-500'}`}><Star size={16} fill={m.featured?'currentColor':'none'}/></button>
          <button aria-label="Edit" onClick={()=>setEdit(m)} className="p-1.5 text-navy/50 hover:text-sky-500"><Pencil size={16}/></button><button aria-label="Delete" onClick={()=>del(m)} className="p-1.5 text-navy/50 hover:text-red-600"><Trash2 size={16}/></button>
          {plain&&<span className="ml-auto flex"><button aria-label="Move earlier" onClick={()=>move(i,-1)} className="p-1.5 text-navy/50 hover:text-sky-500"><ChevronLeft size={16}/></button><button aria-label="Move later" onClick={()=>move(i,1)} className="p-1.5 text-navy/50 hover:text-sky-500"><ChevronRight size={16}/></button></span>}</div></div></div>)}</div>}
    {edit&&<div className="fixed inset-0 z-[100] grid place-items-center bg-navy/40 p-4"><div className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6"><h3 className="text-xl font-bold">Edit {kind}</h3>
      <Label l="Title"><input className="input" value={edit.title} onChange={e=>setEdit({...edit,title:e.target.value})}/></Label><Label l="Description"><textarea className="input" value={edit.description} onChange={e=>setEdit({...edit,description:e.target.value})}/></Label>
      <Label l="Category"><select className="input" value={edit.category} onChange={e=>setEdit({...edit,category:e.target.value})}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></Label>
      <div className="flex justify-end gap-2"><button className="btn-ghost !py-2" onClick={()=>setEdit(null)}>Cancel</button><button className="btn-primary !py-2" onClick={async()=>{await patch(edit,{title:edit.title,description:edit.description,category:edit.category});setEdit(null);toast('Saved')}}>Save</button></div></div></div>}</div>}

export function AccountPanel(){const[me,setMe]=useState('');const[f,setF]=useState({current:'',next:'',again:''});const[busy,setBusy]=useState(false);
  useEffect(()=>{api.get('/auth/me').then(x=>setMe(x.email)).catch(()=>{})},[]);
  const save=async e=>{e.preventDefault();if(f.next!==f.again)return toast('The new passwords do not match',1);setBusy(true);
    try{await api.post('/auth/password',{current:f.current,next:f.next});toast('Password changed');setF({current:'',next:'',again:''})}catch(x){toast(x.message,1)}setBusy(false)};
  const set=k=>e=>setF({...f,[k]:e.target.value});
  return<form onSubmit={save} className="max-w-md space-y-4"><p className="text-sm text-navy/60">Signed in as <b className="text-navy">{me}</b></p>
    <Label l="Current password"><input className="input" type="password" autoComplete="current-password" required value={f.current} onChange={set('current')}/></Label>
    <Label l="New password (8+ characters)"><input className="input" type="password" autoComplete="new-password" minLength={8} required value={f.next} onChange={set('next')}/></Label>
    <Label l="Repeat new password"><input className="input" type="password" autoComplete="new-password" minLength={8} required value={f.again} onChange={set('again')}/></Label>
    <button className="btn-primary" disabled={busy}>{busy?'Saving…':'Change password'}</button></form>}
