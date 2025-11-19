// ./src/vite-env.d.ts

/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Hanya perlu mendefinisikan variabel kustom yang Anda gunakan
  readonly VITE_API_BASE_URL: string;
  // readonly VITE_APP_TITLE: string; // Tambahkan jika Anda punya variabel lain

  // Anda dapat menambahkan properti lain di sini jika perlu
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}