/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string; // ✅ không có dấu cách
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
