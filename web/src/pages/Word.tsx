import { useEffect, useState } from 'preact/hooks';
import { api } from '../api';
import { EntryCard } from '../components/Entry';
import { addRecent } from '../recent';
import { Link, wordPath } from '../router';
import type { CheckResponse, WordResponse } from '../types';

type State =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'found'; entry: WordResponse; check: CheckResponse | null }
  | { status: 'missing'; check: CheckResponse | null; similar: string[]; contains: string[] };

export function Word({ word }: { word: string }) {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    document.title = `${word} — KBBI`;
    setState({ status: 'loading' });
    const controller = new AbortController();
    const { signal } = controller;

    (async () => {
      const [entry, check] = await Promise.all([
        api.word(word, signal),
        api.check(word, signal).catch(() => null),
      ]);

      if (entry) {
        addRecent(word);
        setState({ status: 'found', entry, check });
        return;
      }

      const [similar, search] = await Promise.all([
        api.similar(word, signal).catch(() => null),
        api.search(word, 8, signal).catch(() => null),
      ]);
      setState({
        status: 'missing',
        check,
        similar: similar?.suggestions.map(s => s.word) ?? [],
        contains: search?.results ?? [],
      });
    })().catch(err => {
      if (!signal.aborted) {
        console.error(err);
        setState({ status: 'error' });
      }
    });

    return () => controller.abort();
  }, [word]);

  return (
    <main class="word">
      <h1 class="word__title">{word}</h1>

      {state.status === 'loading' && <Skeleton />}

      {state.status === 'error' && (
        <div class="card notice">
          <p>Gagal memuat data. Periksa koneksi Anda lalu coba lagi.</p>
          <button type="button" class="btn" onClick={() => location.reload()}>Muat ulang</button>
        </div>
      )}

      {state.status === 'found' && (
        <>
          <StandardNotice check={state.check} />
          <div class="word__actions">
            <a class="btn btn--ghost" href={state.entry.data.pranala} target="_blank" rel="noopener noreferrer">
              KBBI Daring ↗
            </a>
            <ShareButton word={word} />
          </div>
          {state.entry.data.entri.map((entri, i) => <EntryCard key={i} entri={entri} />)}
        </>
      )}

      {state.status === 'missing' && (
        <>
          <StandardNotice check={state.check} />
          {!state.check?.standard_form && (
            <div class="card notice">
              <p>Kata <strong>“{word}”</strong> tidak ditemukan dalam KBBI.</p>
            </div>
          )}
          <Suggestions title="Maksud Anda?" words={state.similar} />
          <Suggestions title={`Kata yang mengandung “${word}”`} words={state.contains} />
        </>
      )}
    </main>
  );
}

function StandardNotice({ check }: { check: CheckResponse | null }) {
  if (!check?.standard_form) return null;
  return (
    <div class="card notice notice--warn">
      <p>
        <strong>{check.word}</strong> adalah bentuk <em>tidak baku</em>. Bentuk bakunya:{' '}
        <Link href={wordPath(check.standard_form)} class="pointer">{check.standard_form}</Link>
      </p>
    </div>
  );
}

function Suggestions({ title, words }: { title: string; words: string[] }) {
  if (!words.length) return null;
  return (
    <section class="word__section">
      <h2 class="label">{title}</h2>
      <ul class="chips">
        {words.map(w => <li key={w}><Link href={wordPath(w)} class="chip">{w}</Link></li>)}
      </ul>
    </section>
  );
}

function ShareButton({ word }: { word: string }) {
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const url = location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${word} — KBBI`, url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    } catch {
      // User cancelled the share sheet
    }
  };
  return (
    <button type="button" class="btn btn--ghost" onClick={share}>
      {copied ? 'Tautan disalin' : 'Bagikan'}
    </button>
  );
}

function Skeleton() {
  return (
    <div class="card skeleton" aria-busy="true" aria-label="Memuat">
      <div class="skeleton__line" style={{ width: '40%' }} />
      <div class="skeleton__line" />
      <div class="skeleton__line" style={{ width: '85%' }} />
      <div class="skeleton__line" style={{ width: '60%' }} />
    </div>
  );
}
