import {PageHead,Section,Specs,Details,Gallery,Videos,Journey,Memories,Features,ServiceLog,Variants,LaunchFacts,Dimensions} from './sections';import {useSite,useCopy} from '../ctx';import Model3D from './Model3D';
const P=({title,sub,children})=><><PageHead title={title} sub={sub}/><div className="mx-auto max-w-7xl px-5 py-12 md:px-8">{children}</div></>;
export const MyForceOne=()=>{const{vehicle={}}=useSite();return<><P title={vehicle.name||'Force One'} sub={[vehicle.model,vehicle.variant,vehicle.year].filter(Boolean).join(' · ')||undefined}><Specs/><Details/></P><Section title="Launch & lineage"><LaunchFacts/></Section><Section title="Variants" sub="The range, trim by trim."><Variants/></Section><Section title="Dimensions"><Dimensions/></Section><ServiceLog/></>};
export const ThreeDPage=()=>{const t=useCopy();return<><PageHead title={t('model3dTitle','3D View')} sub={t('model3dSub','Turn it, light it, repaint it.')}/><div className="mx-auto max-w-7xl px-5 py-12 md:px-8"><Model3D className="h-[75vh] min-h-[460px]"/><p className="mt-3 text-xs text-navy/50">A model built from the published dimensions — a faithful likeness, not a scan. Paint colours are a preview only.</p></div></>};
export const GalleryPage=()=><P title="Gallery" sub="Photographs from the road and the garage."><Gallery/></P>;
export const VideosPage=()=><P title="Videos" sub="Drives, trips and walkarounds."><Videos/></P>;
export const JourneyPage=()=><P title="Journey" sub="Where it started, and every stop since."><Journey/></P>;
export const MemoriesPage=()=><P title="Memories" sub="The stories behind the kilometres."><Memories/></P>;
export const FeaturesPage=()=><P title="Features" sub="What makes it the right vehicle for the road."><Features/></P>;
export const AboutPage=()=>{const{about={}}=useSite();return<P title={about.heading||'About'} sub={about.ownerName&&`Owner: ${about.ownerName}`}>
  <div className="grid gap-10 md:grid-cols-[1fr_1.4fr]">{about.photoUrl&&<img src={about.photoUrl} alt={about.ownerName||'Owner'} className="w-full rounded-3xl object-cover"/>}
  <div className="max-w-prose space-y-4 text-lg leading-relaxed text-navy/80">{(about.body||'The story of this Force One will appear here.').split('\n').map((p,i)=><p key={i}>{p}</p>)}</div></div></P>};
