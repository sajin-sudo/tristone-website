import {assets} from './assets.mjs';
import {validate,validateFiles,InputError} from './validation.mjs';
import {readContent,owner,saveContent,uploadImage,CmsError} from './cms.mjs';
import {renderPage,routes} from './render.mjs';
import {SecurityError,requireOrigin,approvedOrigin,rateLimit,reserveStorage,readBounded,verifyGateway,trustOwner,trustedOwner,trustClient,trustedClient,digest} from './security.mjs';
const encoder=new TextEncoder();
const headers={'X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','X-Frame-Options':'DENY','Permissions-Policy':'camera=(), microphone=(), geolocation=()','Content-Security-Policy':"default-src 'self'; script-src 'self' https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; style-src 'self'; img-src 'self' https: data:; connect-src 'self' https://challenges.cloudflare.com; base-uri 'self'; form-action 'self'; object-src 'none'; frame-ancestors 'none'"};
export const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{...headers,'Content-Type':'application/json','Cache-Control':'no-store'}});
export async function sign(value,secret){const key=await crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return [...new Uint8Array(await crypto.subtle.sign('HMAC',key,encoder.encode(value)))].map(x=>x.toString(16).padStart(2,'0')).join('');}
function ready(env){return !!(env.GOOGLE_SCRIPT_URL&&/^[a-f0-9]{64}$/.test(env.GOOGLE_BRIDGE_SECRET||'')&&env.TURNSTILE_SECRET_KEY&&env.TURNSTILE_SITE_KEY);}
async function bridge(env,operation,data,fetcher){
  const url=new URL(env.GOOGLE_SCRIPT_URL);if(url.protocol!=='https:'||url.username||url.password||url.port||url.search||url.hash||url.hostname!=='script.google.com'||!/^\/macros\/s\/[^/]+\/exec$/.test(url.pathname))throw new Error('Invalid backend configuration');
  const payload=JSON.stringify({version:2,audience:'tristone-submissions-v2',operation,timestamp:Date.now(),nonce:crypto.randomUUID(),...data});const signature=await sign(payload,env.GOOGLE_BRIDGE_SECRET);
  const response=await fetcher(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({payload,signature}),signal:AbortSignal.timeout(30000)});
  if(!response.ok)throw new Error('Storage unavailable');const result=await response.json();if(!result.ok)throw new Error('Storage did not confirm saving');return result;
}
async function internalHandle(request,env={},fetcher=fetch){
 const url=new URL(request.url);const path=url.pathname;
 try{
  if(url.protocol!=='https:'&&(path.startsWith('/api/')||path.startsWith('/_gateway/')||path.startsWith('/admin')))throw new SecurityError('HTTPS is required.');
  if(request.method==='OPTIONS'){const origin=requireOrigin(request,env);return new Response(null,{status:204,headers:{...headers,'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'GET, POST, PUT, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Vary':'Origin'}});}
  const gateway=await verifyGateway(request,env);if(gateway){requireOrigin(request,env);const id=trustedOwner(request),client=trustedClient(request);request=new Request(request,{...(!['GET','HEAD'].includes(request.method)?{body:gateway.body}:{})});trustClient(request,client);if(id)trustOwner(request,id);}
  if(path.startsWith('/_gateway/')){if(!gateway||request.method!=='POST')throw new SecurityError('Not found.',404);requireOrigin(request,env);if(path==='/_gateway/rate-login'){await rateLimit(request,env,'login');return json({ok:true});}if(path==='/_gateway/session'){const data=await request.json();if(!/^[a-f0-9]{64}$/.test(data.token||'')||!Number.isSafeInteger(data.step)||Math.abs(data.step-Math.floor(Date.now()/30000))>1)throw new SecurityError('Invalid login.',401);const used=await env.DB.prepare('INSERT INTO security_counters (id, used, expires) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET used = excluded.used WHERE used < excluded.used RETURNING used').bind('totp:last',data.step,0).first();if(!used)throw new SecurityError('Authenticator code has already been used.',401);await env.DB.prepare('INSERT INTO admin_sessions (id, expires) VALUES (?, ?)').bind(await digest(data.token),Date.now()+900000).run();return json({ok:true});}if(path==='/_gateway/logout'){if(gateway.session)await env.DB.prepare('DELETE FROM admin_sessions WHERE id = ?').bind(await digest(gateway.session)).run();return json({ok:true});}throw new SecurityError('Not found.',404);}

  if(['/admin.html','/admin.js','/admin'].includes(path)){
   try{owner(request,env);}catch(error){if(error.status===401&&path!=='/admin.js')return new Response(null,{status:302,headers:{...headers,'Cache-Control':'no-store',Location:'/signin-with-chatgpt?return_to=%2Fadmin.html'}});return new Response('Not found',{status:404,headers:{...headers,'Cache-Control':'no-store'}});}
   if(!['GET','HEAD'].includes(request.method))return json({error:'Method not allowed'},405);
   const asset=assets[path==='/admin'?'/admin.html':path];return new Response(request.method==='HEAD'?null:asset.content,{headers:{...headers,'Content-Type':asset.type,'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'}});
  }
  if(path.startsWith('/api/admin/')){
   owner(request,env);
   if(!['GET','HEAD'].includes(request.method)&&!approvedOrigin(request.headers.get('origin'),env))throw new CmsError('Please save from the website editor.',403);
   if(path==='/api/admin/content'&&request.method==='GET')return json(await readContent(env));
   if(path==='/api/admin/content'&&request.method==='PUT')return json(await saveContent(request,env));
   if(path==='/api/admin/images'&&request.method==='POST')return json(await uploadImage(request,env),201);
   return json({error:'Not found'},404);
  }
  if(path.startsWith('/media/')){
   if(!['GET','HEAD'].includes(request.method)||!/^\/media\/[a-f0-9-]{36}\.(png|jpg)$/.test(path)||!env.BUCKET)return new Response('Not found',{status:404,headers});
   const object=await env.BUCKET.get(path.slice(7));if(!object)return new Response('Not found',{status:404,headers});return new Response(request.method==='HEAD'?null:object.body,{headers:{...headers,'Content-Type':object.httpMetadata.contentType,'Cache-Control':'public, max-age=86400','ETag':object.httpEtag}});
  }
  if(path==='/api/config'){const current=await readContent(env);return json({ready:ready(env),siteKey:ready(env)?env.TURNSTILE_SITE_KEY:null,email:current.content.email});}
  if(path==='/api/content'){
    const current=await readContent(env);const today=new Date().toISOString().slice(0,10);return json({projects:current.content.projects.filter(x=>x.status==='Published').map(x=>({id:x.id,title:x.title,location:x.location,description:x.description,photo:x.image})),jobs:current.content.jobs.filter(x=>x.status==='Published'&&(!x.closing||x.closing>=today)),connected:true});
  }
  if(['/api/inquiries','/api/applications'].includes(path)){
   if(request.method!=='POST')return json({error:'Method not allowed.'},405);
   requireOrigin(request,env);
   await rateLimit(request,env);
   if(!ready(env))return json({error:'Online submissions are being connected. Please email admin@tristone.ae. No record has been saved.'},503);
   if(Number(request.headers.get('content-length')||0)>11*1024*1024)throw new InputError('The upload is too large.',413);
   const type=request.headers.get('content-type')||'';if(!type.startsWith('multipart/form-data'))throw new InputError('Invalid form format.');
   const bodyBytes=await readBounded(request,11*1024*1024);
   const form=await new Response(new Blob([bodyBytes]),{headers:{'Content-Type':type}}).formData();
   const kind=path==='/api/inquiries'?'inquiry':'application';const data={};for(const [k,v]of form)if(typeof v==='string')data[k]=v;
   const current=await readContent(env);const clean=validate(data,kind,current.content.services.map(s=>s.value).concat('Other / discuss requirements'),current.content.forms[kind]);const pendingFiles=form.getAll('files').filter(f=>typeof f!=='string'&&f.size);
   const verify=await fetcher('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({secret:env.TURNSTILE_SECRET_KEY,response:data.turnstileToken||'',remoteip:trustedClient(request),idempotency_key:data.requestId}),signal:AbortSignal.timeout(10000)});
   const proof=await verify.json();if(!verify.ok||!proof.success||proof.hostname!==new URL(request.headers.get('origin')).hostname||proof.action!==kind)throw new InputError('Please complete the security check and try again.',403);
   const files=await validateFiles(pendingFiles,kind);await reserveStorage(env,files.reduce((n,f)=>n+f.size,0));
   const result=await bridge(env,'submit',{kind,requestId:data.requestId,fields:clean,files},fetcher);
   if(!/^(INQ|APP)-[A-Z0-9-]{8,60}$/.test(result.reference||''))throw new Error('Invalid storage acknowledgement');
   return json({ok:true,reference:result.reference},201);
  }
  if(path.startsWith('/api/'))return json({error:'Not found.'},404);
  if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405,headers});
  if(path==='/company.html')return Response.redirect(url.origin+'/about.html',301);
  const file=path==='/'?'index.html':path.slice(1);
  if(routes.includes(file)){const current=await readContent(env);const origin=env.PUBLIC_ORIGIN||url.origin;return new Response(request.method==='HEAD'?null:renderPage(current.content,file,origin),{headers:{...headers,'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}});}
  const asset=assets[path==='/'?'/index.html':path];if(!asset)return new Response('Page not found',{status:404,headers});
  const body=asset.encoding==='base64'?Uint8Array.from(atob(asset.content),c=>c.charCodeAt(0)):asset.content;
  return new Response(request.method==='HEAD'?null:body,{headers:{...headers,'Content-Type':asset.type,'Cache-Control':asset.type.startsWith('text/html')?'no-cache':'public, max-age=3600'}});
 }catch(error){if(error instanceof InputError||error instanceof CmsError||error instanceof SecurityError)return json({error:error.message},error.status);if(path.startsWith('/api/admin/'))return json({error:'The editor is temporarily unavailable. Your changes have not been confirmed.'},503);if(!path.startsWith('/api/'))return new Response('This page is temporarily unavailable. Please try again.',{status:503,headers});return json({error:'We could not confirm your submission. Please retry with the same form, or email admin@tristone.ae. No confirmation reference has been issued.'},502);}
}
export async function handle(request,env={},fetcher=fetch){const response=await internalHandle(request,env,fetcher);const origin=request.headers.get('origin');if(!approvedOrigin(origin,env))return response;const resultHeaders=new Headers(response.headers);resultHeaders.set('Access-Control-Allow-Origin',origin);resultHeaders.set('Vary','Origin');return new Response(response.body,{status:response.status,headers:resultHeaders});}
export default {fetch(request,env){const id=request.headers.get('oai-authenticated-user-id'),email=request.headers.get('oai-authenticated-user-email');if(id&&email&&env.CMS_ADMIN_EMAIL&&email.toLowerCase()===env.CMS_ADMIN_EMAIL.toLowerCase())trustOwner(request,id);trustClient(request,request.headers.get('CF-Connecting-IP')||'unknown');return handle(request,env);}};
