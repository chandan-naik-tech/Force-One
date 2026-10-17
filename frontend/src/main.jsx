import React,{lazy,Suspense,useState} from 'react';import {createRoot} from 'react-dom/client';import {BrowserRouter,Routes,Route,Outlet,useLocation} from 'react-router-dom';
import {SiteProvider,LaunchCtx} from './ctx';import './index.css';
import Loader from './public/Loader';import Nav from './public/Nav';import Footer from './public/Footer';import RouteCurtain from './public/RouteCurtain';import AdminBar from './public/AdminBar';
import Home from './public/Home';import {MyForceOne,ThreeDPage,GalleryPage,VideosPage,JourneyPage,MemoriesPage,FeaturesPage,AboutPage} from './public/pages';
const Admin=lazy(()=>import('./admin/Admin'));
/** phase: loading (logo intro) → reveal (iris opens, the page "launches") → done */
function Layout(){const{pathname}=useLocation();const[phase,setPhase]=useState(()=>!sessionStorage.f1intro&&!pathname.startsWith('/admin')?'loading':'done');
  return<LaunchCtx.Provider value={phase!=='loading'}>{phase!=='done'&&<Loader onReveal={()=>setPhase(p=>p==='loading'?'reveal':p)} onDone={()=>{sessionStorage.f1intro=1;setPhase('done')}}/>}
    <RouteCurtain/><Nav/><main><Outlet/></main><Footer/><AdminBar/></LaunchCtx.Provider>}
createRoot(document.getElementById('root')).render(<BrowserRouter><SiteProvider><Suspense fallback={null}><Routes>
  <Route element={<Layout/>}><Route path="/" element={<Home/>}/><Route path="/my-force-one" element={<MyForceOne/>}/><Route path="/3d" element={<ThreeDPage/>}/><Route path="/gallery" element={<GalleryPage/>}/>
    <Route path="/videos" element={<VideosPage/>}/><Route path="/journey" element={<JourneyPage/>}/><Route path="/memories" element={<MemoriesPage/>}/>
    <Route path="/features" element={<FeaturesPage/>}/><Route path="/about" element={<AboutPage/>}/></Route>
  <Route path="/admin/*" element={<Admin/>}/></Routes></Suspense></SiteProvider></BrowserRouter>);
