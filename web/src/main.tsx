import { render } from 'preact';
import { SearchBox } from './components/SearchBox';
import { Home } from './pages/Home';
import { Word } from './pages/Word';
import { Link, usePath } from './router';
import './style.css';

function App() {
  const path = usePath();
  const wordMatch = path.match(/^\/kata\/(.+)$/);
  let word = '';
  if (wordMatch) {
    try {
      word = decodeURIComponent(wordMatch[1]).toLowerCase();
    } catch {
      word = wordMatch[1];
    }
  }

  return (
    <>
      <header class="topbar">
        <div class="topbar__inner">
          <Link href="/" class="brand">
            <img src="/favicon.svg" alt="" width="28" height="28" />
            <span>KBBI</span>
          </Link>
          {word && <SearchBox />}
        </div>
      </header>

      {word ? <Word word={word} /> : path === '/' ? <Home /> : <NotFound />}

      <footer class="footer">
        Data: KBBI Edisi V, Badan Pengembangan dan Pembinaan Bahasa, Kemendikbudristek.
      </footer>
    </>
  );
}

function NotFound() {
  return (
    <main class="word">
      <h1 class="word__title">Halaman tidak ditemukan</h1>
      <p><Link href="/">Kembali ke beranda</Link></p>
    </main>
  );
}

render(<App />, document.getElementById('app')!);
