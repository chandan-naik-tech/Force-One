import * as T from 'three';
/**
 * Procedural Force One SUV, built to the published dimensions (4,860 mm long · 1,780 mm wide · ~1,940 mm tall body + rails · 3,025 mm wheelbase · 205 mm clearance).
 * Units are metres, +x = front, +y = up, +z = right side. The body is a loft of cross-sections; everything else is modelled around it.
 */
const lerp=(a,b,t)=>a+(b-a)*t;
// x, yBottom, yBelt, yTop, halfWidth (body side), halfWidth at roof/hood top
const ST=[[-2.43,.38,.98,1.00,.845,.80],[-2.42,.38,1.10,1.17,.845,.78],[-2.33,.37,1.20,1.31,.85,.76],[-2.23,.36,1.28,1.50,.85,.74],[-1.98,.33,1.30,1.78,.855,.70],[-1.92,.32,1.30,1.925,.855,.69],[-1.00,.30,1.30,1.94,.855,.69],[.04,.30,1.30,1.94,.845,.69],
  [.23,.30,1.30,1.905,.845,.70],[.38,.30,1.30,1.863,.845,.71],[.72,.30,1.30,1.664,.845,.76],[1.06,.30,1.285,1.397,.85,.81],[1.12,.30,1.245,1.355,.85,.82],[1.44,.30,1.20,1.312,.855,.83],[1.75,.31,1.14,1.249,.855,.83],[2.13,.33,1.05,1.144,.855,.82],[2.40,.36,1.00,1.10,.85,.81]];
const mk=a=>({x:a[0],yb:a[1],yBelt:a[2],yt:a[3],w:a[4],wt:a[5]});
export const P=x=>{if(x<=ST[0][0])return mk(ST[0]);for(let i=0;i<ST.length-1;i++)if(x<=ST[i+1][0]){const t=(x-ST[i][0])/(ST[i+1][0]-ST[i][0]);return mk(ST[i].map((v,j)=>lerp(v,ST[i+1][j],t)))}return mk(ST[ST.length-1])};
function section({yb,yBelt,yt,w,wt}){const rt=Math.min(.12,(yt-yBelt)*.5);const C=[[w,yb,.05],[w,yBelt,.035],[wt,yt,rt],[-wt,yt,rt],[-w,yBelt,.035],[-w,yb,.05]];const pts=[],n=5;
  C.forEach((c,i)=>{const pv=C[(i+5)%6],nx=C[(i+1)%6],a=new T.Vector2(c[0],c[1]),p=new T.Vector2(pv[0],pv[1]),q=new T.Vector2(nx[0],nx[1]);
    const r=Math.min(c[2],a.distanceTo(p)*.45,a.distanceTo(q)*.45),A=a.clone().add(p.sub(a).setLength(r)),B=a.clone().add(q.sub(a).setLength(r));
    for(let k=0;k<=n;k++){const t=k/n,u=1-t;pts.push([u*u*A.x+2*u*t*a.x+t*t*B.x,u*u*A.y+2*u*t*a.y+t*t*B.y])}});return pts}
function orient(g,fn){const p=g.attributes.position,ix=g.index.array,a=new T.Vector3(),b=new T.Vector3(),c=new T.Vector3(),n=new T.Vector3(),m=new T.Vector3();let s=0;
  for(let i=0;i<ix.length;i+=3){a.fromBufferAttribute(p,ix[i]);b.fromBufferAttribute(p,ix[i+1]);c.fromBufferAttribute(p,ix[i+2]);n.crossVectors(b.clone().sub(a),c.clone().sub(a));m.copy(a).add(b).add(c).divideScalar(3);s+=fn(m,n)}
  if(s<0)for(let i=0;i<ix.length;i+=3){const t=ix[i+1];ix[i+1]=ix[i+2];ix[i+2]=t}g.computeVertexNormals();return g}
