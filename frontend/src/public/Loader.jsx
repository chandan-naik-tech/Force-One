import {useEffect} from 'react';import {motion,animate,useMotionValue,useTransform,useReducedMotion} from 'framer-motion';import {useLogo} from '../ctx';
const ease=[.16,1,.3,1];const DUR=2.4;
const TICKS=Array.from({length:60},(_,i)=>{const a=i*6*Math.PI/180,major=i%5===0,r1=major?134:137,r2=major?149:144;
  return{i,major,x1:150+r1*Math.sin(a),y1:150-r1*Math.cos(a),x2:150+r2*Math.sin(a),y2:150-r2*Math.cos(a)}});
const STREAKS=[10,24,38,62,76,90];
/** Intro: gauge ring draws → badge flips in out of blur → chrome shine → speed streaks → the screen iris-opens onto the hero. */
export default function Loader({onReveal,onDone}){const logo=useLogo();const reduce=useReducedMotion();const r=useMotionValue(0);
  const mask=useTransform(r,v=>`radial-gradient(circle at 50% 46%, transparent ${v}%, #000 ${v+.4}%)`);
  useEffect(()=>{if(reduce){onReveal();const t=setTimeout(onDone,500);return()=>clearTimeout(t)}
    const t=setTimeout(()=>{onReveal();animate(r,150,{duration:1,ease:[.7,0,.3,1],onComplete:onDone})},(DUR+.45)*1000);return()=>clearTimeout(t)},[]);
  return<motion.div style={{maskImage:mask,WebkitMaskImage:mask}} className="blueprint fixed inset-0 z-[100] overflow-hidden bg-gradient-to-b from-white via-sky-50 to-sky-200" role="status" aria-label="Loading">
    {STREAKS.map((y,i)=><motion.span key={y} className="absolute left-0 h-px w-[45vw] bg-gradient-to-r from-transparent via-sky-400 to-transparent" style={{top:`${y}%`}} initial={{x:'-50vw',opacity:.8}} animate={{x:'110vw',opacity:0}} transition={{duration:1,delay:.5+i*.16,ease:[.6,0,.2,1]}}/>)}
    <div className="grid h-full place-items-center"><div className="flex flex-col items-center">
      <div className="relative h-[250px] w-[250px] md:h-[320px] md:w-[320px]" style={{perspective:900}}>
        <motion.div className="absolute inset-[18%] rounded-full bg-sky-400/40 blur-3xl" initial={{scale:.4,opacity:0}} animate={{scale:[.4,1.2,1],opacity:[0,.9,.55]}} transition={{duration:1.8,delay:.4}}/>
        <svg viewBox="0 0 300 300" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
          <circle cx="150" cy="150" r="124" fill="none" className="stroke-sky-200" strokeWidth="1"/>
          <motion.circle cx="150" cy="150" r="124" fill="none" className="stroke-sky-500" strokeWidth="2.5" strokeLinecap="round" transform="rotate(-90 150 150)" initial={{pathLength:0}} animate={{pathLength:1}} transition={{duration:DUR,delay:.2,ease:'easeInOut'}}/>
          <motion.g style={{transformOrigin:'150px 150px'}} initial={{rotate:0}} animate={{rotate:360}} transition={{duration:DUR,delay:.2,ease:'easeInOut'}}><circle cx="150" cy="26" r="4" className="fill-sky-500" style={{filter:'drop-shadow(0 0 6px #5FA8F5)'}}/></motion.g>
          <motion.g style={{transformOrigin:'150px 150px'}} animate={{rotate:-360}} transition={{duration:18,repeat:Infinity,ease:'linear'}}><circle cx="150" cy="150" r="110" fill="none" className="stroke-sky-300" strokeWidth="1" strokeDasharray="2 9" opacity=".8"/></motion.g>
          {TICKS.map(t=><motion.line key={t.i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} className="stroke-sky-400" strokeWidth={t.major?1.6:.8} initial={{opacity:0}} animate={{opacity:t.major?1:.5}} transition={{delay:.25+t.i*.022,duration:.3}}/>)}
        </svg>
        <motion.div className="absolute inset-[22%] overflow-hidden rounded-full shadow-[0_20px_50px_rgba(10,35,66,.3)]" style={{transformStyle:'preserve-3d'}} initial={{opacity:0,scale:.4,rotateY:-220,filter:'blur(16px)'}} animate={{opacity:1,scale:1,rotateY:0,filter:'blur(0px)'}} transition={{duration:1.5,delay:.35,ease}}>
          <img src={logo} alt="" className="h-full w-full object-cover"/>
          <motion.span className="absolute -inset-y-4 w-1/3 -skew-x-[22deg] bg-gradient-to-r from-transparent via-white/90 to-transparent" initial={{left:'-45%'}} animate={{left:'145%'}} transition={{duration:.9,delay:1.65,ease:'easeInOut'}}/>
        </motion.div>
      </div>
      <h2 className="mt-4 flex overflow-hidden font-display text-2xl font-bold tracking-[.3em] md:text-3xl" aria-label="Force One">{'FORCE ONE'.split('').map((c,i)=>
        <motion.span key={i} className="inline-block" initial={{y:'110%'}} animate={{y:0}} transition={{delay:1.2+i*.05,duration:.7,ease}}>{c===' '?'\u00A0':c}</motion.span>)}</h2>
      <motion.p className="mt-2 text-sm text-navy/60" initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.9,duration:.8}}>Built for the journey.</motion.p>
    </div></div></motion.div>}
