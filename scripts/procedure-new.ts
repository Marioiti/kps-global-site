/**
 * npm run procedure:new -- --commodity <id> --supplier S-NN [--audience buyer] [--basis FOB]
 * Creates content/procedures/<commodity>-<supplier>/en.md as a draft: the supplier is a
 * code only (S-01), never a name or a country. Fill in the steps, then set draft: false.
 */
import fs from 'node:fs';
import path from 'node:path';
import { canon } from '../src/data/canon';
import { INCOTERMS_2020 } from '../src/content/schema';
import { parseArgs } from './lib/pdf-tools';

const root = path.resolve(__dirname, '..');
const args = parseArgs(process.argv.slice(2));
const fail = (message: string): never => {
  console.error(message);
  process.exit(1);
};

const commodity = canon.commodities.find((c) => c.id === args.commodity);
if (!commodity) fail(`Usage: npm run procedure:new -- --commodity <${canon.commodities.map((c) => c.id).join('|')}> --supplier S-NN`);
if (!/^S-\d{2}$/.test(args.supplier ?? '')) fail('--supplier must be a code like S-01 (no name, no country)');
const audience = args.audience ?? 'buyer';
if (!['buyer', 'seller', 'investor'].includes(audience)) fail('--audience must be buyer, seller or investor');
if (args.basis && !(INCOTERMS_2020 as readonly string[]).includes(args.basis)) {
  fail(`--basis must be an Incoterms 2020 rule: ${INCOTERMS_2020.join(', ')}`);
}

const slug = `${commodity!.id}-${args.supplier.toLowerCase()}`;
const dir = path.join(root, 'content', 'procedures', slug);
if (fs.existsSync(dir)) fail(`content/procedures/${slug} already exists; use npm run procedure:update -- ${slug}`);

const today = new Date().toISOString().slice(0, 10);
const step = (title: string) =>
  [`  - title: "${title}"`, '    actor: "TODO"', '    document: "TODO"', '    receives: "TODO"'].join('\n');
const en = [
  '---',
  `title: "${commodity!.name.en}: procedure, supplier ${args.supplier}"`,
  'description: "TODO: one sentence on what this procedure covers."',
  `audience: ${audience}`,
  `commodity: [${commodity!.id}]`,
  `supplier: ${args.supplier}`,
  ...(args.basis ? [`basis: ${args.basis}`] : ['# basis: FOB']),
  'version: "1.0"',
  `updated: "${today}"`,
  'draft: true',
  'reviewed: false',
  'steps:',
  step('TODO: first step'),
  '---',
  '',
  'TODO: what the buyer should know before the first step.',
  '',
].join('\n');

fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'en.md'), en);
console.log(`procedure:new content/procedures/${slug}/en.md (draft). Fill in the steps and the TODOs, then set draft: false.`);
