import {useEffect,useRef,useState} from 'react';import {useLocation} from 'react-router-dom';import {motion,useReducedMotion} from 'framer-motion';import {useLogo} from '../ctx';
/** Page-to-page transition: the badge flashes on a light-blue curtain that lifts away to reveal the new page. */
export default function RouteCurtain(){const{pathname}=useLocation();const first=useRef(true);const[k,setK]=useState(0);const logo=useLogo();const reduce=useReducedMotion();
  useEffect(()=>{if(first.current){first.current=false;return}setK(n=>n+1)},[pathname]);
  if(!k||reduce)return null;
  return<motion.div key={k} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[80] grid place-items-center bg-gradient-to-b from-white to-sky-200" initial={{clipPath:'inset(0 0 0% 0)'}} animate={{clipPath:'inset(0 0 100% 0)'}} transition={{duration:.75,delay:.4,ease:[.76,0,.24,1]}}>
    <motion.img src={logo} alt="" className="h-20 w-20 rounded-full shadow-xl" initial={{scale:.5,rotateY:-120,opacity:0}} animate={{scale:[.5,1,1.1],rotateY:0,opacity:[0,1,1]}} transition={{duration:.6,ease:[.16,1,.3,1]}}/></motion.div>}
