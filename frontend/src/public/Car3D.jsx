import {useEffect,useRef,useState} from 'react';import * as THREE from 'three';import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {RotateCw,Lightbulb,Plus,Minus,X} from 'lucide-react';import {buildForceOne} from './forceOneModel';import CarBlueprint from './CarBlueprint';
const PAINTS=[['Pearl white','#f4f6f8'],['Silver','#b8bec7'],['Graphite','#3b4149'],['Deep blue','#133a74']];
const VIEWS={'3/4':[40,14],Front:[0,6],Side:[90,4],Rear:[180,6],Top:[90,78]};
const D=Math.PI/180,TARGET=new THREE.Vector3(0,.95,0);
const radial=(inner,outer)=>{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),r=g.createRadialGradient(64,64,0,64,64,64);r.addColorStop(0,inner);r.addColorStop(1,outer);g.fillStyle=r;g.fillRect(0,0,128,128);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t};
/** Interactive 3D viewer: drag to rotate, view presets, paint preview, lights, hotspots. Loads a custom GLB when `modelUrl` is set. */
export default function Car3D({modelUrl,logoUrl='/logo.png',className=''}){
  const mount=useRef(null),ctl=useRef({}),hot=useRef([]);const[ui,setUi]=useState({lights:false,rot:true,paint:0,view:'3/4',hint:true,err:false});const[anchors,setAnchors]=useState([]);const[open,setOpen]=useState(null);const[loading,setLoading]=useState(!!modelUrl);
  useEffect(()=>{const el=mount.current;let renderer;try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});if(!renderer.getContext())throw 0}catch{setUi(u=>({...u,err:true}));return}
    renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;
    const cv=renderer.domElement;cv.style.cssText='display:block;width:100%;height:100%;touch-action:pan-y;cursor:grab';el.appendChild(cv);
    const scene=new THREE.Scene(),pm=new THREE.PMREMGenerator(renderer);scene.environment=pm.fromScene(new RoomEnvironment(),.04).texture;
    const cam=new THREE.PerspectiveCamera(30,1,.1,100);scene.add(new THREE.HemisphereLight(0xffffff,0xbcd6f5,.5));const key=new THREE.DirectionalLight(0xffffff,1.4);key.position.set(4,7,5);scene.add(key);
    // turntable, gauge ticks, soft shadow
    const disc=new THREE.Mesh(new THREE.CircleGeometry(3.4,72).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0xeaf3ff,transparent:true,opacity:.5}));disc.position.y=-.002;scene.add(disc);
    for(const r of[3.4,2.75]){const ring=new THREE.Mesh(new THREE.RingGeometry(r-.012,r,96).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0x5fa8f5,transparent:true,opacity:r>3?.7:.35}));ring.position.y=.001;scene.add(ring)}
    const ticks=new THREE.InstancedMesh(new THREE.BoxGeometry(.012,.002,.12),new THREE.MeshBasicMaterial({color:0x5fa8f5}),72),dm=new THREE.Object3D();
    for(let i=0;i<72;i++){const a=i/72*Math.PI*2,r=3.5;dm.position.set(Math.cos(a)*r,.002,Math.sin(a)*r);dm.rotation.set(0,-a,0);dm.scale.set(1,1,i%6?.6:1.2);dm.updateMatrix();ticks.setMatrixAt(i,dm.matrix)}scene.add(ticks);
    const sh=new THREE.Mesh(new THREE.PlaneGeometry(7.2,3.6).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({map:radial('rgba(10,35,66,.55)','rgba(10,35,66,0)'),transparent:true,depthWrite:false}));sh.position.y=.004;scene.add(sh);
    // headlight glow (lights on)
    const glowT=radial('rgba(255,255,255,1)','rgba(160,210,255,0)'),glows=[],pools=[];
    let built=null,model=null,disposed=false,lightsT=0,lightsV=0;
    const pool=radial('rgba(255,244,214,.9)','rgba(255,244,214,0)');
    for(const z of[.66,-.66]){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glowT,blending:THREE.AdditiveBlending,transparent:true,opacity:0,depthWrite:false}));s.scale.set(.5,.5,1);s.position.set(2.5,1.0,z);scene.add(s);glows.push(s);
      const p=new THREE.Mesh(new THREE.PlaneGeometry(3.4,1.7).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({map:pool,blending:THREE.AdditiveBlending,transparent:true,opacity:0,depthWrite:false}));p.position.set(4.0,.008,z*.9);scene.add(p);pools.push(p)}
    if(modelUrl){new GLTFLoader().load(modelUrl,g=>{if(disposed)return;const r=g.scene,b=new THREE.Box3().setFromObject(r),sz=b.getSize(new THREE.Vector3()),c=b.getCenter(new THREE.Vector3());const k=4.86/Math.max(sz.x,sz.z);r.scale.setScalar(k);r.position.set(-c.x*k,-b.min.y*k,-c.z*k);scene.add(r);model=r;setLoading(false)},undefined,()=>{setLoading(false);setUi(u=>({...u,err:true}))})}
    else{built=buildForceOne({logoUrl,color:PAINTS[0][1]});scene.add(built.group);setAnchors(built.anchors)}
    // camera state (spherical around the car), smoothed
    const st={az:-50*D,el:40*D,sc:1.7,azT:40*D,elT:14*D,scT:1,k:2.2,drag:null,idle:0,fit:7,auto:true,t:0};const v=new THREE.Vector3();
    const place=()=>{const r=st.fit*st.sc;cam.position.set(TARGET.x+r*Math.cos(st.el)*Math.cos(st.az),TARGET.y+r*Math.sin(st.el),TARGET.z+r*Math.cos(st.el)*Math.sin(st.az));cam.lookAt(TARGET)};
    const size=()=>{const w=el.clientWidth||600,h=el.clientHeight||400;renderer.setSize(w,h,false);cam.aspect=w/h;const hf=2*Math.atan(Math.tan(cam.fov*D/2)*cam.aspect);st.fit=THREE.MathUtils.clamp(3.9/Math.tan(hf/2),6.2,24);cam.updateProjectionMatrix()};
    const ro=new ResizeObserver(size);ro.observe(el);size();
    const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
    ctl.current={view:n=>{const[a,e]=VIEWS[n];st.azT=st.az+wrap(a*D-st.az);st.elT=e*D;st.scT=n==='Top'?1.05:1;st.k=3.2;st.auto=false;st.idle=0;setUi(u=>({...u,view:n,rot:false}))},
      lights:on=>{lightsT=on?1:0},zoom:d=>{st.scT=THREE.MathUtils.clamp(st.scT+d,.5,1.5);st.k=6},rot:on=>{st.auto=on;st.idle=0},
      paint:hex=>{if(built)built.paint.color.set(hex)},jump:(a,e,sc,fov)=>{st.az=st.azT=a*D;st.el=st.elT=e*D;st.sc=st.scT=sc;st.auto=false;if(fov){cam.fov=fov;cam.updateProjectionMatrix()}}};
    if(/debug3d/.test(location.search))window.__f1=ctl.current;
    const down=e=>{cv.setPointerCapture?.(e.pointerId);st.drag={x:e.clientX,y:e.clientY};st.k=12;st.auto=false;cv.style.cursor='grabbing';setUi(u=>({...u,hint:false,rot:false}))};
    const move=e=>{if(!st.drag)return;st.azT-=(e.clientX-st.drag.x)*.0075;st.elT=THREE.MathUtils.clamp(st.elT+(e.clientY-st.drag.y)*.005,2*D,82*D);st.drag={x:e.clientX,y:e.clientY}};
    const up=()=>{st.drag=null;cv.style.cursor='grab'};
    cv.addEventListener('pointerdown',down);cv.addEventListener('pointermove',move);cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
    let vis=true,raf=0,last=performance.now();const io=new IntersectionObserver(([e])=>{vis=e.isIntersecting});io.observe(el);
    const loop=now=>{raf=requestAnimationFrame(loop);const dt=Math.min((now-last)/1000,.05);last=now;if(!vis||document.hidden)return;
      st.t+=dt;if(st.auto&&!st.drag&&st.t>3.2)st.azT+=dt*.18;const f=1-Math.exp(-dt*st.k);st.az+=(st.azT-st.az)*f;st.el+=(st.elT-st.el)*f;st.sc+=(st.scT-st.sc)*f;if(st.k<10&&Math.abs(st.azT-st.az)<.01&&st.t>2.6)st.k=9;place();
      lightsV+=(lightsT-lightsV)*(1-Math.exp(-dt*6));built?.setLights(lightsV);glows.forEach(g=>g.material.opacity=lightsV*.5);pools.forEach(p=>p.material.opacity=lightsV*.3);
      // hotspots
      anchors_.forEach((a,i)=>{const b=hot.current[i];if(!b)return;v.set(...a.p).project(cam);const w=cv.clientWidth,h=cv.clientHeight;const face=new THREE.Vector3(...a.n).normalize().dot(cam.position.clone().sub(new THREE.Vector3(...a.p)).normalize());
        b.style.transform=`translate(${(v.x*.5+.5)*w}px,${(-v.y*.5+.5)*h}px)`;b.style.opacity=face>.25&&v.z<1?1:0;b.style.pointerEvents=face>.25?'auto':'none'});
      renderer.render(scene,cam)};
    const anchors_=built?built.anchors:[];place();raf=requestAnimationFrame(loop);
    return()=>{disposed=true;cancelAnimationFrame(raf);ro.disconnect();io.disconnect();cv.removeEventListener('pointerdown',down);cv.removeEventListener('pointermove',move);cv.removeEventListener('pointerup',up);cv.removeEventListener('pointercancel',up);
      scene.traverse(o=>{o.geometry?.dispose?.()});pm.dispose();renderer.dispose();cv.remove()}},[modelUrl,logoUrl]);
  const c=ctl.current,custom=!!modelUrl;
  if(ui.err)return<div className={`grid place-items-center rounded-3xl bg-sky-50 p-6 ${className}`}><div className="w-full max-w-2xl text-center"><CarBlueprint play/><p className="mt-4 text-sm text-navy/60">3D view isn’t available on this device, so here’s the blueprint instead.</p></div></div>;
  const Btn=({on,children,...p})=><button {...p} className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition ${on?'bg-navy text-white':'text-navy/70 hover:bg-sky-100'}`}>{children}</button>;
  const cur=anchors.find(a=>a.id===open);
  return<div className={`blueprint relative overflow-hidden rounded-3xl border border-sky-200 bg-gradient-to-b from-white via-sky-50 to-sky-200 ${className}`}>
    <div ref={mount} className="absolute inset-0" aria-label="Interactive 3D model of the Force One. Drag to rotate."/>
    {anchors.map((a,i)=><button key={a.id} ref={el=>hot.current[i]=el} onClick={()=>setOpen(open===a.id?null:a.id)} aria-label={a.label} className="absolute left-0 top-0 -ml-3 -mt-3 grid h-6 w-6 place-items-center rounded-full transition-opacity" style={{opacity:0}}>
      <span className="absolute h-6 w-6 animate-ping rounded-full bg-sky-400/50"/><span className={`relative h-3.5 w-3.5 rounded-full border-2 border-white shadow ${open===a.id?'bg-navy':'bg-sky-500'}`}/></button>)}
    {loading&&<p className="absolute inset-0 grid place-items-center text-sm text-navy/60">Loading 3D model…</p>}
    {ui.hint&&<p className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-white/80 px-4 py-1.5 text-xs font-semibold text-navy/70 backdrop-blur">Drag to rotate{!custom&&' · tap the dots for details'}</p>}
    {cur&&<div className="glass absolute left-4 top-14 max-w-[15rem] rounded-2xl p-4 md:left-6"><button onClick={()=>setOpen(null)} aria-label="Close" className="absolute right-2 top-2 text-navy/50"><X size={14}/></button><p className="font-display text-base font-bold">{cur.label}</p><p className="mt-1 text-xs leading-relaxed text-navy/70">{cur.text}</p></div>}
    <div className="absolute inset-x-0 bottom-3 flex justify-center px-2"><div className="glass flex max-w-full flex-wrap items-center justify-center gap-x-1 gap-y-1 rounded-3xl p-1.5 md:rounded-full">
      {Object.keys(VIEWS).map(n=><Btn key={n} on={ui.view===n} onClick={()=>c.view(n)}>{n}</Btn>)}<span className="mx-1 hidden h-5 w-px bg-sky-200 md:block"/>
      <Btn on={ui.lights} onClick={()=>{setUi(u=>({...u,lights:!u.lights}));c.lights(!ui.lights)}} aria-pressed={ui.lights}><Lightbulb size={14}/>Lights</Btn>
      <Btn on={ui.rot} onClick={()=>{setUi(u=>({...u,rot:!u.rot}));c.rot(!ui.rot)}} aria-pressed={ui.rot}><RotateCw size={14}/>Spin</Btn>
      <Btn onClick={()=>c.zoom(-.15)} aria-label="Zoom in"><Plus size={14}/></Btn><Btn onClick={()=>c.zoom(.15)} aria-label="Zoom out"><Minus size={14}/></Btn>
      {!custom&&<><span className="mx-1 hidden h-5 w-px bg-sky-200 md:block"/><span className="flex items-center gap-1.5 px-1.5" role="group" aria-label="Paint preview">{PAINTS.map(([n,h],i)=><button key={n} title={n} aria-label={n} onClick={()=>{setUi(u=>({...u,paint:i}));c.paint(h)}} className={`h-6 w-6 rounded-full border-2 transition ${ui.paint===i?'scale-110 border-sky-500':'border-white'}`} style={{background:h}}/>)}</span></>}</div></div></div>}
