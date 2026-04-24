/// <reference types="vite/client" />
/// <reference types="unplugin-vue-router/client" />

declare module 'howler'
declare module 'nprogress'
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}
declare module 'vue-router/auto-routes' {
  import { RouteRecordRaw } from 'vue-router'
  export const routes: RouteRecordRaw[]
}
