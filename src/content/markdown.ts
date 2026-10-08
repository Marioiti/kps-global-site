import MarkdownIt from 'markdown-it';

/**
 * Markdown → HTML at build time. Raw HTML in Markdown is not executed: it is
 * escaped and shown as text (`html: false`). Links to javascript:/data: are
 * rejected by markdown-it's link validator.
 */
const md = new MarkdownIt({ html: false, linkify: true, typographer: true });

// External links open in a new tab without access to this page.
const defaultLinkOpen =
  md.renderer.rules.link_open ?? ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options));
md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  const href = tokens[idx].attrGet('href') ?? '';
  if (/^https?:\/\//.test(href)) {
    tokens[idx].attrSet('target', '_blank');
    tokens[idx].attrSet('rel', 'noopener noreferrer');
  }
  return defaultLinkOpen(tokens, idx, options, env, self);
};

export interface RenderedMarkdown {
  html: string;
  /** Plain text, for reading time. */
  text: string;
  /** Problems the author has to fix. */
  problems: string[];
}

export function renderMarkdown(source: string): RenderedMarkdown {
  const tokens = md.parse(source, {});
  const problems: string[] = [];
  const text: string[] = [];

  for (const token of tokens) {
    if (token.type === 'heading_open' && token.tag === 'h1') {
      problems.push('body: "# " headings are not allowed (the page title is the h1); use "## "');
    }
    for (const child of token.children ?? []) {
      if (child.type === 'text' || child.type === 'code_inline') text.push(child.content);
      if (child.type === 'image') {
        const src = child.attrGet('src') ?? '';
        if (!src.startsWith('/')) {
          problems.push(`body: image "${src}" must be a file in public/ (path starting with /), not an external URL`);
        }
      }
    }
    if (token.type === 'fence' || token.type === 'code_block') text.push(token.content);
  }

  return { html: md.renderer.render(tokens, md.options, {}), text: text.join(' '), problems };
}

/** Minutes at ~200 words per minute, or ~400 characters per minute for Chinese. */
export function readingMinutes(text: string): number {
  const cjk = (text.match(/[㐀-鿿豈-﫿]/g) ?? []).length;
  const words = text.replace(/[㐀-鿿豈-﫿]/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200 + cjk / 400));
}
