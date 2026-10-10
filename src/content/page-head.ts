/**
 * Changes to the <head> of every prerendered page: the language's interface strings start
 * loading together with the main script, and the Chinese font stylesheet does not hold the first paint.
 */

/** One chunk of the client build manifest (.vite/manifest.json). */
export interface ManifestChunk {
  file: string;
  imports?: string[];
  isEntry?: boolean;
}
export type BuildManifest = Record<string, ManifestChunk>;

/** The same address and id as in LanguageContext, which adds the link on moving to /zh/ in the browser. */
const NOTO_HREF = '/fonts/noto-sans-sc/index.css';
// Applied once the first paint is done, so the font slices never compete with what the first paint needs.
const NOTO_ON =
  "var l=this,on=function(){l.media='all'};" +
  "if(!window.PerformanceObserver||performance.getEntriesByType('paint').length){on()}" +
  "else{new PerformanceObserver(function(_,o){o.disconnect();on()}).observe({type:'paint'})}";
const NOTO_LINK =
  `<link id="noto-sans-sc" rel="stylesheet" href="${NOTO_HREF}" media="print" onload="${NOTO_ON}">` +
  `<noscript><link rel="stylesheet" href="${NOTO_HREF}"></noscript>`;

export function improvePageHead(html: string, manifest: BuildManifest, language: string): string {
  let out = html;
  const strings = manifest[`src/i18n/strings/${language}.ts`];
  if (strings) {
    out = out.replace('</head>', `<link rel="modulepreload" crossorigin="" href="/${strings.file}"></head>`);
  }
  // Chinese text shows in the system font until the Noto Sans SC slices arrive.
  if (language === 'zh') out = out.replace('</head>', `${NOTO_LINK}</head>`);
  return out;
}
