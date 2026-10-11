/**
 * Andrei's contact card, exactly as he gave it. The phone number is allowed here only:
 * the site pages never show it. Lines end with CRLF, as vCard requires.
 */
const FOUNDER_VCARD = [
  'BEGIN:VCARD',
  'VERSION:3.0',
  'N:Orlov;Andrei;;;',
  'FN:Andrei Orlov',
  'ORG:KPS Global Solutions',
  'TITLE:Founder & Director',
  'TEL;TYPE=CELL:+79145574000',
  'EMAIL:mnc@kpsglobal.id',
  'URL:https://kpsglobal.id',
  'URL:https://www.linkedin.com/in/anorlov',
  'X-SOCIALPROFILE;TYPE=telegram:https://t.me/An0rlov',
  'X-SOCIALPROFILE;TYPE=whatsapp:https://wa.me/message/OA27FPCRDJMQK1',
  'NOTE:WeChat: andreworlov · LinkedIn company: https://www.linkedin.com/company/kpsglobal',
  'END:VCARD',
];

export const founderVCard = (): string => `${FOUNDER_VCARD.join('\r\n')}\r\n`;

export const VCARD_PATH = 'card/andrei-orlov.vcf';
