import {Link} from 'react-router-dom';import {motion,useScroll,useTransform} from 'framer-motion';import {useSite,useLaunched,useCopy} from '../ctx';import {isVideoUrl} from '../const';import CarBlueprint from './CarBlueprint';import {AnimatedValue,short} from './count';
const ease=[.16,1,.3,1];
/** The "launch": once the logo intro opens, the title lifts off, the model year counts up, the car draws itself and the key figures spin up. */
export default function Hero(){const{hero={},vehicle:v={}}=useSite();const launched=useLaunched();const t=useCopy();const{scrollY}=useScroll();const y=useTransform(scrollY,[0,700],[0,120]);
  const url=hero.mediaUrl;const ov=(hero.overlay??45)/100;const words=(hero.title||'FORCE ONE').split(' ');let n=0;
  const kicker=[v.launchYear&&`Launched ${v.launchYear}`,v.discontinued&&`Discontinued ${v.discontinued.replace(/^around\s*/i,'~')}`].filter(Boolean).join('  ·  ');
  const stats=[['Launch',v.launchYear],['Power',short(v.power)],['Torque',short(v.torque)],['Seats',short(v.seatingCapacity)]].filter(([,x])=>x);
  const up=(d)=>({initial:{opacity:0,y:24},animate:launched?{opacity:1,y:0}:{},transition:{duration:.9,delay:d,ease}});
  return<section className="blueprint relative min-h-[100svh] overflow-hidden bg-gradient-to-br from-sky-100 via-white to-sky-200">
    {url?<motion.div style={{y}} className="absolute inset-0" initial={{scale:1.15,opacity:0}} animate={launched?{scale:1,opacity:1}:{}} transition={{duration:2.2,ease}}>
      {isVideoUrl(url)?<video src={url} autoPlay muted loop playsInline className="h-full w-full object-cover"/>:<img src={url} alt="Force One" fetchpriority="high" className="h-full w-full object-cover"/>}</motion.div>
    :null}
    {url&&<div className="absolute inset-0" style={{background:`linear-gradient(90deg,rgba(255,255,255,${ov+.45}) 0%,rgba(255,255,255,${ov*.6}) 45%,rgba(255,255,255,0) 75%)`}}/>}
    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white via-white/80 to-transparent"/>
    {v.launchYear&&<div aria-hidden="true" className="pointer-events-none absolute right-[-1vw] top-[11%] select-none font-display text-[27vw] font-extrabold leading-none opacity-70 md:top-[8%]" style={{WebkitTextStroke:'2px rgba(95,168,245,.4)',color:'transparent'}}><AnimatedValue value={v.launchYear} run={launched} dur={2.6}/></div>}
    <motion.span className="absolute top-[40%] h-px w-1/2 bg-gradient-to-r from-transparent via-sky-400 to-transparent" initial={{left:'-50%',opacity:0}} animate={launched?{left:'110%',opacity:[0,1,0]}:{}} transition={{duration:1.6,delay:.1,ease:'easeInOut'}}/>
    <div className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-end px-5 pb-8 pt-20 md:px-8 md:pb-10">
      {!url&&<div className="mb-5 w-[min(1100px,96vw,95vh)] self-end md:mr-[1vw]"><CarBlueprint play={launched} glow/></div>}
      {kicker&&<motion.p {...up(.1)} className="mb-4 flex items-center gap-2 text-xs font-semibold tracking-wide text-ink"><span className="h-2 w-2 animate-pulse rounded-full bg-sky-500"/>{kicker}</motion.p>}
      <h1 className="flex max-w-5xl flex-wrap gap-x-[.28em] text-6xl font-extrabold leading-[.95] sm:text-7xl md:text-9xl" aria-label={hero.title||'FORCE ONE'}>{words.map((w,wi)=><span key={wi} className="inline-flex overflow-hidden pb-[.08em]" aria-hidden="true">{w.split('').map(c=>{const i=n++;
        return<motion.span key={i} className="inline-block" initial={{y:'115%',rotate:6}} animate={launched?{y:0,rotate:0}:{}} transition={{duration:1,delay:.2+i*.045,ease}}>{c}</motion.span>})}</span>)}</h1>
      <motion.p {...up(.8)} className="mt-5 text-lg text-navy/70 md:text-2xl">{hero.subtitle||'Built for the journey.'}</motion.p>
      <motion.div {...up(1)} className="mt-7 flex flex-wrap gap-3"><Link to="/my-force-one" className="btn-primary">Explore the Force One</Link><Link to="/gallery" className="btn-ghost">View gallery</Link><Link to="/journey" className="btn-ghost">My journey</Link></motion.div>
      {stats.length>0&&<div className="relative mt-10 grid grid-cols-2 gap-x-6 gap-y-4 pt-5 md:grid-cols-4"><motion.span className="absolute inset-x-0 top-0 h-px origin-left bg-sky-300" initial={{scaleX:0}} animate={launched?{scaleX:1}:{}} transition={{duration:1.4,delay:1.1,ease}}/>
        {stats.map(([l,x],i)=><motion.div key={l} {...up(1.2+i*.1)}><p className="text-[11px] font-semibold tracking-wide text-sky-500">{l}</p><p className="font-display text-2xl font-bold md:text-3xl"><AnimatedValue value={x} run={launched} dur={2}/></p></motion.div>)}</div>}
    </div></section>}
