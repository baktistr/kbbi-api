import type { ComponentChildren } from 'preact';
import { useEffect, useState } from 'preact/hooks';

export function navigate(to: string) {
  if (to === location.pathname + location.search) return;
  history.pushState(null, '', to);
  dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo(0, 0);
}

export function usePath(): string {
  const [path, setPath] = useState(location.pathname);
  useEffect(() => {
    const onChange = () => setPath(location.pathname);
    addEventListener('popstate', onChange);
    return () => removeEventListener('popstate', onChange);
  }, []);
  return path;
}

export const wordPath = (word: string) => `/kata/${encodeURIComponent(word)}`;

interface LinkProps {
  href: string;
  class?: string;
  children: ComponentChildren;
}

export function Link({ href, class: className, children }: LinkProps) {
  const onClick = (e: MouseEvent) => {
    // Let the browser handle new-tab/window clicks
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    navigate(href);
  };
  return <a href={href} class={className} onClick={onClick}>{children}</a>;
}
