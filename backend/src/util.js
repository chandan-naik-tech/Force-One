/** Lets async route handlers forward errors to Express instead of crashing the process. */
export const wrap=fn=>(req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next);
