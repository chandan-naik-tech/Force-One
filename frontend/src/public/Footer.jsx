import {Link} from 'react-router-dom';import {motion} from 'framer-motion';import {useSite,useLogo} from '../ctx';
export default function Footer(){const{site={}}=useSite();const logo=useLogo();const soc=[['instagram','Instagram'],['youtube','YouTube'],['facebook','Facebook']].filter(([k])=>site[k]);
  return<footer className="relative mt-10 overflow-hidden bg-sky-50 blueprint">
    <div className="relative h-px bg-sky-200"><motion.div className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-sky-500 to-transparent" animate={{left:['-33%','100%']}} transition={{duration:5,repeat:Infinity,ease:'linear'}}/></div>
    <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-3 md:px-8">
      <div><img src={logo} alt="" className="mb-4 h-14 w-14 rounded-full"/><p className="font-display text-2xl font-bold">Force One</p><p className="mt-2 max-w-xs text-sm text-navy/60">{site.footerNote||'A personal showcase by an owner. Not affiliated with Force Motors.'}</p></div>
      <nav aria-label="Footer" className="flex flex-col gap-2 text-sm font-medium">{[['/3d','3D view'],['/gallery','Gallery'],['/videos','Videos'],['/journey','Journey'],['/memories','Memories'],['/admin','Admin login']].map(([t,l])=><Link key={t} to={t} className="w-fit text-navy/70 hover:text-sky-500">{l}</Link>)}</nav>
      <div className="flex flex-col gap-2 text-sm font-medium">{soc.map(([k,l])=><a key={k} href={site[k]} target="_blank" rel="noreferrer" className="w-fit text-navy/70 hover:text-sky-500">{l}</a>)}</div>
    </div><p className="border-t border-sky-200 py-5 text-center text-xs text-navy/50">© {new Date().getFullYear()} Force One. Force and Force One are trademarks of Force Motors Ltd.</p></footer>}
