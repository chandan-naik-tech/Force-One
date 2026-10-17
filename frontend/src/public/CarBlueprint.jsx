import {useId,useRef} from 'react';import {motion,useInView,useReducedMotion} from 'framer-motion';import {useCountStr} from './count';import {useLogo} from '../ctx';
/**
 * The Force One line drawing. `public/car-blueprint.webp` is the owner's drawing (transparent navy lines) and `public/car-fill.webp` its body silhouette.
 * Everything is laid out in one SVG so the reveal, the headlamp and the dimension callouts all share the drawing's coordinates.
 */
const IMG={w:1827,h:722,x:170,y:30},VB={w:2180,h:900};
const GROUND=IMG.y+IMG.h-1,WHEEL_F=[745,618],WHEEL_R=[1688,618];
const BODY={left:184,right:1982,top:42,sill:637},LAMP=[515,388],EMBLEM=[304,414];
const ease=[.65,0,.35,1],DUR=2.2;
function Dim({x,y,text,value,on,delay,rotate,anchor='middle'}){const v=useCountStr(value,on,1.8);
  return<motion.text x={x} y={y} textAnchor={anchor} transform={rotate?`rotate(-90 ${x} ${y})`:undefined} initial={{opacity:0}} animate={on?{opacity:1}:{opacity:0}} transition={{delay,duration:.6}} className="fill-ink" style={{font:'600 28px Manrope,sans-serif',letterSpacing:'.06em',paintOrder:'stroke',stroke:'#F5FAFF',strokeWidth:10,strokeLinejoin:'round'}}>
    <tspan className="fill-sky-500">{text.toUpperCase()}  </tspan>{v}</motion.text>}
