// Public read-only feed for the private Tri Stone Careers Vacancy Register.
// This script exposes only complete Published vacancy records. It never reads applications.
const CAREERS_SHEET_ID = '1s3eAD-vJwr6AKRpGkK5F51Lkbm49oT0W2XAoHCJZaPU';
function setupCareersFeed() {
  const ss = SpreadsheetApp.openById(CAREERS_SHEET_ID);
  const sheet = ss.getSheetByName('Vacancies');
  if (!sheet) throw new Error('Vacancies tab not found.');
  console.log('Register verified: '+ss.getUrl());
  console.log('Deploy as a Web app: Execute as Me; access Anyone. Send the /exec URL to connect the Careers page.');
}
function doGet() {
  try {
    const sheet = SpreadsheetApp.openById(CAREERS_SHEET_ID).getSheetByName('Vacancies');
    if (!sheet) throw new Error('Vacancy register unavailable');
    const last = Math.min(sheet.getLastRow(),1001);
    const rows = last>1 ? sheet.getRange(2,1,last-1,8).getValues() : [];
    const today = Utilities.formatDate(new Date(),'Asia/Dubai','yyyy-MM-dd');
    const jobs = [];
    const seen = new Set();
    rows.forEach(r=>{
      if (String(r[7]).trim()!=='Published') return;
      const id=String(r[0]).trim(),title=String(r[1]).trim(),requirements=String(r[5]).trim();
      if(!id||!title||!requirements||seen.has(id))return;
      let closingDate='';
      if(r[6]){if(!(r[6] instanceof Date)||isNaN(r[6].getTime()))return;closingDate=Utilities.formatDate(r[6],'Asia/Dubai','yyyy-MM-dd');if(closingDate<today)return;}
      const count=Number(r[4]);
      seen.add(id);
      jobs.push({id:id.slice(0,80),title:title.slice(0,160),location:String(r[2]).slice(0,200),employmentType:String(r[3]).slice(0,100),headcount:Number.isInteger(count)&&count>0?count:null,requirements:requirements.slice(0,5000),closingDate,status:'Published'});
    });
    return ContentService.createTextOutput(JSON.stringify({status:'success',jobs})).setMimeType(ContentService.MimeType.JSON);
  } catch(e) {
    return ContentService.createTextOutput(JSON.stringify({status:'error',jobs:null,message:'Vacancies temporarily unavailable.'})).setMimeType(ContentService.MimeType.JSON);
  }
}
