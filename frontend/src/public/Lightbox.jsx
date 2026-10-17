import {useEffect,useState} from 'react';import {motion,AnimatePresence} from 'framer-motion';import {X,ChevronLeft,ChevronRight,ZoomIn} from 'lucide-react';
export default function Lightbox({items,index,onClose,onIndex}){const[zoom,setZoom]=useState(false);const it=items[index];
  const go=d=>{setZoom(false);onIndex((index+d+items.length)%items.length)};
  useEffect(()=>{const k=e=>{if(e.key==='Escape')onClose();if(e.key==='ArrowRight')go(1);if(e.key==='ArrowLeft')go(-1)};addEventListener('keydown',k);document.body.style.overflow='hidden';
    return()=>{removeEventListener('keydown',k);document.body.style.overflow=''}});
  return<motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[90] flex flex-col bg-white/95 backdrop-blur-xl" role="dialog" aria-modal="true" aria-label="Image viewer">
    <div className="flex items-center justify-between p-4"><p className="text-sm font-semibold">{index+1} / {items.length}</p>
      <div className="flex gap-2"><button className="btn-ghost !p-2.5" onClick={()=>setZoom(!zoom)} aria-label="Toggle zoom"><ZoomIn size={18}/></button><button className="btn-ghost !p-2.5" onClick={onClose} aria-label="Close"><X size={18}/></button></div></div>
    <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-auto px-2 md:px-16">
      <motion.img key={it.url} src={it.url} alt={it.title||''} drag={zoom?false:'x'} dragConstraints={{left:0,right:0}} onDragEnd={(e,i)=>Math.abs(i.offset.x)>80&&go(i.offset.x<0?1:-1)}
        initial={{opacity:0,scale:.97}} animate={{opacity:1,scale:zoom?1.8:1}} transition={{duration:.35}} onClick={()=>setZoom(!zoom)} className={`max-h-full max-w-full object-contain ${zoom?'cursor-zoom-out':'cursor-zoom-in'}`}/>
      {items.length>1&&<><button onClick={()=>go(-1)} className="btn-ghost absolute left-2 !p-3 md:left-4" aria-label="Previous"><ChevronLeft/></button><button onClick={()=>go(1)} className="btn-ghost absolute right-2 !p-3 md:right-4" aria-label="Next"><ChevronRight/></button></>}
    </div>{(it.title||it.description)&&<div className="mx-auto max-w-2xl p-5 text-center"><p className="font-display text-xl font-bold">{it.title}</p><p className="mt-1 text-sm text-navy/60">{it.description}</p></div>}</motion.div>}
export function useLightbox(items){const[i,setI]=useState(null);
  return[i,setI,i!==null&&<AnimatePresence><Lightbox items={items} index={i} onClose={()=>setI(null)} onIndex={setI}/></AnimatePresence>]}
