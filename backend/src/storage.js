import fs from 'fs';import path from 'path';import {fileURLToPath} from 'url';
import {S3Client,PutObjectCommand,DeleteObjectCommand} from '@aws-sdk/client-s3';import {getSignedUrl} from '@aws-sdk/s3-request-presigner';
/** Cloud mode when S3_BUCKET is set; otherwise files go to frontend/public/uploads (or backend/uploads). */
export const isLocal=!process.env.S3_BUCKET;
const frontendUploads = fileURLToPath(new URL('../../frontend/public/uploads', import.meta.url));
const backendUploads = fileURLToPath(new URL('../uploads', import.meta.url));
export const uploadDir = path.resolve(process.env.UPLOAD_DIR || (fs.existsSync(frontendUploads) ? frontendUploads : backendUploads));
export const legacyUploadDir = path.resolve(backendUploads);

export const localPath=k=>{const p=path.join(uploadDir,k);if(!p.startsWith(uploadDir+path.sep))throw new Error('Invalid key');return p};
const Bucket=process.env.S3_BUCKET;
const s3=isLocal?null:new S3Client({region:process.env.S3_REGION||'auto',endpoint:process.env.S3_ENDPOINT||undefined,forcePathStyle:!!process.env.S3_ENDPOINT,
  credentials:{accessKeyId:process.env.S3_ACCESS_KEY_ID||'',secretAccessKey:process.env.S3_SECRET_ACCESS_KEY||''}});
export const publicUrl=k=>isLocal?`/uploads/${k}`:`${(process.env.S3_PUBLIC_URL||'').replace(/\/$/,'')}/${k}`;
export async function put(Key,Body,ContentType){
  if(isLocal){
    const p=localPath(Key);
    await fs.promises.mkdir(path.dirname(p),{recursive:true});
    await fs.promises.writeFile(p,Body);
    // Also keep backend/uploads synced if different
    if(legacyUploadDir !== uploadDir){
      try {
        const lp = path.join(legacyUploadDir, Key);
        await fs.promises.mkdir(path.dirname(lp),{recursive:true});
        await fs.promises.writeFile(lp,Body);
      } catch {}
    }
    return publicUrl(Key);
  }
  await s3.send(new PutObjectCommand({Bucket,Key,Body,ContentType,CacheControl:'public,max-age=31536000,immutable'}));return publicUrl(Key)}
export const remove=keys=>Promise.allSettled(keys.filter(Boolean).map(Key=>{
  if(isLocal){
    const p1 = fs.promises.unlink(localPath(Key)).catch(()=>{});
    const p2 = legacyUploadDir !== uploadDir ? fs.promises.unlink(path.join(legacyUploadDir,Key)).catch(()=>{}) : Promise.resolve();
    return Promise.all([p1, p2]);
  }
  return s3.send(new DeleteObjectCommand({Bucket,Key}));
}));
export const presign=async(Key,ContentType)=>isLocal?{key:Key,url:`/api/media/local/${Key}`,publicUrl:publicUrl(Key)}
  :{key:Key,url:await getSignedUrl(s3,new PutObjectCommand({Bucket,Key,ContentType}),{expiresIn:600}),publicUrl:publicUrl(Key)};
