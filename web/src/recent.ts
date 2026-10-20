const KEY = 'kbbi:recent';
const MAX = 8;

export function getRecent(): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function addRecent(word: string) {
  try {
    const list = [word, ...getRecent().filter(w => w !== word)].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // Storage unavailable (private mode etc.): history is just a convenience
  }
}

export function clearRecent() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
