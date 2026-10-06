/** Run setupTristoneEnquiries from Google Apps Script while signed in as admin@tristone.ae.
 * Creates a public customer enquiry form and a private response spreadsheet
 * in the verified Tri stone website folder. No email messages are sent.
 * Reruns reuse the same form and spreadsheet through Script Properties.
 */
function setupTristoneEnquiries() {
  const expectedAccount = 'admin@tristone.ae';
  const account = Session.getEffectiveUser().getEmail().toLowerCase();
  if (account !== expectedAccount) throw new Error('Sign in as admin@tristone.ae before running this setup. Current account: ' + (account || 'unavailable'));
  const folder = DriveApp.getFolderById('1u7PMcMaF8M_LCQwwA9L7IB8MqaPmhwjI');
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const props = PropertiesService.getScriptProperties();
    let formId = props.getProperty('TRISTONE_FORM_ID');
    const form = formId ? FormApp.openById(formId) : FormApp.create('Tri Stone | Project & Manpower Enquiries', false);
    if (!formId) { formId = form.getId(); props.setProperty('TRISTONE_FORM_ID', formId); }
    DriveApp.getFileById(formId).moveTo(folder);
    form.setDescription('Discuss your building maintenance, electromechanical, or manpower requirements with Tri Stone. Complete the details below so our team can review your project and contact you. Your enquiry will be recorded for follow-up. Contact: admin@tristone.ae.');
    form.setConfirmationMessage('Thank you. Your enquiry has been registered with Tri Stone. Our team will review your requirements and contact you using the details provided.');
    form.setCollectEmail(false).setLimitOneResponsePerUser(false).setAllowResponseEdits(false).setShowLinkToRespondAgain(false);
    const addText = (title, required, help) => {
      if (form.getItems().some(item => item.getTitle() === title)) return;
      const item = form.addTextItem().setTitle(title).setRequired(required);
      if (help) item.setHelpText(help);
      if (title === 'Email address') item.setValidation(FormApp.createTextValidation().requireTextIsEmail().build());
    };
    const addParagraph = (title, required, help) => {
      if (form.getItems().some(item => item.getTitle() === title)) return;
      const item = form.addParagraphTextItem().setTitle(title).setRequired(required);
      if (help) item.setHelpText(help);
    };
    if (!form.getItems().some(item => item.getTitle() === 'Enquiry type')) form.addListItem().setTitle('Enquiry type').setChoiceValues(['Manpower requirements','Building maintenance','Electromechanical services','General company enquiry']).setRequired(true);
    addText('Your name',true);
    addText('Company name',false);
    addText('Email address',true);
    addText('Contact number',false);
    addText('Project location',true);
    addParagraph('Roles and headcount',false,'For manpower enquiries, list each role and number of people required. Example: Technicians - 5; Supervisors - 1.');
    addText('Preferred start date',false,'Use DD/MM/YYYY or state To be confirmed.');
    addText('Expected duration',false);
    addParagraph('Project requirements',true,'Include required skills, scope of work, shift requirements, or site details.');
    if (!form.getItems().some(item => item.getTitle() === 'Contact permission')) form.addCheckboxItem().setTitle('Contact permission').setChoiceValues(['I agree that Tri Stone may store my enquiry and contact me about this request.']).setRequired(true);
    let sheetId = props.getProperty('TRISTONE_SHEET_ID');
    let sheet;
    if (sheetId) sheet = SpreadsheetApp.openById(sheetId);
    else { sheet = SpreadsheetApp.create('Tri Stone | Website Enquiry Register'); sheetId = sheet.getId(); props.setProperty('TRISTONE_SHEET_ID', sheetId); }
    DriveApp.getFileById(sheetId).moveTo(folder);
    if (form.getDestinationId() !== sheetId) form.setDestination(FormApp.DestinationType.SPREADSHEET, sheetId);
    form.setPublished(true);
    form.setAcceptingResponses(true);
    const result = {formUrl:form.getPublishedUrl(),responseRegister:sheet.getUrl(),folder:folder.getUrl()};
    console.log(JSON.stringify(result,null,2));
    return result;
  } finally { lock.releaseLock(); }
}
