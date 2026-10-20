import { useState } from 'preact/hooks';
import { Link, wordPath } from '../router';
import type { Entri, Makna } from '../types';

export function EntryCard({ entri }: { entri: Entri }) {
  return (
    <article class="card entry">
      <header class="entry__head">
        <h2 class="entry__name">
          {entri.nama}
          {entri.nomor && <sup class="entry__num">{entri.nomor}</sup>}
        </h2>
        {entri.pelafalan && <span class="entry__pron">/{entri.pelafalan}/</span>}
      </header>

      <dl class="entry__meta">
        <MetaRow label="Kata dasar" words={entri.kata_dasar} />
        <MetaRow label="Bentuk tidak baku" words={entri.bentuk_tidak_baku} plain />
        <MetaRow label="Varian" words={entri.varian} />
      </dl>

      {entri.makna.length > 0 && (
        <ol class="senses">
          {entri.makna.map((makna, i) => <Sense key={i} makna={makna} />)}
        </ol>
      )}

      {entri.etimologi && (
        <p class="etym">
          <span class="label">Etimologi</span>
          {entri.etimologi.bahasa && <> {entri.etimologi.bahasa}</>}
          {entri.etimologi.asal_kata && <> · <span class="etym__src" lang="und">{entri.etimologi.asal_kata}</span></>}
          {entri.etimologi.pelafalan && <> ({entri.etimologi.pelafalan})</>}
          {entri.etimologi.arti.length > 0 && <> ‘{entri.etimologi.arti.join('; ')}’</>}
        </p>
      )}

      <Related title="Kata turunan" words={entri.kata_turunan} />
      <Related title="Gabungan kata" words={entri.gabungan_kata} />
      <Related title="Peribahasa" words={entri.peribahasa} phrases />
      <Related title="Idiom" words={entri.idiom} phrases />
    </article>
  );
}

function MetaRow({ label, words, plain }: { label: string; words: string[]; plain?: boolean }) {
  if (!words.length) return null;
  return (
    <div class="entry__meta-row">
      <dt>{label}</dt>
      <dd>
        {words.map((w, i) => (
          <>
            {i > 0 && ', '}
            {plain ? <span>{w}</span> : <Link href={wordPath(w)}>{w}</Link>}
          </>
        ))}
      </dd>
    </div>
  );
}

// "→ apotek" and "→ bega (2)" are cross-references to the standard/main entry
const POINTER = /^→\s*(.+?)(?:\s*\((\d+)\))?$/;

function Definition({ text }: { text: string }) {
  const match = text.match(POINTER);
  if (!match) return <>{text}</>;
  return (
    <>
      lihat <Link href={wordPath(match[1])} class="pointer">{match[1]}{match[2] && <sup>{match[2]}</sup>}</Link>
    </>
  );
}

function Sense({ makna }: { makna: Makna }) {
  return (
    <li class="sense">
      {makna.kelas.map(k => (
        <abbr key={k.kode} class="tag" title={[k.nama, k.deskripsi].filter(s => s && s !== '-').join(': ') || undefined}>
          {k.kode}
        </abbr>
      ))}
      {makna.info && <span class="sense__info">{makna.info}</span>}
      {makna.submakna.map((s, i) => (
        <>
          {i > 0 && '; '}
          <Definition text={s} />
        </>
      ))}
      {makna.contoh.length > 0 && (
        <span class="sense__ex">: {makna.contoh.map((c, i) => <>{i > 0 && '; '}<i>{c}</i></>)}</span>
      )}
    </li>
  );
}

const PREVIEW = 12;

function Related({ title, words, phrases }: { title: string; words: string[]; phrases?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  if (!words.length) return null;
  const shown = expanded ? words : words.slice(0, PREVIEW);

  return (
    <section class="related">
      <h3 class="label">{title} <span class="count">{words.length}</span></h3>
      {phrases ? (
        <ul class="phrases">{shown.map(w => <li key={w}>{w}</li>)}</ul>
      ) : (
        <ul class="chips">
          {shown.map(w => <li key={w}><Link href={wordPath(w)} class="chip">{w}</Link></li>)}
        </ul>
      )}
      {words.length > PREVIEW && (
        <button type="button" class="more" onClick={() => setExpanded(!expanded)}>
          {expanded ? 'Tampilkan lebih sedikit' : `Tampilkan semua (${words.length})`}
        </button>
      )}
    </section>
  );
}
