/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SANITY_PROJECT_ID: string
  readonly VITE_SANITY_DATASET: string
  readonly VITE_GTM_ID?: string
  readonly VITE_CLARITY_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.module.css' {
  const classes: { readonly [key: string]: string }
  export default classes
}

declare module '*.webp' {
  const src: string
  export default src
}

declare module '*.css' {
  const content: string
  export default content
}
