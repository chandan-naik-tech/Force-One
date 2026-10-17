import {createContext,useContext,useEffect,useState} from 'react';import {api} from './api';
const C=createContext({});export const LaunchCtx=createContext(true);export const AdminCtx=createContext(false);export const useAdmin=()=>useContext(AdminCtx);export const useLaunched=()=>useContext(LaunchCtx);
export const useCopy=()=>{const{copy={}}=useSite();return(k,d)=>copy[k]||d};export const useSite=()=>useContext(C);
export const useLogo=()=>useSite().site?.logoUrl||'/logo.png';
export function SiteProvider({children}){const[s,set]=useState(null);const[admin,setAdmin]=useState(false);
  useEffect(()=>{api.get('/auth/me').then(()=>setAdmin(true)).catch(()=>{})},[]);
  useEffect(()=>{api.get('/settings').then(set).catch(()=>set({}))},[]);
  useEffect(()=>{if(s?.site?.title)document.title=s.site.title;
    if(s?.site?.description)document.querySelector('meta[name=description]')?.setAttribute('content',s.site.description)},[s]);
  return s?<C.Provider value={s}><AdminCtx.Provider value={admin}>{children}</AdminCtx.Provider></C.Provider>:<div className="min-h-screen bg-white"/>}
export function useData(path){const[d,setD]=useState(null);const[error,setError]=useState(null);
  useEffect(()=>{let on=true;setD(null);setError(null);api.get(path).then(x=>on&&setD(x)).catch(e=>on&&setError(e.message));return()=>{on=false}},[path]);
  return{data:d||(error?[]:null),error,loading:!d&&!error}}