function bodyGeos(){const rows=ST.map(s=>section({yb:s[1],yBelt:s[2],yt:s[3],w:s[4],wt:s[5]})),M=rows[0].length,pos=[],idx=[];
  rows.forEach((r,i)=>r.forEach(([z,y])=>pos.push(ST[i][0],y,z)));
  for(let i=0;i<ST.length-1;i++)for(let k=0;k<M;k++){const k2=(k+1)%M,a=i*M+k,b=i*M+k2,c=(i+1)*M+k2,d=(i+1)*M+k;idx.push(a,b,c,a,c,d)}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(idx);orient(g,(c,n)=>n.y*(c.y-1.1)+n.z*c.z);
  const cap=(i,sign)=>{const r=rows[i],x=ST[i][0],p=[];r.forEach(([z,y])=>p.push(x,y,z));p.push(x,r.reduce((s,q)=>s+q[1],0)/M,0);const ix=[];for(let k=0;k<M;k++)ix.push(M,k,(k+1)%M);
    const cg=new T.BufferGeometry();cg.setAttribute('position',new T.Float32BufferAttribute(p,3));cg.setIndex(ix);return orient(cg,(c,n)=>n.x*sign)};
  return[g,cap(0,-1),cap(ST.length-1,1)]}
/** Rounded box: w across (z), h tall (y), d deep (x). */
function rbox(w,h,d,r=.02,b=.008){const s=new T.Shape(),x=-w/2,y=-h/2;r=Math.min(r,w/2-.001,h/2-.001);
  s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);
  const depth=Math.max(d-2*b,.001),g=new T.ExtrudeGeometry(s,{depth,bevelEnabled:b>0,bevelThickness:b,bevelSize:b*.8,bevelSegments:2,curveSegments:5});g.translate(0,0,-depth/2);g.rotateY(Math.PI/2);return g}
const box=(x,y,z)=>new T.BoxGeometry(x,y,z);
/** Quad patch hugging the side surface: corners are [x,f] (front-bottom, front-top, rear-top, rear-bottom), f = 0 belt … 1 roof edge. */
function sidePanel(c,off,nx=8,nf=4){const pos=[],idx=[];const[bf,tf,tr,br]=c;
  for(let j=0;j<=nf;j++)for(let i=0;i<=nx;i++){const u=i/nx,v=j/nf;const x=lerp(lerp(bf[0],br[0],u),lerp(tf[0],tr[0],u),v),f=lerp(lerp(bf[1],br[1],u),lerp(tf[1],tr[1],u),v);
    const p=P(x),z=lerp(p.w,p.wt,f),y=lerp(p.yBelt,p.yt,f),dz=p.wt-p.w,dy=p.yt-p.yBelt,l=Math.hypot(dz,dy);pos.push(x,y-dz/l*off,z+dy/l*off)}
  for(let j=0;j<nf;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i;idx.push(a,a+1,a+nx+2,a,a+nx+2,a+nx+1)}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();return g}
/** Patch on the top surface (windshield / rear glass) between x0 and x1, offset along the surface normal. */
function topPanel(x0,x1,inset,off,nx=10,nz=6){const pos=[],idx=[];
  for(let i=0;i<=nx;i++){const x=lerp(x0,x1,i/nx),p=P(x),e=.004,s=(P(x+e).yt-P(x-e).yt)/(2*e),l=Math.hypot(s,1),zf=p.wt-inset;
    for(let j=0;j<=nz;j++)pos.push(x-s/l*off,p.yt+off/l,lerp(-zf,zf,j/nz))}
  for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){const a=i*(nz+1)+j;idx.push(a,a+1,a+nz+2,a,a+nz+2,a+nz+1)}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();return g}

