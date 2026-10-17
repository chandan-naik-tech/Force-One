import {useRef} from 'react';import {Link} from 'react-router-dom';import {motion,useScroll,useTransform} from 'framer-motion';import LogoBadge from './LogoBadge';import Model3D from './Model3D';import Hero from './Hero';
import {Section,Specs,Gallery,Videos,Journey,Memories,FeaturedImage,Variants,LaunchFacts,Dimensions,Features} from './sections';import {useSite,useLogo,useCopy} from '../ctx';
export default function Home(){const{vehicle:v={},copy={}}=useSite();const t=useCopy();
  return<><Hero/>
    {!copy.hideLaunch&&<Section title={t('launchTitle','Launch & lineage')} edit="vehicle" sub={t('launchSub','')||undefined}><LaunchFacts/></Section>}
    <div className="bg-sky-50/70"><Section title={v.name||'Force One'} edit="vehicle" sub={[v.model,v.year,v.colour].filter(Boolean).join(' · ')||undefined} to="/my-force-one" cta="Full details"><Specs/></Section></div>
    {!copy.hideModel3d&&<Section title={t('model3dTitle','Explore in 3D')} edit="settings" sub={t('model3dSub','Turn it, light it, repaint it.')} to="/3d" cta="Full screen view"><Model3D/></Section>}
    <FeaturedImage/>
    {!copy.hideVariants&&<Section title={t('variantsTitle','Variants')} edit="variants" sub={t('variantsSub','The range, trim by trim.')}><Variants/></Section>}
    {!copy.hideDimensions&&<div className="bg-sky-50/70"><Section title={t('dimensionsTitle','Dimensions')} edit="vehicle" sub={t('dimensionsSub','Built big. Measured here.')}><Dimensions/></Section></div>}
    {!copy.hideFeatures&&<Section title={t('featuresTitle','Features')} edit="features" sub={t('featuresSub','What it came with.')} to="/features" cta="All features"><Features/></Section>}
    {!copy.hideVideo&&<Section title={t('videoTitle','On the move')} edit="videos" sub="The featured film." to="/videos" cta="All videos"><Videos limit={1}/></Section>}
    {!copy.hideJourney&&<div className="bg-sky-50/70"><Section title={t('journeyTitle','The journey')} edit="journey" sub={t('journeySub','From the first drive to the latest road.')} to="/journey" cta="Full timeline"><Journey limit={3}/></Section></div>}
    {!copy.hideMemories&&<Section title={t('memoriesTitle','Memories')} edit="memories" to="/memories" cta="All memories"><Memories limit={3}/></Section>}
    {!copy.hideGallery&&<Section title={t('galleryTitle','Gallery')} edit="gallery" to="/gallery" cta="Open gallery"><Gallery limit={6} filter={false}/></Section>}
    <CTA/></>}
function CTA(){const ref=useRef(null);const logo=useLogo();const t=useCopy();const{scrollYProgress}=useScroll({target:ref,offset:['start end','end start']});const rot=useTransform(scrollYProgress,[0,1],[-60,60]);
  return<section ref={ref} className="blueprint relative overflow-hidden bg-gradient-to-b from-white to-sky-100 py-28 text-center">
    <motion.img src={logo} alt="" aria-hidden="true" style={{rotate:rot}} className="pointer-events-none absolute left-1/2 top-1/2 w-[720px] max-w-none -translate-x-1/2 -translate-y-1/2 opacity-[.07]"/>
    <div className="relative"><LogoBadge size={200}/><h2 className="mx-auto mt-10 max-w-3xl px-5 text-4xl font-extrabold md:text-6xl">{t('ctaTitle','Every kilometre has a story.')}</h2>
      <div className="mt-8 flex justify-center gap-3"><Link to="/gallery" className="btn-primary">View gallery</Link><Link to="/memories" className="btn-ghost">Read memories</Link></div></div></section>}
