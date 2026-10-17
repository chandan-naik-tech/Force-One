import {Link,useNavigate} from 'react-router-dom';import {motion} from 'framer-motion';import {Image,Film,Pencil,LogOut} from 'lucide-react';import {useAdmin} from '../ctx';import {api} from '../api';
/** Floating shortcut bar shown only to a signed-in admin. */
export default function AdminBar(){const admin=useAdmin();const nav=useNavigate();if(!admin)return null;
  const A=({to,icon:I,children})=><Link to={to} className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-white/90 hover:bg-white/15"><I size={14}/>{children}</Link>;
  return<motion.div initial={{y:60,opacity:0}} animate={{y:0,opacity:1}} transition={{delay:.8,duration:.7}} className="fixed bottom-4 left-1/2 z-[70] flex max-w-[95vw] -translate-x-1/2 items-center gap-1 overflow-x-auto rounded-full bg-navy/95 p-1.5 shadow-2xl backdrop-blur">
    <span className="flex items-center gap-1.5 px-3 text-xs font-bold text-sky-300"><span className="h-2 w-2 animate-pulse rounded-full bg-sky-400"/>Admin</span>
    <A to="/admin/dashboard" icon={Pencil}>Dashboard</A><A to="/admin/dashboard/gallery" icon={Image}>Add photos</A><A to="/admin/dashboard/videos" icon={Film}>Add videos</A>
    <button onClick={async()=>{await api.post('/auth/logout');location.href='/'}} className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-white/70 hover:bg-white/15"><LogOut size={14}/>Sign out</button></motion.div>}