export function buildForceOne({logoUrl='/logo.png',color='#f4f6f8'}={}){
  const logo=new T.TextureLoader().load(logoUrl);logo.colorSpace=T.SRGBColorSpace;logo.anisotropy=4;
  const S=(o)=>new T.MeshStandardMaterial(o);
  const M={paint:new T.MeshPhysicalMaterial({color,metalness:.3,roughness:.3,clearcoat:1,clearcoatRoughness:.05}),
    glass:new T.MeshPhysicalMaterial({color:0x03070b,metalness:0,roughness:.1,clearcoat:1,clearcoatRoughness:.05,side:T.DoubleSide,envMapIntensity:.5}),
    black:S({color:0x0a0c0f,roughness:.6,metalness:.05,envMapIntensity:.35,side:T.DoubleSide}),trim:S({color:0x1c2026,roughness:.5,metalness:.2}),chrome:S({color:0xe4eaf1,metalness:1,roughness:.12}),
    alloy:S({color:0xcdd4dc,metalness:1,roughness:.22}),tire:S({color:0x121315,roughness:.92}),dark:S({color:0x050607,roughness:.9,side:T.DoubleSide}),
    lens:new T.MeshPhysicalMaterial({color:0xe9f2fa,transparent:true,opacity:.38,roughness:.04,clearcoat:1,depthWrite:false}),
    drl:S({color:0x9fd6ff,emissive:0x8fd0ff,emissiveIntensity:.3}),beam:S({color:0xf4f9ff,emissive:0xffffff,emissiveIntensity:0,roughness:.2}),
    tail:S({color:0x7d0b0b,emissive:0xff1010,emissiveIntensity:.15,roughness:.3}),amber:S({color:0xd98a00,emissive:0xff9a00,emissiveIntensity:.12}),
    badge:S({map:logo,roughness:.35,metalness:.5}),plate:S({color:0xe8eaee,roughness:.6})};
  const root=new T.Group();root.name='Force One';
  const add=(g,m,x=0,y=0,z=0,p=root)=>{const o=new T.Mesh(g,m);o.position.set(x,y,z);p.add(o);return o};
  // body, floor
  const[lat,capR,capF]=bodyGeos();[lat,capR,capF].forEach(g=>add(g,M.paint));add(box(4.3,.05,1.46),M.dark,-.02,.285,0);
  // windshield, rear glass, wipers, high-mount stop lamp
  add(topPanel(.40,1.03,.15,.006),M.glass);add(topPanel(-2.28,-2.02,.17,.006,8,6),M.glass);
  for(const z of[.18,-.2]){const p=P(1.0),w=add(box(.02,.014,.5),M.black,1.0,p.yt+.02,z);w.rotation.z=-.6}
  add(rbox(1.1,.03,.12,.01,.004),M.paint,-1.93,1.93,0);add(box(.02,.025,.4),M.tail,-1.995,1.925,0);
  // roof rails
  for(const z of[.5,-.5]){const r=add(new T.CylinderGeometry(.018,.018,1.58,10),M.black,-.93,1.965,z);r.rotation.z=Math.PI/2;for(const x of[-1.72,-.93,-.14])add(box(.05,.03,.05),M.black,x,1.945,z)}
  // bumpers and fascia
  add(rbox(1.77,.5,.26,.1,.02),M.paint,2.34,.6,0);add(rbox(1.77,.42,.26,.09,.02),M.paint,-2.34,.56,0);
  add(box(.22,.025,1.2),M.black,-2.38,.78,0);add(box(.06,.1,1.0),M.dark,2.47,.5,0);add(box(.26,.025,1.0),M.alloy,2.36,.33,0);add(box(.1,.07,1.2),M.black,2.4,.38,0);
  add(box(.07,.2,.46),M.plate,-2.46,.62,0);add(new T.CircleGeometry(.05,32).rotateY(-Math.PI/2),M.badge,-2.442,1.38,0);
  for(const z of[.22,-.22,.52,-.52])add(new T.CylinderGeometry(.013,.013,.02,12).rotateZ(Math.PI/2),M.black,-2.472,.63,z);
  const ex=add(new T.CylinderGeometry(.035,.035,.14,14).rotateZ(Math.PI/2),M.chrome,-2.34,.33,.42);
  // grille
  add(box(.05,.21,1.0),M.dark,2.395,.96,0);add(box(.03,.018,1.04),M.chrome,2.415,1.068,0);add(box(.03,.018,1.04),M.chrome,2.415,.853,0);
  for(const z of[.51,-.51])add(box(.03,.22,.018),M.chrome,2.415,.96,z);for(const y of[.9,.96,1.02])add(box(.03,.026,.97),M.alloy,2.41,y,0);
  add(new T.CircleGeometry(.062,40).rotateY(Math.PI/2),M.badge,2.434,.96,0);add(new T.TorusGeometry(.064,.008,8,40).rotateY(Math.PI/2),M.chrome,2.432,.96,0);
  const logoBadge=add(new T.CircleGeometry(.05,32),M.badge,0,0,0);logoBadge.visible=false;
  // wheels
  const wheel=()=>{const g=new T.Group();const pr=[[.205,-.1],[.255,-.118],[.33,-.119],[.368,-.1],[.376,-.06],[.376,.06],[.368,.1],[.33,.119],[.255,.118],[.205,.1]].map(([r,a])=>new T.Vector2(r,a));
    add(new T.LatheGeometry(pr,48).rotateX(Math.PI/2),M.tire,0,0,0,g);
    const tr=new T.InstancedMesh(box(.035,.06,.1),M.tire,96),d=new T.Object3D();for(let i=0;i<96;i++){const a=(i>>1)/48*Math.PI*2+(i&1?.033:0);d.position.set(Math.cos(a)*.378,Math.sin(a)*.378,(i&1?1:-1)*.055);d.rotation.set(0,0,a);d.updateMatrix();tr.setMatrixAt(i,d.matrix)}g.add(tr);
    add(new T.CylinderGeometry(.205,.205,.2,32).rotateX(Math.PI/2),M.dark,0,0,0,g);add(new T.CylinderGeometry(.2,.2,.02,40).rotateX(Math.PI/2),M.trim,0,0,.07,g);add(new T.TorusGeometry(.205,.014,8,48),M.alloy,0,0,.108,g);
    const sp=new T.Shape();sp.moveTo(.05,-.028);sp.lineTo(.2,-.048);sp.lineTo(.2,.048);sp.lineTo(.05,.028);sp.closePath();const sg=new T.ExtrudeGeometry(sp,{depth:.025,bevelEnabled:true,bevelThickness:.006,bevelSize:.006,bevelSegments:1});
    for(let i=0;i<5;i++){const s=add(sg,M.alloy,0,0,.08,g);s.rotation.z=i*Math.PI*2/5}
    add(new T.CylinderGeometry(.052,.052,.03,24).rotateX(Math.PI/2),M.alloy,0,0,.1,g);add(new T.CircleGeometry(.04,28),M.badge,0,0,.116,g);return g};
  const AX_F=1.595,AX_R=-1.43,CY=.376,R=.5,th0=Math.asin((.30-CY)/R);
  const makeSide=()=>{const s=new T.Group();
    // wheels, arches, flares
    for(const ax of[AX_F,AX_R]){const w=wheel();w.position.set(ax,CY,.7675);s.add(w);
      const sh=new T.Shape();sh.absarc(0,CY,R,th0,Math.PI-th0,false);sh.closePath();add(new T.ShapeGeometry(sh,40),M.dark,ax,0,.852,s);
      const fl=add(new T.TorusGeometry(R,.03,8,56,Math.PI-2*th0),M.paint,ax,CY,.862,s);fl.rotation.z=th0;fl.scale.z=.7}
    // glass + blackout
    s.add(new T.Mesh(sidePanel([[.95,.04],[.34,.78],[-2.0,.78],[-2.2,.04]],.004,14,3),M.black));
    for(const c of[[[.74,.07],[.40,.7],[.02,.7],[.02,.07]],[[-.15,.07],[-.15,.7],[-.78,.7],[-.88,.07]],[[-1.30,.06],[-1.24,.56],[-1.73,.40],[-1.66,.06]]])s.add(new T.Mesh(sidePanel(c,.008,8,4),M.glass));
    // door lines, handles, step, mirror
    for(const x of[1.10,-.09,-1.03])add(box(.006,.98,.004),M.dark,x,.8,.8585,s);
    for(const x of[.12,-.95])add(rbox(.04,.03,.12,.012,.004).rotateY(Math.PI/2),M.chrome,x,1.14,.872,s);
    add(rbox(.13,.035,1.72,.015,.006),M.chrome,.05,.44,.865,s);add(box(1.55,.012,.09),M.black,.05,.463,.865,s);for(const x of[-.65,.55])add(box(.05,.08,.1),M.trim,x,.5,.82,s);
    add(box(.04,.04,.08),M.black,.83,1.34,.88,s);add(rbox(.11,.15,.17,.04,.01),M.paint,.85,1.42,.94,s);add(box(.01,.12,.09),M.glass,.764,1.42,.94,s);add(box(.03,.025,.05),M.amber,.91,1.42,.94,s);
    // front lamp
    const lamp=new T.Group();lamp.position.set(2.37,1.0,.66);lamp.rotation.y=-.2;
    add(rbox(.38,.17,.08,.05,.012),M.lens,.04,0,0,lamp).renderOrder=2;add(rbox(.35,.14,.06,.04,.008),M.alloy,0,0,0,lamp);
    for(const[z,r]of[[-.07,.045],[.035,.04]]){add(new T.CylinderGeometry(r,r,.04,20).rotateZ(Math.PI/2),M.chrome,.025,0,z,lamp);add(new T.SphereGeometry(r*.7,16,12),M.beam,.045,0,z,lamp)}
    add(rbox(.06,.05,.02,.01,.004),M.amber,.04,.01,.13,lamp);add(box(.012,.014,.31),M.drl,.045,-.1,0,lamp);s.add(lamp);
    // fog lamp pocket
    add(rbox(.3,.15,.03,.04,.006),M.dark,2.468,.5,.6,s);add(new T.TorusGeometry(.05,.011,8,28).rotateY(Math.PI/2),M.chrome,2.482,.5,.66,s);add(new T.CircleGeometry(.044,24).rotateY(Math.PI/2),M.beam,2.482,.5,.66,s);
    // tail lamp
    add(rbox(.14,.40,.06,.03,.008),M.tail,-2.43,1.08,.74,s);add(rbox(.06,.2,.06,.02,.006),M.tail,-2.44,.72,.8,s);
    return s};
  const R_=makeSide(),L_=makeSide();L_.scale.z=-1;root.add(R_,L_);
  // lights control
  const setLights=v=>{M.drl.emissiveIntensity=.3+v*2.2;M.beam.emissiveIntensity=v*2.5;M.tail.emissiveIntensity=.15+v*1.4;M.amber.emissiveIntensity=.12+v*.6};
  const anchors=[{id:'lamps',label:'Projector headlamps',text:'Halogen projector headlamps with integrated LED daytime running lights.',p:[2.4,1.02,.7],n:[1,0,.4]},
    {id:'grille',label:'Chrome grille',text:'Wide chrome front grille with the Force emblem.',p:[2.44,.98,0],n:[1,0,0]},
    {id:'orvm',label:'ORVMs',text:'Electrically adjustable mirrors with integrated LED turn indicators.',p:[.85,1.45,.98],n:[0,0,1]},
    {id:'wheels',label:'16-inch alloys',text:'16-inch alloy wheels — 235/70 R16 on EX and SX, 245/70 R16 all-terrain on the LX.',p:[1.595,.62,.9],n:[0,0,1]},
    {id:'steps',label:'Side steps',text:'Rugged side-steps for the high-set cabin.',p:[.05,.44,.95],n:[0,0,1]},
    {id:'rails',label:'Roof rails',text:'Prominent roof rails along a ladder-frame SUV stance.',p:[-.93,2.0,.5],n:[0,1,.2]},
    {id:'rear',label:'Parking sensors',text:'Reverse parking sensors built into the rear bumper on higher trims.',p:[-2.48,.64,.52],n:[-1,0,0]}];
  return{group:root,paint:M.paint,setLights,anchors,materials:M};
}
