import {useEffect,useState} from 'react';import {Routes,Route,NavLink,Navigate,useNavigate} from 'react-router-dom';import {api} from '../api';import {Overlays,Label} from './ui';import {Dashboard,SettingsPanel,ItemsPanel,MediaPanel,AccountPanel} from './panels';
const NAV=[['','Dashboard'],['vehicle','Vehicle'],['variants','Variants'],['hero','Hero'],['gallery','Gallery'],['videos','Videos'],['journey','Journey'],['memories','Memories'],['features','Features'],['services','Services'],['about','About'],['copy','Page text'],['settings','Settings'],['account','Account']];
function Login({onDone}){const[f,setF]=useState({email:'',password:''});const[err,setErr]=useState('');const[busy,setBusy]=useState(false);
  const go=async e=>{e.preventDefault();setBusy(true);setErr('');try{await api.post('/auth/login',f);onDone()}catch(x){setErr(x.message)}setBusy(false)};
  return<div className="blueprint grid min-h-screen place-items-center bg-sky-50 p-4"><form onSubmit={go} className="glass w-full max-w-sm space-y-4 rounded-3xl p-8"><h1 className="text-3xl font-extrabold">Admin sign in</h1>
    <Label l="Email"><input className="input" type="email" autoComplete="username" required value={f.email} onChange={e=>setF({...f,email:e.target.value})}/></Label>
    <Label l="Password"><input className="input" type="password" autoComplete="current-password" required value={f.password} onChange={e=>setF({...f,password:e.target.value})}/></Label>
    {err&&<p className="text-sm font-medium text-red-600" role="alert">{err}</p>}<button className="btn-primary w-full" disabled={busy}>{busy?'Signing in…':'Sign in'}</button></form></div>}
function Shell({onOut}){const titles=Object.fromEntries(NAV.map(([k,l])=>[k,l]));
  return<div className="min-h-screen bg-sky-50/50 md:flex"><Overlays/>
    <aside className="border-b border-sky-200 bg-white md:sticky md:top-0 md:h-screen md:w-56 md:shrink-0 md:border-b-0 md:border-r"><div className="hidden p-5 font-display text-lg font-extrabold md:block">Force One</div>
      <nav className="flex gap-1 overflow-x-auto p-2 md:flex-col" aria-label="Admin">{NAV.map(([to,l])=><NavLink key={to} to={to} end={!to} className={({isActive})=>`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold ${isActive?'bg-navy text-white':'text-navy/70 hover:bg-sky-100'}`}>{l}</NavLink>)}
        <a href="/" target="_blank" rel="noreferrer" className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold text-sky-500 md:mt-4">View site</a><button onClick={onOut} className="whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-semibold text-navy/60">Sign out</button></nav></aside>
    <main className="min-w-0 flex-1 p-4 md:p-10"><Routes><Route index element={<><h1 className="mb-6 text-3xl font-extrabold">Dashboard</h1><Dashboard/></>}/>
      {[['vehicle',<SettingsPanel k="vehicle"/>],['variants',<ItemsPanel type="variant"/>],['copy',<SettingsPanel k="copy"/>],['account',<AccountPanel/>],['hero',<SettingsPanel k="hero"/>],['about',<SettingsPanel k="about"/>],['settings',<SettingsPanel k="site"/>],['gallery',<MediaPanel kind="image"/>],['videos',<MediaPanel kind="video"/>],
        ['journey',<ItemsPanel type="journey"/>],['memories',<ItemsPanel type="memory"/>],['features',<ItemsPanel type="feature"/>],['services',<ItemsPanel type="service"/>]].map(([p,el])=><Route key={p} path={p} element={<><h1 className="mb-6 text-3xl font-extrabold">{titles[p]}</h1>{el}</>}/>)}
      <Route path="*" element={<Navigate to="." replace/>}/></Routes></main></div>}
export default function Admin(){const[me,setMe]=useState(undefined);const nav=useNavigate();
  useEffect(()=>{document.title='Admin · Force One';api.get('/auth/me').then(()=>setMe(true)).catch(()=>setMe(false))},[]);
  if(me===undefined)return null;
  return<Routes><Route path="dashboard/*" element={me?<Shell onOut={async()=>{await api.post('/auth/logout');setMe(false);nav('/admin')}}/>:<Navigate to="/admin" replace/>}/>
    <Route path="*" element={me?<Navigate to="/admin/dashboard" replace/>:<Login onDone={()=>{setMe(true);nav('/admin/dashboard')}}/>}/></Routes>}
