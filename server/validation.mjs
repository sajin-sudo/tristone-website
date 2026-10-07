import {submissionFiles} from './uploads.mjs';
export const services = ['Building maintenance','Electromechanical installation & maintenance','Manpower supply','Other / discuss requirements'];
export class InputError extends Error { constructor(message,status=400){super(message);this.status=status;} }
export function validate(data,kind,serviceOptions=services,formConfig=null){
  const fields=kind==='inquiry'?['name','phone','email','location','service','description','contactMethod']:['name','phone','email','location','position','experience','qualifications','availability'];
  const clean={};
  for(const key of fields){const value=data[key]||'';const field=formConfig?.fields[key];const required=field?field.enabled&&field.required:true;if(typeof value!=='string'||(required&&!value.trim())||value.length>(['description','qualifications'].includes(key)?4000:200))throw new InputError(`Please provide a valid ${field?.label||key.replace(/([A-Z])/g,' $1').toLowerCase()}.`);clean[key]=field&&!field.enabled?'':value.trim();}
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email))throw new InputError('Please enter a valid email address.');
  if(!/^\+?[\d ()-]{7,25}$/.test(clean.phone)||clean.phone.replace(/\D/g,'').length<7)throw new InputError('Please enter a valid phone number.');
  if(kind==='inquiry'){if((clean.service&&!serviceOptions.includes(clean.service))||(clean.contactMethod&&!['Email','Phone'].includes(clean.contactMethod)))throw new InputError('Please select a valid service and preferred contact method.');const field=formConfig?.fields.company;clean.company=field&&!field.enabled?'':typeof data.company==='string'?data.company.trim().slice(0,200):'';if(field?.enabled&&field.required&&!clean.company)throw new InputError(`Please provide ${field.label.toLowerCase()}.`);}
  const extra=[];for(const field of formConfig?.extras||[]){if(!field.enabled)continue;const value=data['extra_'+field.id]||'';if(typeof value!=='string'||value.length>1000||(field.required&&!value.trim()))throw new InputError(`Please provide a valid ${field.label.toLowerCase()}.`);if(field.type==='number'&&value&&(!Number.isFinite(Number(value))||Number(value)<0))throw new InputError(`Please check ${field.label.toLowerCase()}.`);if(field.type==='date'&&value&&!/^\d{4}-\d{2}-\d{2}$/.test(value))throw new InputError(`Please check ${field.label.toLowerCase()}.`);if(value)extra.push(field.label+': '+value.trim());}
  if(extra.length){const key=kind==='inquiry'?'description':'qualifications';clean[key]=(clean[key]?clean[key]+'\n\n':'')+'Additional details:\n'+extra.join('\n');if(clean[key].length>4000)throw new InputError('Please shorten the combined description and additional details to 4,000 characters.');}
  // Preserve the existing Google register schema when an owner makes a field optional.
  for(const key of fields)if(!clean[key])clean[key]='[Not provided]';
  if(data.consent!=='yes')throw new InputError('Please agree to the use of your details to respond to this submission.');
  if(!/^[a-f0-9-]{36}$/.test(data.requestId||''))throw new InputError('Please refresh the page and try again.');
  if(data.website)throw new InputError('Unable to submit this request.');
  return clean;
}
export const validateFiles=submissionFiles;
