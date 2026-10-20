import { useEffect, useRef, useState } from 'preact/hooks';
import { api } from '../api';
import { navigate, wordPath } from '../router';

interface Props {
  large?: boolean;
  autoFocus?: boolean;
}

export function SearchBox({ large, autoFocus }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced autocomplete; aborts the previous request on each keystroke
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => {
      api.search(q.toLowerCase(), 8, controller.signal)
        .then(res => {
          setResults(res?.results ?? []);
          setActive(-1);
        })
        .catch(() => {});
    }, 120);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const go = (word: string) => {
    const w = word.trim().toLowerCase();
    if (!w) return;
    setOpen(false);
    setQuery('');
    inputRef.current?.blur();
    navigate(wordPath(w));
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown' && results.length) {
      e.preventDefault();
      setOpen(true);
      setActive(i => (i + 1) % results.length);
    } else if (e.key === 'ArrowUp' && results.length) {
      e.preventDefault();
      setActive(i => (i <= 0 ? results.length - 1 : i - 1));
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const onSubmit = (e: Event) => {
    e.preventDefault();
    go(open && active >= 0 ? results[active] : query);
  };

  const showList = open && results.length > 0 && query.trim().length > 0;

  return (
    <form class={`search${large ? ' search--large' : ''}`} role="search" onSubmit={onSubmit}>
      <svg class="search__icon" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </svg>
      <input
        ref={inputRef}
        class="search__input"
        type="text"
        inputMode="search"
        enterKeyHint="search"
        autoComplete="off"
        autoCapitalize="off"
        spellcheck={false}
        autoFocus={autoFocus}
        placeholder="Cari kata…"
        aria-label="Cari kata"
        role="combobox"
        aria-expanded={showList}
        aria-controls="search-results"
        aria-autocomplete="list"
        aria-activedescendant={showList && active >= 0 ? `search-opt-${active}` : undefined}
        value={query}
        onInput={e => {
          setQuery(e.currentTarget.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
      />
      {showList && (
        <ul class="search__list" id="search-results" role="listbox">
          {results.map((word, i) => (
            <li
              key={word}
              id={`search-opt-${i}`}
              role="option"
              aria-selected={i === active}
              class={`search__option${i === active ? ' is-active' : ''}`}
              // mousedown fires before the input's blur, so the list is still there to click
              onMouseDown={e => {
                e.preventDefault();
                go(word);
              }}
            >
              <Highlight text={word} query={query.trim().toLowerCase()} />
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}

function Highlight({ text, query }: { text: string; query: string }) {
  const i = text.indexOf(query);
  if (!query || i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark>{text.slice(i, i + query.length)}</mark>
      {text.slice(i + query.length)}
    </>
  );
}
