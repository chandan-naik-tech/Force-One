import {defineConfig,loadEnv} from 'vite';import react from '@vitejs/plugin-react';
export default defineConfig(({mode})=>{const target=loadEnv(mode,process.cwd(),'').VITE_API_TARGET||'http://localhost:4000';
  return{plugins:[react()],server:{port:5173,proxy:{'/api':target,'/uploads':target}},
    build:{rollupOptions:{output:{manualChunks:{vendor:['react','react-dom','react-router-dom'],motion:['framer-motion']}}}}}});