/** `dims` adds animated dimension lines · `glow` adds the halo and headlamp beam (hero) · `play` overrides scroll-triggering. */
export default function CarBlueprint({dims,play,glow,className=''}){const ref=useRef(null);const inView=useInView(ref,{once:true,margin:'-80px'});const reduce=useReducedMotion();const on=play===undefined?inView:play;
  const id=useId().replace(/:/g,''),logo=useLogo(),T=reduce?0:1;
  const draw=(d,dur=1.2)=>({initial:{pathLength:reduce?1:0,opacity:reduce?1:0},animate:on?{pathLength:1,opacity:1}:{pathLength:reduce?1:0,opacity:reduce?1:0},transition:{duration:dur*T,delay:d*T,ease}});
  const fade=(d,dur=.8)=>({initial:{opacity:reduce?1:0},animate:on||reduce?{opacity:1}:{opacity:0},transition:{duration:dur*T,delay:d*T}});
  const D=dims&&{lenY:GROUND+118,wbY:GROUND+50,hX:IMG.x+IMG.w+72,clX:1080};
  const sw=2.4,tick=(x,y,vert)=>vert?<motion.line x1={x-12} x2={x+12} y1={y} y2={y} stroke="currentColor" strokeWidth={sw} {...fade(2.4)}/>:<motion.line x1={x} x2={x} y1={y-12} y2={y+12} stroke="currentColor" strokeWidth={sw} {...fade(2.4)}/>;
  const line=(d,p)=><motion.line {...p} stroke="currentColor" strokeWidth={sw} {...draw(d,1.2)}/>;
  const dash=(p)=><motion.line {...p} stroke="#9CCBFF" strokeWidth="2" strokeDasharray="6 10" {...fade(2)}/>;
  return<svg ref={ref} viewBox={dims?`0 0 ${VB.w} ${VB.h}`:`0 0 2030 ${GROUND+34}`} className={`h-auto w-full overflow-visible text-sky-500 ${className}`} style={glow?{filter:'drop-shadow(0 0 18px rgba(95,168,245,.5))'}:undefined} role="img" aria-label="Line drawing of the Force One SUV">
    <defs>
      <mask id={`rv${id}`} maskUnits="userSpaceOnUse" x="0" y="0" width={VB.w} height={VB.h}>
        <motion.rect y="0" height={VB.h} fill="#fff" initial={{attrX:reduce?0:VB.w,width:reduce?VB.w:0}} animate={on||reduce?{attrX:0,width:VB.w}:{attrX:VB.w,width:0}} transition={{duration:DUR*T,delay:.1*T,ease}}/></mask>
      <mask id={`fm${id}`} maskUnits="userSpaceOnUse" x="0" y="0" width={VB.w} height={VB.h}><image href="/car-fill.webp" x={IMG.x} y={IMG.y} width={IMG.w} height={IMG.h} preserveAspectRatio="none"/></mask>
      <linearGradient id={`fg${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F5FAFF"/><stop offset=".55" stopColor="#E3EFFF"/><stop offset="1" stopColor="#CFE5FF"/></linearGradient>
      <linearGradient id={`sh${id}`} x1="0" x2="1"><stop offset="0" stopColor="#fff" stopOpacity="0"/><stop offset=".5" stopColor="#fff" stopOpacity=".85"/><stop offset="1" stopColor="#fff" stopOpacity="0"/></linearGradient>
      <linearGradient id={`sc${id}`} x1="0" x2="1"><stop offset="0" stopColor="#5FA8F5" stopOpacity=".55"/><stop offset="1" stopColor="#5FA8F5" stopOpacity="0"/></linearGradient>
      <linearGradient id={`bm${id}`} x1="1" x2="0"><stop offset="0" stopColor="#CFE5FF" stopOpacity=".9"/><stop offset="1" stopColor="#CFE5FF" stopOpacity="0"/></linearGradient>
      <radialGradient id={`gl${id}`}><stop offset="0" stopColor="#fff"/><stop offset=".35" stopColor="#9CCBFF" stopOpacity=".8"/><stop offset="1" stopColor="#5FA8F5" stopOpacity="0"/></radialGradient></defs>
    <motion.line x1="30" x2={VB.w-30} y1={GROUND} y2={GROUND} stroke="#9CCBFF" strokeWidth="3" {...draw(0,1.6)}/>
    <g mask={`url(#rv${id})`}>
      <motion.g {...fade(1.5,1.2)}><g mask={`url(#fm${id})`}><rect x={IMG.x} y={IMG.y} width={IMG.w} height={IMG.h} fill={`url(#fg${id})`}/>
        <g transform="skewX(-20)"><motion.rect y="0" width="260" height={VB.h} fill={`url(#sh${id})`} initial={{x:-600}} animate={on&&!reduce?{x:[-600,2600]}:{x:-600}} transition={{duration:1.6,delay:(DUR+.3),ease:'easeInOut'}}/></g></g></motion.g>
      {glow&&<motion.polygon points={`${LAMP[0]-60},${LAMP[1]-8} 0,${LAMP[1]-120} 0,${LAMP[1]+190} ${LAMP[0]-60},${LAMP[1]+34}`} fill={`url(#bm${id})`} initial={{opacity:0}} animate={on?{opacity:[0,0,1,.7]}:{opacity:0}} transition={{duration:1.6*T,delay:(DUR-.2)*T,times:[0,.25,.7,1]}}/>}
      <image href="/car-blueprint.webp" x={IMG.x} y={IMG.y} width={IMG.w} height={IMG.h} preserveAspectRatio="none"/>
      <motion.image href={logo} x={EMBLEM[0]-23} y={EMBLEM[1]-23} width="46" height="46" style={{transformBox:'fill-box',transformOrigin:'center'}} initial={{opacity:0,scale:.6}} animate={on||reduce?{opacity:1,scale:1}:{}} transition={{duration:.7*T,delay:(DUR-.3)*T}}/>
      {glow&&<motion.circle cx={LAMP[0]-6} cy={LAMP[1]} r="62" fill={`url(#gl${id})`} initial={{opacity:0}} animate={on?{opacity:[0,0,1,.75,1]}:{opacity:0}} transition={{duration:1.8*T,delay:(DUR-.2)*T,times:[0,.2,.5,.75,1]}}/>}</g>
    {!reduce&&<motion.g aria-hidden="true" initial={{x:VB.w,opacity:0}} animate={on?{x:0,opacity:[0,1,1,0]}:{}} transition={{x:{duration:DUR,delay:.1,ease},opacity:{duration:DUR+.1,delay:.1,times:[0,.05,.92,1]}}}>
      <rect x="0" y="0" width="170" height={VB.h} fill={`url(#sc${id})`}/><rect x="-2" y="0" width="4" height={VB.h} fill="#2F82E0"/></motion.g>}
    {dims&&<g>
      {dash({x1:BODY.left,x2:BODY.left,y1:GROUND-30,y2:D.lenY+16})}{dash({x1:BODY.right,x2:BODY.right,y1:GROUND-30,y2:D.lenY+16})}
      {dash({x1:WHEEL_F[0],x2:WHEEL_F[0],y1:WHEEL_F[1],y2:D.wbY+16})}{dash({x1:WHEEL_R[0],x2:WHEEL_R[0],y1:WHEEL_R[1],y2:D.wbY+16})}
      {dash({x1:1840,x2:D.hX+16,y1:BODY.top,y2:BODY.top})}
      {line(2.1,{x1:BODY.left,x2:BODY.right,y1:D.lenY,y2:D.lenY})}{tick(BODY.left,D.lenY)}{tick(BODY.right,D.lenY)}
      {line(2.2,{x1:WHEEL_F[0],x2:WHEEL_R[0],y1:D.wbY,y2:D.wbY})}{tick(WHEEL_F[0],D.wbY)}{tick(WHEEL_R[0],D.wbY)}
      {line(2.3,{x1:D.hX,x2:D.hX,y1:BODY.top,y2:GROUND})}{tick(D.hX,BODY.top,1)}{tick(D.hX,GROUND,1)}
      {line(2.4,{x1:D.clX,x2:D.clX,y1:BODY.sill,y2:GROUND})}{tick(D.clX,BODY.sill,1)}{tick(D.clX,GROUND,1)}
      {dims.length&&<Dim x={(BODY.left+BODY.right)/2} y={D.lenY-16} text="Length" value={dims.length} on={on} delay={2.6}/>}
      {dims.wheelbase&&<Dim x={(WHEEL_F[0]+WHEEL_R[0])/2} y={D.wbY-16} text="Wheelbase" value={dims.wheelbase} on={on} delay={2.7}/>}
      {dims.height&&<Dim x={D.hX+36} y={(BODY.top+GROUND)/2} text="Height" value={dims.height} on={on} delay={2.8} rotate/>}
      {dims.clearance&&<Dim x={D.clX+22} y={(BODY.sill+GROUND)/2+10} text="Clearance" value={dims.clearance} on={on} delay={2.9} anchor="start"/>}</g>}
  </svg>}
