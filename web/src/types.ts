export interface Kelas {
  kode: string;
  nama: string;
  deskripsi: string;
}

export interface Makna {
  kelas: Kelas[];
  submakna: string[];
  info: string;
  contoh: string[];
}

export interface Etimologi {
  kelas: string[];
  bahasa: string;
  asal_kata: string;
  pelafalan: string;
  arti: string[];
}

export interface Entri {
  nama: string;
  nomor: string;
  kata_dasar: string[];
  pelafalan: string;
  bentuk_tidak_baku: string[];
  varian: string[];
  makna: Makna[];
  etimologi: Etimologi | null;
  kata_turunan: string[];
  gabungan_kata: string[];
  peribahasa: string[];
  idiom: string[];
}

export interface WordResponse {
  status: string;
  data: {
    pranala: string;
    entri: Entri[];
  };
}

export interface CheckResponse {
  is_standard: boolean;
  word: string;
  standard_form?: string;
  non_standard_forms?: string[];
  exists_in_kbbi?: boolean;
}

export interface SearchResponse {
  query: string;
  count: number;
  results: string[];
}

export interface SimilarResponse {
  word: string;
  suggestions: Array<{ word: string; distance: number }>;
}

export interface StatsResponse {
  total_words: number;
}
