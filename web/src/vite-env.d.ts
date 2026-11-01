/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** "true" builds a backend-free copy that runs the practice merchant in the browser. */
  readonly VITE_DEMO_MODE?: string;
}
