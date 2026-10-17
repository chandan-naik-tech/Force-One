export const CATEGORIES=['FRONT','REAR','SIDE','INTERIOR','ENGINE','TRAVEL','ADVENTURES','MEMORIES','OTHERS'];
export const FEATURE_CATS=['DESIGN','INTERIOR','COMFORT','PERFORMANCE','SAFETY','UTILITY','TRAVEL'];
export const isVideoUrl=u=>/\.(mp4|webm|mov)(\?|$)/i.test(u||'');
export const ytId=u=>(u||'').match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/)?.[1];
export const fmtDate=d=>d?new Date(d).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}):'';
