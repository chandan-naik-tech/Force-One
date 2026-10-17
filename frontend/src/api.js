const safe=t=>{try{return t?JSON.parse(t):{}}catch{return {}}};
async function j(m,p,b){const r=await fetch('/api'+p,{method:m,credentials:'include',headers:b?{'Content-Type':'application/json'}:{},body:b?JSON.stringify(b):undefined});
  const d=safe(await r.text());if(!r.ok)throw Object.assign(new Error(d.error||'Request failed'),{status:r.status});return d}
export const api={get:p=>j('GET',p),post:(p,b)=>j('POST',p,b||{}),put:(p,b)=>j('PUT',p,b),patch:(p,b)=>j('PATCH',p,b),del:p=>j('DELETE',p)};
const xhr=(url,method,body,headers,onProgress)=>new Promise((res,rej)=>{const x=new XMLHttpRequest();x.open(method,url);x.withCredentials=url.startsWith('/api');
  Object.entries(headers||{}).forEach(([k,v])=>x.setRequestHeader(k,v));x.upload.onprogress=e=>e.lengthComputable&&onProgress?.(e.loaded/e.total);
  x.onload=()=>x.status<300?res(safe(x.responseText)):rej(new Error(safe(x.responseText).error||'Upload failed ('+x.status+')'));x.onerror=()=>rej(new Error('Network error — check your connection and storage CORS settings'));x.send(body)});
/** Uploads an image (via server, optimised) or a video (direct to bucket). Returns the saved media row, or {url} when save=false. */
export async function uploadFile(file,{category='OTHERS',onProgress,save=true}={}){
  if(file.type.startsWith('video/')){const{url,publicUrl,key}=await api.post('/media/presign',{filename:file.name,type:file.type});
    await xhr(url,'PUT',file,{'Content-Type':file.type},onProgress);if(!save)return{url:publicUrl};
    return api.post('/media',{source:'upload',url:publicUrl,key,category,title:file.name.replace(/\.[^.]+$/,'')})}
  const fd=new FormData();fd.append('category',category);fd.append('files',file);return(await xhr('/api/media/images','POST',fd,{},onProgress)).items[0]}
