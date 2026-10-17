import {useEffect,useRef,useState} from 'react';import {animate,useInView} from 'framer-motion';
const NUM=/^([₹$\s]*)(\d[\d,]*\.?\d*)([\s\S]*)$/;
/** Counts the first number in a string up from zero (years count up from 25 years earlier). Non-numeric text is returned untouched. */
export function useCountStr(value,run,dur=1.6){const s=String(value??'');const m=s.match(NUM);const target=m?parseFloat(m[2].replace(/,/g,'')):0;const[n,setN]=useState(0);
  useEffect(()=>{if(!m||!run)return;const from=target>=1900&&target<=2100?target-25:0;const c=animate(from,target,{duration:dur,ease:[.16,1,.3,1],onUpdate:setN});return()=>c.stop()},[run,s]);
  if(!m)return s;const dec=m[2].includes('.')?m[2].split('.')[1].length:0;
  return m[1]+(run?n:target).toLocaleString('en-IN',{minimumFractionDigits:dec,maximumFractionDigits:dec,useGrouping:m[2].includes(',')})+m[3]}
export function AnimatedValue({value,run,dur,className}){const ref=useRef(null);const inView=useInView(ref,{once:true,margin:'-40px'});const t=useCountStr(value,run??inView,dur);return<span ref={ref} className={className}>{t}</span>}
export const short=v=>String(v||'').split(/[@(]/)[0].trim();
