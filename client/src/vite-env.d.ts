/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RAILS_API_URL?: string;
  readonly VITE_NODE_AGENT_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
