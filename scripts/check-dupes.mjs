/**
 * Fails when the tree has conflict copies such as "Navbar 2.tsx", "index 3.html" or
 * "notes 2" (left by file sync on the working folder). They break the build and must
 * not be committed. Skips node_modules, dist and .git. Runs before every build.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SKIP = new Set(['node_modules', 'dist', '.git']);
// "name 2.ext" or "name 2" — a space, then a single digit, before the extension or at the end.
const COPY = /^.+ [0-9](\.[^.]+)?$/;

const found = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory() && SKIP.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (COPY.test(entry.name)) found.push(path.relative(ROOT, full));
    if (entry.isDirectory()) walk(full);
  }
};
walk(ROOT);

if (found.length) {
  console.error(`check-dupes: ${found.length} conflict cop${found.length === 1 ? 'y' : 'ies'} found; compare with the original and remove:`);
  for (const file of found.slice(0, 50)) console.error(`  ${file}`);
  if (found.length > 50) console.error(`  … and ${found.length - 50} more`);
  process.exit(1);
}
console.log('check-dupes: no conflict copies.');
