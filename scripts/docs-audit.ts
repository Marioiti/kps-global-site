/**
 * npm run docs:audit
 * Lists published document cards (draft: false) without a source file (PDF or DOCX)
 * in _internal/documents/<slug>/. Exits with code 1 when any are missing.
 * Without the _internal folder (CI) the check is skipped with a warning.
 */
import path from 'node:path';
import { auditSources } from './lib/pdf-tools';

const root = path.resolve(__dirname, '..');
const result = auditSources(root);

if (result.skipped) {
  console.warn('docs:audit: no _internal folder here (CI?), check skipped.');
  process.exit(0);
}

const { checked, missing } = result;
if (!missing.length) {
  console.log(`docs:audit: ${checked} published card(s), every one has a source.`);
  process.exit(0);
}

const header = { slug: 'document', group: 'group', access: 'access', expected: 'expected source (PDF or DOCX)' };
const rows = [header, ...missing];
const width = (key: keyof typeof header) => Math.max(...rows.map((row) => row[key].length));
const keys = Object.keys(header) as (keyof typeof header)[];
const line = (row: typeof header) => keys.map((key) => row[key].padEnd(width(key))).join('  ').trimEnd();

console.log(line(header));
console.log(keys.map((key) => '-'.repeat(width(key))).join('  '));
for (const row of missing) console.log(line(row));
console.log(`\ndocs:audit: ${missing.length} of ${checked} published card(s) have no source.`);
process.exit(1);
