import {lazy,Suspense,useRef} from 'react';import {useInView} from 'framer-motion';import {useSite,useLogo} from '../ctx';
const Car3D=lazy(()=>import('./Car3D'));
/** Downloads three.js only when the section is about to scroll into view. */
export default function Model3D({className='h-[68vh] min-h-[420px] md:h-[78vh]'}){const ref=useRef(null);const near=useInView(ref,{once:true,margin:'400px'});const{site={}}=useSite();const logo=useLogo();
  return<div ref={ref} className={`relative ${className}`}>{near&&<Suspense fallback={<div className="grid h-full place-items-center rounded-3xl bg-sky-50 text-sm text-navy/50">Loading 3D view…</div>}><Car3D className="h-full" modelUrl={site.modelUrl||undefined} logoUrl={logo}/></Suspense>}</div>}
