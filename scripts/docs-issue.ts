/**
 * npm run docs:issue -- --doc <slug> --to "<company>" [--person "<name>"]
 * Personal copy of _internal/documents/<slug>/<slug>.pdf: a visible mark with the
 * recipient, date and issue number KPS-YYYYMMDD-NNN on every page; changes and text
 * copying forbidden with the owner password KPS_PDF_OWNER_PASSWORD (.env.local).
 * Output: _internal/issued/, plus a row in _internal/issued/register.csv.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  appendRegister,
  encryptWithQpdf,
  nextIssueNumber,
  parseArgs,
  qpdfAvailable,
  readCard,
  readSecret,
  slugify,
  sourcePdf,
  stampPdf,
} from './lib/pdf-tools';

const root = path.resolve(__dirname, '..');
const args = parseArgs(process.argv.slice(2));
const fail = (message: string): never => {
  console.error(message);
  process.exit(1);
};

if (!args.doc || !args.to || args.to === 'true') {
  fail('Usage: npm run docs:issue -- --doc <slug> --to "<company>" [--person "<name>"]');
}
if (!qpdfAvailable()) {
  fail('qpdf is not installed; it protects the issued PDF. Install it with:\n  brew install qpdf\nNothing was issued.');
}
const ownerPassword = readSecret(root, 'KPS_PDF_OWNER_PASSWORD');
if (!ownerPassword) {
  fail('KPS_PDF_OWNER_PASSWORD is not set. Add it to .env.local (not committed):\n  KPS_PDF_OWNER_PASSWORD=<a long random string>\nNothing was issued.');
}
const source = sourcePdf(root, args.doc);
if (!fs.existsSync(source)) fail(`Source not found: ${path.relative(root, source)}`);

const issuedDir = path.join(root, '_internal', 'issued');
const register = path.join(issuedDir, 'register.csv');
const date = new Date().toISOString().slice(0, 10);
const number = nextIssueNumber(register, date);
const recipient = { company: args.to, person: args.person && args.person !== 'true' ? args.person : undefined };
const version = readCard(root, args.doc)?.version ?? 'n/a';

const stamped = await stampPdf(new Uint8Array(fs.readFileSync(source)), { recipient, date, number });
fs.mkdirSync(issuedDir, { recursive: true });
const temp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'kps-issue-')), 'stamped.pdf');
fs.writeFileSync(temp, stamped);
const output = path.join(issuedDir, `${number}_${args.doc}_${slugify(recipient.company)}.pdf`);
try {
  encryptWithQpdf(temp, output, ownerPassword!);
} finally {
  fs.rmSync(path.dirname(temp), { recursive: true, force: true });
}

appendRegister(register, {
  number,
  date,
  document: args.doc,
  version,
  recipient: recipient.person ? `${recipient.company}; ${recipient.person}` : recipient.company,
});
console.log(`docs:issue ${number}: ${path.relative(root, output)} (register: ${path.relative(root, register)})`);
