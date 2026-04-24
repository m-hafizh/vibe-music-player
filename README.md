# Vibe Music Player — v2

## Simple Description
v2 is the migration milestone where the app moves to a modern Vue 3 + TypeScript + Vite stack.

## Tech Stack
- Vue 3
- TypeScript
- Vite
- Pinia
- Vue Router 4
- Howler.js
- Tailwind CSS
- VeeValidate
- Appwrite SDK

## UI Design and Styling
- UI structure modernized for Vite + Vue 3 app architecture
- Tailwind-based styling retained and cleaned up
- Better component organization under typed `src/pages`, `src/stores`, and `src/includes`

## Features
- Core player flow kept from v1
- Migration from Vuex-style store structure to Pinia-style store structure
- Type-safe core modules and directives
- Improved build/dev workflow with Vite

## Project Scripts
```bash
yarn install
yarn dev
yarn build
yarn test:unit
yarn lint
```

## Version Note
This version focuses on architecture migration and modernization rather than large feature expansion.
