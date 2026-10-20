/**
 * KBBI API - Standalone server (Bun)
 * Runs the Workers handler outside Cloudflare, with KV replaced by an in-memory store
 * built from the bundled dataset (same layout as scripts/prepare-data.js produces).
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import worker from './index';

const DATA_DIR = process.env.DATA_DIR || join(import.meta.dir, '../kbbi-dataset-kbbi-v-main/json');
const PORT = parseInt(process.env.PORT || '3000');

const JSON_FILES = [
  'kbbi_v_part1.json',
  'kbbi_v_part2.json',
  'kbbi_v_part3.json',
  'kbbi_v_part4.json',
];

function loadStore(): Map<string, string> {
  const store = new Map<string, string>();
  const nonStandardIndex: Record<string, string> = {};

  for (const file of JSON_FILES) {
    const data = JSON.parse(readFileSync(join(DATA_DIR, file), 'utf8'));

    for (const [key, value] of Object.entries<any>(data)) {
      const wordKey = key.toLowerCase();
      store.set(wordKey, JSON.stringify(value));

      for (const entri of value?.data?.entri ?? []) {
        for (const nonStandard of entri.bentuk_tidak_baku ?? []) {
          nonStandardIndex[nonStandard.toLowerCase()] = wordKey;
        }
      }
    }
  }

  const words = [...store.keys()].sort();
  store.set('__index_words__', JSON.stringify(words));
  store.set('__index_non_standard__', JSON.stringify(nonStandardIndex));

  console.log(`📚 Loaded ${words.length} words from ${DATA_DIR}`);
  return store;
}

const store = loadStore();

// Minimal KVNamespace stand-in: the API only ever calls get(key)
const env = {
  KBBI_DATA: {
    get: async (key: string) => store.get(key) ?? null,
  } as unknown as KVNamespace,
};

Bun.serve({
  port: PORT,
  fetch: (request) => worker.fetch(request, env),
});

console.log(`🚀 KBBI API listening on port ${PORT}`);
