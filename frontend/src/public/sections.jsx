import {useMemo,useState} from 'react';import {Link} from 'react-router-dom';import {motion,AnimatePresence} from 'framer-motion';import {Pencil,Check,Play,X,MapPin,Route,Gauge,Shield,Sofa,Compass,Wrench,Luggage,Palette,Fuel,Users,Zap} from 'lucide-react';
import {useSite,useData,useAdmin} from '../ctx';import {CATEGORIES,FEATURE_CATS,ytId,fmtDate} from '../const';import {useLightbox} from './Lightbox';import {AnimatedValue} from './count';import CarBlueprint from './CarBlueprint';
export const ICONS={Gauge,Shield,Sofa,Compass,Wrench,Luggage,Palette,Fuel,Users,Zap};
const ease=[.16,1,.3,1];
export const Empty=({text})=><div className="rounded-2xl border border-dashed border-sky-300 bg-sky-50/60 p-10 text-center text-sm text-navy/60">{text}</div>;
export const Skeleton=({n=6})=><div className="grid grid-cols-2 gap-3 md:grid-cols-3">{Array.from({length:n},(_,i)=><div key={i} className="aspect-[4/3] animate-pulse rounded-xl bg-sky-100"/>)}</div>;
export const Section=({title,sub,children,to,cta,edit})=>{const admin=useAdmin();return<section className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28"><div className="mb-10 flex items-end justify-between gap-6"><div><h2 className="text-4xl font-extrabold md:text-6xl">{title}</h2>{admin&&edit&&<Link to={`/admin/dashboard/${edit}`} className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-navy px-3 py-1 text-xs font-semibold text-white hover:bg-sky-500"><Pencil size={12}/>Edit this section</Link>}{sub&&<p className="mt-3 max-w-xl text-navy/60">{sub}</p>}</div>{to&&<Link to={to} className="btn-ghost hidden shrink-0 md:inline-flex">{cta}</Link>}</div>{children}</section>};
export const PageHead=({title,sub})=><div className="blueprint relative overflow-hidden bg-gradient-to-b from-sky-100 to-white pb-6 pt-36 md:pt-44"><div className="mx-auto max-w-7xl px-5 md:px-8"><motion.h1 initial={{clipPath:'inset(0 0 100% 0)',y:30}} animate={{clipPath:'inset(0 0 0% 0)',y:0}} transition={{duration:.9,ease}} className="text-5xl font-extrabold md:text-8xl">{title}</motion.h1>{sub&&<p className="mt-4 max-w-xl text-lg text-navy/60">{sub}</p>}</div></div>;

const SPECS=[['engine','Engine'],['transmission','Transmission'],['power','Power'],['torque','Torque'],['fuelType','Fuel'],['mileage','Mileage'],['driveType','Drive'],['seatingCapacity','Seating']];
const DETAILS=[['model','Model'],['variant','Variant'],['year','Year'],['colour','Colour'],['chassis','Chassis'],['suspension','Suspension'],['tyres','Wheels & tyres'],['registration','Registration'],['purchaseDate','Purchased'],['status','Status']];
export function Specs(){const{vehicle={},site={}}=useSite();const s=SPECS.filter(([k])=>vehicle[k]);
  if(!s.length)return<Empty text="Vehicle details haven't been added yet."/>;
  return<motion.div initial="h" whileInView="s" viewport={{once:true,margin:'-80px'}} transition={{staggerChildren:.08}} className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
    {s.map(([k,l])=><motion.div key={k} variants={{h:{opacity:0,y:24},s:{opacity:1,y:0}}} transition={{duration:.7,ease}} className="glass relative rounded-2xl p-5 md:p-8">
      <span className="absolute left-5 top-0 h-0.5 w-10 bg-sky-500 md:left-8"/><p className="text-xs font-semibold text-sky-500">{l}</p><p className={`mt-3 font-display font-bold leading-tight ${String(vehicle[k]).length>22?"text-base md:text-lg":"text-xl md:text-3xl"}`}><AnimatedValue value={vehicle[k]}/></p></motion.div>)}</motion.div>}
