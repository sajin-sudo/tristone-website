
import fs from 'node:fs';import path from 'node:path';import {renderPage,routes} from '../server/render.mjs';
const out='dist';const content=JSON.parse(fs.readFileSync('content/site.json','utf8'));const hosting={project_id:'appgprj_6ac3b66c2ee08191954203362b8fc1bd',d1:'DB',r2:'BUCKET'};
const origin='https://tristone-building-maintenance.sajinrajdme.chatgpt.site';fs.mkdirSync(out,{recursive:true});
for(const file of routes)fs.writeFileSync(path.join(out,file),renderPage(content,file,origin));
for(const file of ['site.js','admin.js','admin.html','styles.css'])fs.copyFileSync('web/'+file,path.join(out,file));
fs.appendFileSync(out+'/styles.css',fs.readFileSync('web/refinements.css','utf8'));
fs.writeFileSync(out+'/robots.txt',`User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin.html\nSitemap: ${origin}/sitemap.xml\n`);
fs.writeFileSync(out+'/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map(f=>`<url><loc>${origin}/${f==='index.html'?'':f}</loc></url>`).join('')}</urlset>`);
const types={html:'text/html; charset=utf-8',css:'text/css; charset=utf-8',js:'text/javascript; charset=utf-8',png:'image/png',jpg:'image/jpeg',xml:'application/xml',txt:'text/plain; charset=utf-8'};const assets={};
for(const file of [...routes,'site.js','admin.js','admin.html','styles.css','logo.png','banner.png','photos/technician.jpg','photos/tools.jpg','photos/safety.jpg','photos/equipment.jpg','robots.txt','sitemap.xml']){const ext=file.split('.').pop();const binary=['png','jpg'].includes(ext);assets['/'+file]={type:types[ext],encoding:binary?'base64':'text',content:fs.readFileSync(path.join(out,file),binary?'base64':'utf8')};}
// Admin resources are embedded behind Worker authorization, never public static files.
fs.unlinkSync(out+'/admin.html');fs.unlinkSync(out+'/admin.js');
fs.mkdirSync(out+'/server',{recursive:true});fs.writeFileSync(out+'/server/assets.mjs','export const assets='+JSON.stringify(assets)+';');fs.writeFileSync(out+'/server/defaults.mjs','export const defaults='+JSON.stringify(content)+';');
for(const file of ['validation.mjs','cms.mjs','render.mjs','content-schema.mjs','sections.mjs'])fs.copyFileSync('server/'+file,out+'/server/'+file);fs.copyFileSync('server/worker.mjs',out+'/server/index.js');
fs.writeFileSync('.openai/hosting.json',JSON.stringify(hosting,null,2));fs.mkdirSync(out+'/.openai',{recursive:true});fs.copyFileSync('.openai/hosting.json',out+'/.openai/hosting.json');fs.cpSync('drizzle',out+'/.openai/drizzle',{recursive:true});console.log('Built five main pages, separate forms, privacy/portfolio and persistent admin CMS.');
