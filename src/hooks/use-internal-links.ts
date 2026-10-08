import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Click handler for rendered Markdown: links to pages of this site ("/…") go
 * through the router instead of reloading the page. Modified clicks (new tab,
 * new window) and links with a target keep the browser's behaviour.
 */
export function useInternalLinks() {
  const navigate = useNavigate();
  return useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as HTMLElement).closest('a');
      if (!link || link.target || link.hasAttribute('download')) return;
      const href = link.getAttribute('href') ?? '';
      if (!href.startsWith('/') || href.startsWith('//')) return;
      event.preventDefault();
      navigate(href);
    },
    [navigate],
  );
}
