import { useEffect, useState } from 'preact/hooks';
import { api } from '../api';
import { SearchBox } from '../components/SearchBox';
import { clearRecent, getRecent } from '../recent';
import { Link, wordPath } from '../router';

const EXAMPLES = ['rumah', 'apotik', 'cinta', 'merdeka', 'gotong royong', 'mengkhayal'];

export function Home() {
  const [total, setTotal] = useState<number | null>(null);
  const [recent, setRecent] = useState(getRecent);

  useEffect(() => {
    document.title = 'KBBI — Kamus Besar Bahasa Indonesia';
    api.stats().then(s => s && setTotal(s.total_words)).catch(() => {});
  }, []);

  return (
    <main class="home">
      <h1 class="home__title">Kamus Besar<br />Bahasa Indonesia</h1>
      <p class="home__lead">
        Cari makna, bentuk baku, contoh, dan etimologi
        {total ? <> dari <strong>{total.toLocaleString('id-ID')}</strong> entri</> : null}.
      </p>

      <SearchBox large autoFocus={!matchMedia('(pointer: coarse)').matches} />

      {recent.length > 0 && (
        <section class="home__section">
          <h2 class="label">
            Terakhir dicari
            <button type="button" class="link-btn" onClick={() => { clearRecent(); setRecent([]); }}>Hapus</button>
          </h2>
          <WordChips words={recent} />
        </section>
      )}

      <section class="home__section">
        <h2 class="label">Coba cari</h2>
        <WordChips words={EXAMPLES} />
      </section>
    </main>
  );
}

function WordChips({ words }: { words: string[] }) {
  return (
    <ul class="chips">
      {words.map(w => <li key={w}><Link href={wordPath(w)} class="chip">{w}</Link></li>)}
    </ul>
  );
}
