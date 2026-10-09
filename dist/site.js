const menu=document.querySelector('.menu-toggle');menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));document.querySelector('nav').classList.toggle('open',open);});
const form=document.querySelector('form[data-kind]');
if(form){
 const button=form.querySelector('button[type="submit"]');const submitLabel=button.textContent;const notice=document.querySelector('[data-connection]');const error=form.querySelector('[data-error]');const kind=form.dataset.kind;let widget=null,busy=false;let requestId=crypto.randomUUID();let token='';
 const service=form.querySelector('[name="service"]');if(service){const selected=new URLSearchParams(location.search).get('service');if([...service.options].some(o=>o.value===selected))service.value=selected;}
 const position=form.querySelector('[name="position"]');if(position){const selected=new URLSearchParams(location.search).get('position');if(selected)position.value=selected.slice(0,200);}
 const fail=(message)=>{error.textContent=message;error.hidden=false;error.setAttribute('tabindex','-1');error.focus();};
 form.addEventListener('input',()=>{if(!busy)requestId=crypto.randomUUID();});
 form.addEventListener('change',()=>{if(!busy)requestId=crypto.randomUUID();});
 async function configure(){try{const response=await fetch('/api/config');if(!response.ok)throw new Error();const config=await response.json();if(!config.ready){notice.textContent='Online submissions are being connected. For now, please email '+(config.email||'admin@tristone.ae')+'. This form will not save or send a request yet.';return;}
 notice.textContent='Your submission and attachments will be saved securely for our team to review.';
 const script=document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';script.async=true;script.onload=()=>{widget=window.turnstile.render(form.querySelector('[data-security]'),{sitekey:config.siteKey,action:kind,callback:value=>{token=value;button.disabled=busy;},'expired-callback':()=>{token='';button.disabled=true;},'error-callback':()=>{token='';button.disabled=true;fail('Security check unavailable. Please refresh or email admin@tristone.ae.');}});};script.onerror=()=>fail('Unable to load the security check. Please refresh or email admin@tristone.ae.');document.head.append(script);
 }catch{notice.textContent='Online submissions are temporarily unavailable. Please email admin@tristone.ae.';}}
 configure();
 form.addEventListener('submit',async event=>{event.preventDefault();if(busy||!token||!form.reportValidity())return;busy=true;button.disabled=true;error.hidden=true;button.textContent='Submitting…';
 try{const data=new FormData(form);const files=data.getAll('files').filter(f=>f.size);if(files.some(f=>f.size>5*1024*1024)||files.reduce((n,f)=>n+f.size,0)>10*1024*1024||files.length>(kind==='application'?1:3))throw new Error('Please check the file limits shown below the upload field.');data.set('requestId',requestId);data.set('turnstileToken',token);
 const response=await fetch(kind==='inquiry'?'/api/inquiries':'/api/applications',{method:'POST',body:data});const result=await response.json();if(!response.ok||!result.ok||!result.reference)throw new Error(result.error||'Your submission was not confirmed. Please retry or email admin@tristone.ae.');
 form.hidden=true;notice.hidden=true;const success=document.querySelector('[data-success]');success.hidden=false;success.querySelector('[data-reference]').textContent=result.reference;success.tabIndex=-1;success.focus();success.scrollIntoView({block:'center'});
 }catch(e){fail(e.message||'We could not confirm the save. Please retry.');if(widget!==null){token='';window.turnstile.reset(widget);}}
 finally{busy=false;button.disabled=!token;button.textContent=submitLabel;}});
}
