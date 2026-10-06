/* TriStone website backend. Deploy as the authorised company account, execute as Me.
 * Google credentials and BRIDGE_SECRET remain server-side. Never publish the Sheets.
 */
const WEBSITE_FOLDER = '1u7PMcMaF8M_LCQwwA9L7IB8MqaPmhwjI';
const VACANCY_SHEET = '1s3eAD-vJwr6AKRpGkK5F51Lkbm49oT0W2XAoHCJZaPU';
const INQUIRY_HEADERS = ['Received','Reference','Name','Company','Phone','Email','Location','Service','Description','Preferred contact','Files folder','File links','Request ID','Digest'];
const CANDIDATE_HEADERS = ['Received','Reference','Name','Phone','Email','Current location','Position','Experience','Qualifications','Availability','CV folder','CV links','Request ID','Digest'];

function setupWebsiteBackend() {
  const lock = LockService.getScriptLock(); lock.waitLock(30000);
  try {
    const props = PropertiesService.getScriptProperties();
    const parent = DriveApp.getFolderById(WEBSITE_FOLDER);
    function folder(key, name) { if (!props.getProperty(key)) props.setProperty(key, parent.createFolder(name).getId()); }
    function sheet(key, name, headers) {
      if (props.getProperty(key)) return;
      const ss = SpreadsheetApp.create(name); props.setProperty(key, ss.getId());
      DriveApp.getFileById(ss.getId()).moveTo(parent);
      const tab = ss.getSheets()[0];tab.setName(name);tab.appendRow(headers);tab.setFrozenRows(1);tab.getRange(1,1,1,headers.length).setFontWeight('bold').setBackground('#082750').setFontColor('#ffffff');
      ss.setSpreadsheetTimeZone('Asia/Dubai');
    }
    folder('INQUIRY_FOLDER', 'Customer Inquiry Files'); folder('CV_FOLDER', 'Candidate CVs');
    sheet('INQUIRY_SHEET','Customer Inquiries',INQUIRY_HEADERS);
    sheet('CANDIDATE_SHEET','Candidate Applications',CANDIDATE_HEADERS);
    sheet('PROJECT_SHEET','Project Portfolio',['Project ID','Title','Location','Description','Photo URL','Status']);
    if (!props.getProperty('BRIDGE_SECRET')) props.setProperty('BRIDGE_SECRET', Utilities.getUuid()+Utilities.getUuid()+Utilities.getUuid());
    // Visible only to the script owner in their private execution log.
    console.log('Setup complete. Keep the Sheets private.');
    console.log('Project Portfolio: https://docs.google.com/spreadsheets/d/'+props.getProperty('PROJECT_SHEET')+'/edit');
    console.log('Customer Inquiries: https://docs.google.com/spreadsheets/d/'+props.getProperty('INQUIRY_SHEET')+'/edit');
    console.log('Candidate Applications: https://docs.google.com/spreadsheets/d/'+props.getProperty('CANDIDATE_SHEET')+'/edit');
  } finally { lock.releaseLock(); }
}
function equalSignature(a,b) { if(typeof a!=='string'||typeof b!=='string'||a.length!==b.length)return false;let result=0;for(let i=0;i<a.length;i++)result|=a.charCodeAt(i)^b.charCodeAt(i);return result===0; }
function hex(bytes) { return bytes.map(b=>('0'+((b+256)%256).toString(16)).slice(-2)).join(''); }
function safeCell(value) { const s=String(value||'');return /^[=+\-@\t\r]/.test(s)?"'"+s:s; }
function resultJson(data) { return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON); }
function doGet() { return resultJson({ok:false,error:'Use the website to submit requests.'}); }
function doPost(e) {
  try {
    if(!e||!e.postData||e.postData.contents.length>16*1024*1024)throw new Error('Invalid request');
    const envelope=JSON.parse(e.postData.contents);const props=PropertiesService.getScriptProperties();const secret=props.getProperty('BRIDGE_SECRET');
    if(!secret||typeof envelope.payload!=='string')throw new Error('Not configured');
    const expected=hex(Utilities.computeHmacSha256Signature(envelope.payload,secret,Utilities.Charset.UTF_8));
    if(!equalSignature(envelope.signature,expected))throw new Error('Unauthorised');
    const data=JSON.parse(envelope.payload);if(!Number.isFinite(data.timestamp)||Math.abs(Date.now()-data.timestamp)>5*60*1000)throw new Error('Expired request');
    if(data.operation==='content')return resultJson(readWebsiteContent(props));
    if(data.operation==='photo')return resultJson(readPublishedProjectPhoto(data,props));
    if(data.operation!=='submit'||!['inquiry','application'].includes(data.kind)||!/^[a-f0-9-]{36}$/.test(data.requestId))throw new Error('Invalid operation');
    return resultJson(saveWebsiteSubmission(data,props));
  }catch(error){return resultJson({ok:false,error:'The request could not be saved. Please retry.'});}
}
function saveWebsiteSubmission(data,props) {
  const inquiry=data.kind==='inquiry';const fields=data.fields||{};
  const required=inquiry?['name','phone','email','location','service','description','contactMethod']:['name','phone','email','location','position','experience','qualifications','availability'];
  required.forEach(key=>{if(typeof fields[key]!=='string'||!fields[key].trim()||fields[key].length>4000)throw new Error('Invalid field');});
  const files=data.files||[];if(!Array.isArray(files)||files.length>(inquiry?3:1)||(!inquiry&&files.length!==1))throw new Error('Invalid files');
  let total=0;const decoded=files.map(file=>{
    const types=['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document'].concat(inquiry?['image/png','image/jpeg']:[]);
    if(!types.includes(file.mime)||typeof file.data!=='string'||typeof file.name!=='string')throw new Error('Invalid file');
    const bytes=Utilities.base64Decode(file.data);total+=bytes.length;if(!bytes.length||bytes.length>5*1024*1024||total>10*1024*1024)throw new Error('File too large');
    return Utilities.newBlob(bytes,file.mime,file.name.replace(/[^\w. -]/g,'_').slice(0,120));
  });
  const digest=hex(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,JSON.stringify({kind:data.kind,fields:fields,files:files}),Utilities.Charset.UTF_8));
  const lock=LockService.getScriptLock();lock.waitLock(25000);
  let folder=null;let committed=false;
  try{
    const tab=SpreadsheetApp.openById(props.getProperty(inquiry?'INQUIRY_SHEET':'CANDIDATE_SHEET')).getSheets()[0];
    const count=tab.getLastRow();if(count>1){const rows=tab.getRange(2,13,count-1,2).getValues();for(let i=0;i<rows.length;i++)if(rows[i][0]===data.requestId){if(rows[i][1]!==digest)throw new Error('Request changed');return {ok:true,reference:tab.getRange(i+2,2).getValue()};}}
    const reference=(inquiry?'INQ-':'APP-')+Utilities.formatDate(new Date(),'Asia/Dubai','yyyyMMdd')+'-'+Utilities.getUuid().slice(0,8).toUpperCase();
    const urls=[];if(decoded.length){folder=DriveApp.getFolderById(props.getProperty(inquiry?'INQUIRY_FOLDER':'CV_FOLDER')).createFolder(reference);decoded.forEach(blob=>urls.push(folder.createFile(blob).getUrl()));}
    const row=inquiry?[new Date(),reference,fields.name,fields.company,fields.phone,fields.email,fields.location,fields.service,fields.description,fields.contactMethod,folder?folder.getUrl():'',urls.join('\n'),data.requestId,digest]:[new Date(),reference,fields.name,fields.phone,fields.email,fields.location,fields.position,fields.experience,fields.qualifications,fields.availability,folder?folder.getUrl():'',urls.join('\n'),data.requestId,digest];
    tab.appendRow(row.map((v,i)=>i===0?v:safeCell(v)));SpreadsheetApp.flush();committed=true;
    return {ok:true,reference:reference};
  }catch(error){
    // Preserve attachments if appendRow may have succeeded but flush/response failed.
    // On retry the durable Request ID finds the same record. Never delete linked files.
    if(folder&&!committed){const tab=SpreadsheetApp.openById(props.getProperty(inquiry?'INQUIRY_SHEET':'CANDIDATE_SHEET')).getSheets()[0];const count=tab.getLastRow();const exists=count>1&&tab.getRange(2,13,count-1,1).getValues().some(r=>r[0]===data.requestId);if(!exists)folder.setTrashed(true);}
    throw error;
  }finally{lock.releaseLock();}
}
function readWebsiteContent(props) {
  const projects=[];const sheetId=props.getProperty('PROJECT_SHEET');
  if(sheetId){const rows=SpreadsheetApp.openById(sheetId).getSheets()[0].getDataRange().getDisplayValues();rows.slice(1).forEach(r=>{if(r[5]==='Published'&&r[0]&&r[1]&&r[2]&&r[3]){const drivePhoto=drivePhotoId(r[4]);projects.push({id:r[0],title:r[1].slice(0,200),location:r[2].slice(0,200),description:r[3].slice(0,4000),photo:drivePhoto?'/api/project-photo?id='+encodeURIComponent(r[0]):/^https:\/\//.test(r[4])?r[4]:''});}});}
  const jobs=[];const rows=SpreadsheetApp.openById(VACANCY_SHEET).getSheetByName('Vacancies').getDataRange().getValues();
  rows.slice(1).forEach(r=>{if(r[7]!=='Published'||!r[1]||!r[2]||!r[5])return;const closing=r[6] instanceof Date?Utilities.formatDate(r[6],'Asia/Dubai','yyyy-MM-dd'):String(r[6]||'');if(closing&&closing<Utilities.formatDate(new Date(),'Asia/Dubai','yyyy-MM-dd'))return;jobs.push({id:String(r[0]),title:String(r[1]).slice(0,200),location:String(r[2]).slice(0,200),type:String(r[3]),requirements:String(r[5]).slice(0,4000),closing:closing});});
  return {ok:true,projects:projects.slice(0,50),jobs:jobs.slice(0,50)};
}
function drivePhotoId(url) {
  if(!/^https:\/\/drive\.google\.com\//.test(String(url)))return null;
  const match=String(url).match(/\/file\/d\/([\w-]+)/)||String(url).match(/[?&]id=([\w-]+)/);return match?match[1]:null;
}
function readPublishedProjectPhoto(data,props) {
  if(typeof data.projectId!=='string'||data.projectId.length>100)throw new Error('Invalid project');
  const rows=SpreadsheetApp.openById(props.getProperty('PROJECT_SHEET')).getSheets()[0].getDataRange().getDisplayValues();
  const row=rows.slice(1).find(r=>r[0]===data.projectId&&r[5]==='Published'&&r[1]&&r[2]&&r[3]);if(!row)throw new Error('Project not published');
  const id=drivePhotoId(row[4]);if(!id)throw new Error('Photo unavailable');
  const file=DriveApp.getFileById(id);if(!['image/png','image/jpeg'].includes(file.getMimeType())||file.getSize()>5*1024*1024)throw new Error('Unsupported photo');
  // Only IDs explicitly selected in a Published portfolio row can be retrieved.
  return {ok:true,mime:file.getMimeType(),data:Utilities.base64Encode(file.getBlob().getBytes())};
}