export function Details(){const{vehicle={},site={}}=useSite();const d=DETAILS.filter(([k])=>vehicle[k]&&(k!=='registration'||site.showRegistration));if(!d.length)return null;
  return<dl className="mt-10 grid gap-x-10 md:grid-cols-2">{d.map(([k,l])=><div key={k} className="flex justify-between border-b border-sky-200 py-4"><dt className="text-navy/60">{l}</dt><dd className="font-semibold">{k==='purchaseDate'?fmtDate(vehicle[k]):vehicle[k]}</dd></div>)}</dl>}

export function Gallery({limit,filter=true}){const{data,error,loading}=useData('/media?kind=image');const[cat,setCat]=useState('ALL');
  const list=useMemo(()=>(data||[]).filter(m=>cat==='ALL'||m.category===cat).slice(0,limit||999),[data,cat,limit]);const[,setI,box]=useLightbox(list);
  if(loading)return<Skeleton/>;if(error)return<Empty text="Photos couldn't be loaded. Refresh to try again."/>;if(!data.length)return<Empty text="No photos yet."/>;
  const cats=['ALL',...CATEGORIES.filter(c=>data.some(m=>m.category===c))];
  return<>{filter&&cats.length>2&&<div className="mb-8 flex flex-wrap gap-2">{cats.map(c=><button key={c} onClick={()=>setCat(c)} className={`rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide transition ${cat===c?'bg-navy text-white':'bg-sky-100 text-navy/70 hover:bg-sky-200'}`}>{c==='ALL'?'All':c[0]+c.slice(1).toLowerCase()}</button>)}</div>}
    <div className="columns-2 gap-3 md:columns-3 md:gap-5">{list.map((m,i)=><motion.button layout key={m.id} onClick={()=>setI(i)} initial={{clipPath:'inset(0 0 100% 0)'}} whileInView={{clipPath:'inset(0 0 0% 0)'}} viewport={{once:true,margin:'-40px'}} transition={{duration:.8,ease}}
      className="group relative mb-3 block w-full overflow-hidden rounded-xl bg-sky-100 md:mb-5" aria-label={`Open ${m.title||'photo'}`}>
      <img src={m.thumb_url||m.url} alt={m.title||`Force One ${m.category.toLowerCase()}`} loading="lazy" width={m.width||undefined} height={m.height||undefined} className="w-full object-cover transition duration-700 group-hover:scale-105"/>
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/70 to-transparent p-3 text-left text-sm font-semibold text-white opacity-0 transition group-hover:opacity-100">{m.title}</span></motion.button>)}</div>{box}</>}

export function FeaturedImage(){const{data}=useData('/media?kind=image');const m=data?.[0];if(!m)return null;
  return<section className="mx-auto max-w-7xl px-5 md:px-8"><motion.figure initial={{clipPath:'inset(8% 8% 8% 8% round 24px)'}} whileInView={{clipPath:'inset(0% 0% 0% 0% round 24px)'}} viewport={{once:true,margin:'-100px'}} transition={{duration:1.2,ease}} className="relative overflow-hidden bg-sky-100">
    <img src={m.url} alt={m.title||'Featured photo of Force One'} loading="lazy" className="aspect-[4/3] w-full object-cover md:aspect-[21/9]"/>{m.title&&<figcaption className="absolute bottom-4 left-4 rounded-full bg-white/80 px-4 py-1.5 text-sm font-semibold backdrop-blur md:bottom-6 md:left-6">{m.title}</figcaption>}</motion.figure></section>}

function VideoModal({v,onClose}){const id=v.source==='youtube'&&ytId(v.url);
  return<motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[90] grid place-items-center bg-navy/90 p-4" onClick={onClose} role="dialog" aria-modal="true">
    <motion.div initial={{scale:.94,y:20}} animate={{scale:1,y:0}} exit={{scale:.96,opacity:0}} transition={{duration:.4,ease}} className="w-full max-w-5xl" onClick={e=>e.stopPropagation()}>
      <div className="mb-3 flex items-center justify-between text-white"><p className="font-display text-xl font-bold">{v.title}</p><button onClick={onClose} aria-label="Close video" className="rounded-full bg-white/15 p-2 hover:bg-white/25"><X size={18}/></button></div>
      <div className="aspect-video overflow-hidden rounded-xl bg-black">{id?<iframe className="h-full w-full" src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`} title={v.title} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen/>:<video className="h-full w-full" src={v.url} controls autoPlay playsInline/>}</div>
      {v.description&&<p className="mt-3 text-sm text-white/70">{v.description}</p>}</motion.div></motion.div>}
export function Videos({limit}){const{data,error,loading}=useData('/media?kind=video');const[open,setOpen]=useState(null);
  if(loading)return<Skeleton n={3}/>;if(error)return<Empty text="Videos couldn't be loaded."/>;if(!data.length)return<Empty text="No videos yet."/>;
  const list=data.slice(0,limit||999);
  return<><div className={`grid gap-5 ${limit===1?'':'md:grid-cols-2 lg:grid-cols-3'}`}>{list.map(v=>{const id=v.source==='youtube'&&ytId(v.url);
    return<button key={v.id} onClick={()=>setOpen(v)} className="group text-left" aria-label={`Play ${v.title}`}>
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-navy">{id?<img src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105"/>:<video src={v.url+'#t=0.5'} preload="metadata" muted playsInline className="h-full w-full object-cover transition duration-700 group-hover:scale-105"/>}
        <span className="absolute inset-0 grid place-items-center bg-navy/20"><span className="glass grid h-16 w-16 place-items-center rounded-full transition group-hover:scale-110"><Play fill="currentColor" size={22}/></span></span>
        {v.featured&&<span className="absolute left-3 top-3 rounded-full bg-sky-500 px-3 py-1 text-xs font-semibold text-white">Featured</span>}</div>
      <p className="mt-3 font-display text-lg font-bold">{v.title}</p><p className="text-sm text-navy/60">{v.category[0]+v.category.slice(1).toLowerCase()}</p></button>})}</div>
    <AnimatePresence>{open&&<VideoModal v={open} onClose={()=>setOpen(null)}/>}</AnimatePresence></>}

export function Journey({limit}){const{data,loading}=useData('/items/journey');const all=useMemo(()=>(data||[]).slice(0,limit||999),[data,limit]);
  const photos=useMemo(()=>all.flatMap(e=>(e.data.photos||[]).map(url=>({url,title:e.data.title}))),[all]);const[,setI,box]=useLightbox(photos);
  if(loading)return<Skeleton n={3}/>;if(!all.length)return<Empty text="The journey hasn't been logged yet."/>;
  return<div className="relative"><motion.span initial={{scaleY:0}} whileInView={{scaleY:1}} viewport={{once:true}} transition={{duration:1.6,ease}} className="absolute bottom-0 left-3 top-0 w-px origin-top bg-sky-300 md:left-1/2"/>
    {all.map((e,n)=>{const d=e.data;return<motion.article key={e.id} initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:'-80px'}} transition={{duration:.8,ease}} className={`relative mb-14 pl-10 md:w-1/2 md:pl-0 ${n%2?'md:ml-auto md:pl-12':'md:pr-12'}`}>
      <span className={`absolute top-2 left-[7px] h-3 w-3 rounded-full border-2 border-sky-500 bg-white md:left-auto ${n%2?'md:-left-1.5':'md:-right-1.5'}`}/>
      <p className="text-sm font-semibold text-sky-500">{fmtDate(d.date)}</p><h3 className="mt-1 text-2xl font-bold md:text-3xl">{d.title}</h3>
      <p className="mt-2 flex flex-wrap gap-x-4 text-sm text-navy/60">{d.location&&<span className="inline-flex items-center gap-1"><MapPin size={14}/>{d.location}</span>}{d.distance&&<span className="inline-flex items-center gap-1"><Route size={14}/>{d.distance} km</span>}</p>
      {d.description&&<p className="mt-3 text-navy/80">{d.description}</p>}{d.notes&&<p className="mt-2 text-sm italic text-navy/60">{d.notes}</p>}
      {d.photos?.length>0&&<div className="mt-4 grid grid-cols-3 gap-2">{d.photos.slice(0,6).map(u=><button key={u} onClick={()=>setI(photos.findIndex(p=>p.url===u))} aria-label="View photo"><img src={u} alt="" loading="lazy" className="aspect-square rounded-lg object-cover"/></button>)}</div>}
      {d.videoUrl&&<a href={d.videoUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-sky-500"><Play size={14}/>Watch video</a>}</motion.article>})}{box}</div>}

export function Memories({limit}){const{data,loading}=useData('/items/memory');const[open,setOpen]=useState(null);const list=(data||[]).slice(0,limit||999);
  if(loading)return<Skeleton n={3}/>;if(!list.length)return<Empty text="No memories saved yet."/>;
  return<><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{list.map(m=>{const d=m.data;return<button key={m.id} onClick={()=>setOpen(m)} className="group overflow-hidden rounded-3xl bg-sky-50 text-left transition hover:shadow-[0_20px_50px_rgba(47,130,224,.18)]">
    <div className="aspect-[4/3] overflow-hidden bg-sky-100">{d.photos?.[0]&&<img src={d.photos[0]} alt={d.title} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105"/>}</div>
    <div className="p-6"><p className="text-xs font-semibold text-sky-500">{[fmtDate(d.date),d.location].filter(Boolean).join(' · ')}</p><h3 className="mt-2 text-2xl font-bold">{d.title}</h3><p className="mt-2 line-clamp-3 text-sm text-navy/70">{d.story}</p></div></button>})}</div>
    <AnimatePresence>{open&&<motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[90] overflow-y-auto bg-white/95 p-4 backdrop-blur-xl" onClick={()=>setOpen(null)}>
      <motion.div initial={{y:40}} animate={{y:0}} className="mx-auto my-8 max-w-2xl" onClick={e=>e.stopPropagation()}><button onClick={()=>setOpen(null)} className="btn-ghost mb-4 !p-2.5" aria-label="Close"><X size={18}/></button>
        <p className="text-sm font-semibold text-sky-500">{[fmtDate(open.data.date),open.data.location].filter(Boolean).join(' · ')}</p><h3 className="mt-2 text-4xl font-extrabold">{open.data.title}</h3>
        <p className="mt-5 whitespace-pre-line leading-relaxed text-navy/80">{open.data.story}</p><div className="mt-6 grid gap-3">{(open.data.photos||[]).map(u=><img key={u} src={u} alt="" loading="lazy" className="w-full rounded-xl"/>)}</div>
        {open.data.videoUrl&&<a href={open.data.videoUrl} target="_blank" rel="noreferrer" className="btn-primary mt-6">Watch video</a>}</motion.div></motion.div>}</AnimatePresence></>}

export function Features(){const{data,loading}=useData('/items/feature');const[cat,setCat]=useState('ALL');
  if(loading)return<Skeleton n={3}/>;if(!data.length)return<Empty text="Features haven't been added yet."/>;const cats=['ALL',...FEATURE_CATS.filter(c=>data.some(f=>f.data.category===c))];
  return<><div className="mb-8 flex flex-wrap gap-2">{cats.map(c=><button key={c} onClick={()=>setCat(c)} className={`rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide ${cat===c?'bg-navy text-white':'bg-sky-100 text-navy/70 hover:bg-sky-200'}`}>{c==='ALL'?'All':c[0]+c.slice(1).toLowerCase()}</button>)}</div>
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{data.filter(f=>cat==='ALL'||f.data.category===cat).map(f=>{const I=ICONS[f.data.icon]||Gauge;return<div key={f.id} className="glass overflow-hidden rounded-2xl">
      {f.data.image&&<img src={f.data.image} alt={f.data.title} loading="lazy" className="aspect-video w-full object-cover"/>}<div className="p-6"><I className="text-sky-500" size={26}/><h3 className="mt-3 text-xl font-bold">{f.data.title}</h3><p className="mt-2 text-sm text-navy/70">{f.data.description}</p></div></div>})}</div></>}

export function ServiceLog(){const{data}=useData('/items/service');if(!data?.length)return null;const odo=data.map(s=>+s.data.odometer).filter(Boolean);const last=data[0].data;
  const stat=[['Services',data.length],['Distance covered',odo.length?`${Math.max(...odo).toLocaleString('en-IN')} km`:'—'],['Last service',fmtDate(last.date)||'—'],['Next service',[last.nextDueOdometer&&`${(+last.nextDueOdometer).toLocaleString('en-IN')} km`,fmtDate(last.nextDueDate)].filter(Boolean).join(' or ')||'—']];
  return<Section title="Service history" sub="Every visit to the workshop, on record."><div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">{stat.map(([l,v])=><div key={l} className="rounded-2xl bg-sky-50 p-5"><p className="text-xs font-semibold text-sky-500">{l}</p><p className="mt-2 font-display text-xl font-bold">{v}</p></div>)}</div>
    <div className="overflow-x-auto rounded-2xl border border-sky-200"><table className="w-full min-w-[640px] text-left text-sm"><thead className="bg-sky-50 text-xs text-navy/60"><tr>{['Date','Odometer','Service','Workshop','Work done','Cost'].map(h=><th key={h} className="p-3 font-semibold">{h}</th>)}</tr></thead>
      <tbody>{data.map(s=>{const d=s.data;return<tr key={s.id} className="border-t border-sky-100 align-top"><td className="p-3">{fmtDate(d.date)}</td><td className="p-3">{d.odometer&&`${(+d.odometer).toLocaleString('en-IN')} km`}</td><td className="p-3 font-semibold">{d.serviceType}</td><td className="p-3">{d.workshop}</td><td className="p-3">{d.workDone}{d.partsChanged&&<span className="block text-navy/50">Parts: {d.partsChanged}</span>}</td><td className="p-3">{d.cost&&`₹${(+d.cost).toLocaleString('en-IN')}`}</td></tr>})}</tbody></table></div></Section>}

const num=x=>{const m=String(x||'').replace(/,/g,'').match(/[\d.]+/);return m?parseFloat(m[0]):0};
function Bar({label,value,pct}){if(!value)return null;return<div className="relative mt-5"><div className="flex justify-between text-xs font-semibold"><span className="text-navy/60">{label}</span><AnimatedValue value={value}/></div>
  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-sky-100"><motion.div className="h-full rounded-full bg-gradient-to-r from-sky-300 to-sky-500" initial={{width:0}} whileInView={{width:`${Math.max(pct,.08)*100}%`}} viewport={{once:true}} transition={{duration:1.4,delay:.3,ease}}/></div></div>}
export function Variants(){const{data,loading}=useData('/items/variant');if(loading)return<Skeleton n={3}/>;if(!data.length)return<Empty text="No variants added yet."/>;
  const mp=Math.max(...data.map(v=>num(v.data.power)),1),mt=Math.max(...data.map(v=>num(v.data.torque)),1);
  return<div className="grid gap-5 lg:grid-cols-3">{data.map((v,i)=>{const d=v.data;const hl=(d.highlights||'').split('\n').map(x=>x.trim()).filter(Boolean);
    return<motion.article key={v.id} initial={{opacity:0,y:40}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:'-60px'}} transition={{duration:.8,delay:i*.12,ease}} whileHover={{y:-6}} className="glass relative overflow-hidden rounded-3xl p-7">
      <span aria-hidden="true" className="pointer-events-none absolute -right-2 -top-6 select-none font-display text-[9rem] font-extrabold leading-none" style={{WebkitTextStroke:'1.5px rgba(95,168,245,.5)',color:'transparent'}}>{d.name}</span>
      <p className="relative text-xs font-semibold text-sky-500">{d.tier}</p><h3 className="relative mt-2 text-4xl font-extrabold">{d.name}</h3>{d.tagline&&<p className="relative mt-2 text-navy/70">{d.tagline}</p>}
      <Bar label="Power" value={d.power} pct={num(d.power)/mp}/><Bar label="Torque" value={d.torque} pct={num(d.torque)/mt}/>
      <dl className="relative mt-6 space-y-2 border-t border-sky-200 pt-4 text-sm">{[['Engine',d.engine],['Drivetrain',d.drivetrain],['Wheels',d.wheels]].filter(([,x])=>x).map(([l,x])=><div key={l}><dt className="text-xs text-navy/50">{l}</dt><dd className="font-semibold">{x}</dd></div>)}</dl>
      {d.description&&<p className="relative mt-4 text-sm text-navy/70">{d.description}</p>}
      {hl.length>0&&<ul className="relative mt-4 space-y-2">{hl.map(h=><li key={h} className="flex gap-2 text-sm"><Check size={16} className="mt-0.5 shrink-0 text-sky-500"/>{h}</li>)}</ul>}</motion.article>})}</div>}
export function LaunchFacts(){const{vehicle:v={}}=useSite();if(!(v.launchYear||v.discontinued||v.priceRange||v.driveType))return null;
  const facts=[['Last recorded price',v.priceRange],['Drive type',v.driveType],['Chassis',v.chassis],['Seating',v.seatingCapacity]].filter(([,x])=>x);
  return<div><div className="grid items-center gap-6 md:grid-cols-[auto_1fr_auto] md:gap-10">
    {v.launchYear&&<div><p className="text-xs font-semibold text-sky-500">Launched</p><p className="font-display text-7xl font-extrabold leading-none md:text-9xl"><AnimatedValue value={v.launchYear} dur={2.4}/></p></div>}
    <div className="relative hidden h-px bg-sky-100 md:block"><motion.span className="absolute inset-0 origin-left bg-gradient-to-r from-sky-500 to-sky-200" initial={{scaleX:0}} whileInView={{scaleX:1}} viewport={{once:true}} transition={{duration:1.8,ease}}/>
      <motion.span className="absolute -top-1 h-2.5 w-2.5 rounded-full bg-sky-500 shadow-[0_0_12px_#5FA8F5]" initial={{left:0}} whileInView={{left:'100%'}} viewport={{once:true}} transition={{duration:1.8,ease}}/></div>
    {v.discontinued&&<div className="md:text-right"><p className="text-xs font-semibold text-sky-500">Discontinued</p><p className="font-display text-3xl font-extrabold md:text-5xl">{v.discontinued}</p></div>}</div>
    {facts.length>0&&<div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4">{facts.map(([l,x],i)=><motion.div key={l} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*.08,duration:.7,ease}} className="rounded-2xl bg-sky-50 p-5"><p className="text-xs font-semibold text-sky-500">{l}</p><p className="mt-2 font-display text-lg font-bold leading-snug">{x}</p></motion.div>)}</div>}</div>}
export function Dimensions(){const{vehicle:v={}}=useSite();const d={length:v.length,width:v.width,height:v.height,wheelbase:v.wheelbase,clearance:v.groundClearance};
  return<><div className="blueprint rounded-3xl border border-sky-200 bg-sky-50/60 p-3 md:p-10"><CarBlueprint dims={d}/></div>
    <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-5">{[['Length',d.length],['Width',d.width],['Height',d.height],['Wheelbase',d.wheelbase],['Ground clearance',d.clearance]].filter(([,x])=>x).map(([l,x])=><div key={l} className="rounded-2xl bg-white p-4 ring-1 ring-sky-200"><p className="text-xs font-semibold text-sky-500">{l}</p><p className="mt-1 font-display text-xl font-bold"><AnimatedValue value={x}/></p></div>)}</div>
    <p className="mt-3 text-xs text-navy/50">The drawing is an illustration, not to scale; the figures are the published dimensions.</p></>}
