import {createContext,useContext,useEffect,useState} from 'react';
import {api} from './api';
import {STATIC_SETTINGS,FALLBACK_MAP} from './staticData.js';

const C=createContext(STATIC_SETTINGS);
export const LaunchCtx=createContext(true);
export const AdminCtx=createContext(false);
export const useAdmin=()=>useContext(AdminCtx);
export const useLaunched=()=>useContext(LaunchCtx);
export const useCopy=()=>{const{copy={}}=useSite();return(k,d)=>copy[k]||d};
export const useSite=()=>useContext(C);
export const useLogo=()=>useSite().site?.logoUrl||'/logo.png';

export function SiteProvider({children}){
  const[s,set]=useState(STATIC_SETTINGS);
  const[admin,setAdmin]=useState(false);

  useEffect(()=>{
    api.get('/auth/me').then(()=>setAdmin(true)).catch(()=>{});
  },[]);

  useEffect(()=>{
    api.get('/settings').then(res=>{
      if(res && Object.keys(res).length > 0){
        set(prev=>({...prev,...res}));
      }
    }).catch(()=>{});
  },[]);

  useEffect(()=>{
    if(s?.site?.title)document.title=s.site.title;
    if(s?.site?.description)document.querySelector('meta[name=description]')?.setAttribute('content',s.site.description);
  },[s]);

  return s?<C.Provider value={s}><AdminCtx.Provider value={admin}>{children}</AdminCtx.Provider></C.Provider>:<div className="min-h-screen bg-white"/>;
}

export function useData(path){
  const fallback = FALLBACK_MAP[path];
  const[d,setD]=useState(fallback !== undefined ? fallback : null);
  const[error,setError]=useState(null);

  useEffect(()=>{
    let on=true;
    api.get(path).then(x=>{
      if(!on)return;
      if(Array.isArray(x) && x.length===0 && fallback?.length>0){
        setD(fallback);
      } else {
        setD(x);
      }
    }).catch(e=>{
      if(!on)return;
      if(fallback !== undefined){
        setD(fallback);
      } else {
        setError(e.message);
      }
    });
    return()=>{on=false};
  },[path]);

  return{data:d,error,loading:d===null&&!error};
}
