/// <reference types="vite/client" />

//Build-time constants injected by vite.config.ts via `define`.
//Declared here so TypeScript accepts the bare identifier across
//the source tree without importing anything.
declare const __HERMES_VERSION__: string;
