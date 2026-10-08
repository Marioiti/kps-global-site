/**
 * npm run content:check — validates every file in content/ without building the site:
 * frontmatter against the zod schemas, Markdown rules, cross-references and covers.
 * Exits with code 1 and a list of "file › field: reason" lines on any problem.
 */
import path from 'node:path';
import { ContentError, loadContent } from '../src/content/load';

const root = path.resolve(__dirname, '..');

try {
  const { entries, unpublished, files } = loadContent(root);
  console.log(`content: ${files.length} file(s) checked, no problems.`);
  for (const entry of entries) {
    const languages = Object.keys(entry.versions).join(', ');
    console.log(`  published  ${entry.collection}/${entry.slug}  [${languages}]`);
  }
  for (const item of unpublished) console.log(`  not published  ${item}`);
} catch (error) {
  if (error instanceof ContentError) {
    console.error(error.message);
    process.exit(1);
  }
  throw error;
}
