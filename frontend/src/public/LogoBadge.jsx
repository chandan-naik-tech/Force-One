import {motion,useMotionValue,useSpring,useTransform,useMotionTemplate} from 'framer-motion';import {useLogo} from '../ctx';
/** Interactive 3D badge: tilts toward the pointer with a moving chrome highlight, floats gently when idle. */
export default function LogoBadge({size=220}){const logo=useLogo();const mx=useMotionValue(0),my=useMotionValue(0);
  const spring={stiffness:140,damping:14};const rx=useSpring(useTransform(my,[-.5,.5],[18,-18]),spring),ry=useSpring(useTransform(mx,[-.5,.5],[-18,18]),spring);
  const px=useTransform(mx,[-.5,.5],[10,90]),py=useTransform(my,[-.5,.5],[10,90]);const light=useMotionTemplate`radial-gradient(circle at ${px}% ${py}%, rgba(255,255,255,.7), transparent 55%)`;
  const move=e=>{const b=e.currentTarget.getBoundingClientRect();mx.set((e.clientX-b.left)/b.width-.5);my.set((e.clientY-b.top)/b.height-.5)};
  const leave=()=>{mx.set(0);my.set(0)};
  return<motion.div style={{width:size,height:size,perspective:800}} onPointerMove={move} onPointerLeave={leave} animate={{y:[0,-8,0]}} transition={{duration:5,repeat:Infinity,ease:'easeInOut'}} className="relative mx-auto touch-none">
    <div className="absolute inset-[10%] rounded-full bg-sky-400/40 blur-3xl"/>
    <motion.div style={{rotateX:rx,rotateY:ry,transformStyle:'preserve-3d'}} className="relative h-full w-full overflow-hidden rounded-full shadow-[0_30px_60px_rgba(10,35,66,.28)]">
      <img src={logo} alt="Force One badge" className="h-full w-full object-cover" draggable="false"/><motion.span style={{background:light}} className="absolute inset-0 mix-blend-soft-light"/></motion.div></motion.div>}
