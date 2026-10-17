import {useEffect,useState} from 'react';import {NavLink,Link,useLocation} from 'react-router-dom';import {motion,AnimatePresence} from 'framer-motion';import {Menu,X,Lock,LayoutDashboard} from 'lucide-react';import {useLogo,useLaunched,useAdmin} from '../ctx';
export const LINKS=[['/','Home'],['/my-force-one','Force One'],['/3d','3D View'],['/gallery','Gallery'],['/videos','Videos'],['/journey','Journey'],['/features','Features'],['/memories','Memories'],['/about','About']];
export default function Nav(){const logo=useLogo();const launched=useLaunched();const admin=useAdmin();const[solid,setSolid]=useState(false);const[open,setOpen]=useState(false);const{pathname}=useLocation();
  useEffect(()=>{const f=()=>setSolid(scrollY>40);f();addEventListener('scroll',f,{passive:true});return()=>removeEventListener('scroll',f)},[]);
  useEffect(()=>{setOpen(false);scrollTo(0,0)},[pathname]);
  return<motion.header initial={{y:-90,opacity:0}} animate={launched?{y:0,opacity:1}:{}} transition={{duration:.9,delay:.15,ease:[.16,1,.3,1]}} className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${solid||open?'glass':'bg-transparent'}`}>
    <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:h-20 md:px-8" aria-label="Main">
      <Link to="/" className="flex items-center gap-3" aria-label="Force One home"><motion.img src={logo} alt="" whileHover={{rotateY:360}} transition={{duration:.8}} className="h-9 w-9 rounded-full"/><span className="font-display text-lg font-bold tracking-[.2em]">FORCE ONE</span></Link>
      <ul className="hidden items-center gap-5 xl:gap-7 lg:flex">{LINKS.map(([to,l])=><li key={to}><NavLink to={to} end={to==='/'} className="group relative py-2 text-[11px] font-semibold uppercase tracking-[.18em] text-navy/70 transition hover:text-navy">
        {({isActive})=><>{l}<span className={`absolute inset-x-0 -bottom-0.5 h-0.5 origin-left bg-sky-500 transition-transform duration-300 ${isActive?'scale-x-100':'scale-x-0 group-hover:scale-x-50'}`}/></>}</NavLink></li>)}</ul>
      <Link to={admin?'/admin/dashboard':'/admin'} className="btn-ghost hidden !px-4 !py-2 text-xs lg:inline-flex">{admin?<LayoutDashboard size={14}/>:<Lock size={14}/>}{admin?'Dashboard':'Admin'}</Link>
      <button className="lg:hidden" onClick={()=>setOpen(!open)} aria-label={open?'Close menu':'Open menu'} aria-expanded={open}>{open?<X/>:<Menu/>}</button>
    </nav>
    <AnimatePresence>{open&&<motion.ul initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} className="overflow-hidden px-5 pb-6 lg:hidden">
      {LINKS.map(([to,l])=><li key={to}><NavLink to={to} end={to==='/'} className={({isActive})=>`block border-b border-sky-100 py-3 font-display text-2xl ${isActive?'text-sky-500':''}`}>{l}</NavLink></li>)}<li><Link to={admin?'/admin/dashboard':'/admin'} className="btn-primary mt-4 w-full">{admin?'Open dashboard':'Admin login'}</Link></li></motion.ul>}</AnimatePresence>
  </motion.header>}
