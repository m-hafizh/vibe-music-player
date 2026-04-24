# Vibe Music Player — v3.2

## Simple Description
v3.2 is the most complete release so far, adding full playlist management, broader i18n support, and improved UX feedback.

## Tech Stack
- Vue 3 + TypeScript
- Vite
- Pinia (auth, player, theme, playlist, toast stores)
- Vue Router 4 + file-based route typing
- Howler.js
- Tailwind CSS
- VeeValidate
- Appwrite SDK
- PWA support (vite-plugin-pwa)

## UI Design and Styling
- Modern card-based UI with responsive layouts
- Dark/light/system theming
- Tailwind utility-first styling + custom animations
- Playlist-focused pages/components with modal workflows

## Features
- Authentication and song upload/management
- Rich audio player controls (seek, next/prev, shuffle, repeat, volume, mute)
- Playlist system:
  - Create/edit/delete playlists
  - Add/remove songs to playlists
  - Playlist library and playlist detail pages
- Comments and sorting on song pages
- Multi-language locale support (expanded in this release)
- Toast notifications for user feedback

## Project Scripts
```bash
yarn install
yarn dev
yarn build
yarn test:unit
yarn lint
```

## Version Note
This release is the recommended baseline for ongoing development.
