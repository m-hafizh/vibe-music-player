# 🎵 Vibe — Music Player

> A modern, full-stack music player web application for uploading, managing, and streaming personal music collections.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [UI Design & Styling](#ui-design--styling)
- [Authentication](#authentication)
- [Music Player Engine](#music-player-engine)
- [Song Management](#song-management)
- [Playlist System](#playlist-system)
- [Commenting System](#commenting-system)
- [Internationalization (i18n)](#internationalization-i18n)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Progressive Web App (PWA)](#progressive-web-app-pwa)
- [State Management](#state-management)
- [Routing](#routing)
- [Form Validation](#form-validation)
- [Custom Directives](#custom-directives)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)

---

## Overview

**Vibe** is an open-source, modern music player web application built with Vue 3 and powered by Appwrite as the backend-as-a-service. Users can register, log in, upload MP3 files, manage their music library, stream songs, leave comments, and enjoy a full-featured audio playback experience — all within a responsive, dark-mode-enabled interface.

---

## Tech Stack

| Category             | Technology                                                          |
| -------------------- | ------------------------------------------------------------------- |
| **Framework**        | [Vue 3](https://vuejs.org/) (Composition API + `<script setup>`)    |
| **Build Tool**       | [Vite 5](https://vitejs.dev/)                                       |
| **Language**         | [TypeScript](https://www.typescriptlang.org/)                       |
| **State Management** | [Pinia 3](https://pinia.vuejs.org/)                                 |
| **Router**           | [Vue Router 4](https://router.vuejs.org/) + `unplugin-vue-router`   |
| **Styling**          | [TailwindCSS 3](https://tailwindcss.com/) + Custom CSS              |
| **Backend (BaaS)**   | [Appwrite](https://appwrite.io/) (Auth, Database, Storage)          |
| **Audio Engine**     | [Howler.js](https://howlerjs.com/) — HTML5 audio with Web Audio API |
| **Form Validation**  | [VeeValidate 4](https://vee-validate.logaretm.com/) + `@vee-validate/rules` |
| **i18n**             | [vue-i18n 9](https://vue-i18n.intlify.dev/) (multi-locale: en, fr, de, id, ja, ko, nl, zh) |
| **PWA**              | [vite-plugin-pwa](https://github.com/vite-pwa/vite-plugin-pwa)     |
| **Progress Bar**     | [NProgress](https://ricostacruz.com/nprogress/)                     |
| **Auto-Imports**     | `unplugin-auto-import` + `unplugin-vue-components`                  |
| **Icons**            | [Font Awesome 5](https://fontawesome.com/) (CDN)                    |
| **Font**             | [Roboto](https://fonts.google.com/specimen/Roboto) (Google Fonts)   |
| **Testing**          | [Vitest](https://vitest.dev/) + [Vue Test Utils](https://test-utils.vuejs.org/) |
| **Linting**          | ESLint with Airbnb config + Vue plugin                              |

---

## Project Structure

```
music-player/
├── index.html                    # Entry HTML (Google Fonts, Font Awesome CDN)
├── package.json                  # Dependencies & scripts
├── vite.config.ts                # Vite config (PWA, auto-imports, file-based routing)
├── tailwind.config.js            # TailwindCSS config (dark mode: 'class')
├── tsconfig.json                 # TypeScript config
├── .env                          # Appwrite credentials & i18n settings
│
├── src/
│   ├── main.ts                   # App entry — Pinia, Router, i18n, validation, directives
│   ├── App.vue                   # Root component (Header, Player, Auth modal, transitions)
│   │
│   ├── assets/
│   │   ├── tailwind.css           # Tailwind base/components/utilities
│   │   ├── main.css               # Custom CSS (animations, progress bars, overrides)
│   │   └── logo.png               # App logo
│   │
│   ├── components/
│   │   ├── Header.vue             # Sticky navbar (nav links, theme toggle, language dropdown)
│   │   ├── Player.vue             # Fixed-bottom audio player bar
│   │   ├── Auth.vue               # Auth modal (Login/Register tabs)
│   │   ├── LoginForm.vue          # Login form with VeeValidate
│   │   ├── RegisterForm.vue       # Registration form with VeeValidate
│   │   ├── Upload.vue             # Drag-and-drop file uploader with progress
│   │   ├── CompositionItem.vue    # Editable song item (edit, delete with confirmation)
│   │   ├── SongItem.vue           # Song list item for homepage
│   │   ├── PlaylistCard.vue       # Playlist card for grid/list displays
│   │   ├── PlaylistGrid.vue       # Reusable playlist grid section
│   │   ├── PlaylistSongItem.vue   # Song row item inside playlist detail page
│   │   ├── AddToPlaylistModal.vue # Add/remove song to/from user playlists
│   │   ├── CreatePlaylistModal.vue # Create/edit playlist modal
│   │   ├── ConfirmModal.vue       # Reusable confirmation dialog (danger/success/info variants)
│   │   ├── ToastContainer.vue     # Global toast notifications
│   │   ├── HelloI18n.vue          # i18n demo component
│   │   └── base/
│   │       └── Button.vue         # Base button component (auto-registered)
│   │
│   ├── pages/                     # File-based routing (unplugin-vue-router)
│   │   ├── index.vue              # Home — hero section + song list with search & pagination
│   │   ├── about.vue              # About page
│   │   ├── library.vue            # Playlist library (public viewing, create for logged-in users)
│   │   ├── manage-music.vue       # Upload & manage songs (auth required)
│   │   └── playlist/
│   │       └── [id].vue           # Playlist detail page (songs, play all, owner actions)
│   │   └── song/
│   │       └── [id].vue           # Song detail — play, comment, sort comments
│   │
│   ├── stores/                    # Pinia stores
│   │   ├── auth.ts                # Auth state (register, login, logout, session persistence)
│   │   ├── player.ts              # Player state (playlist, playback, shuffle, repeat, volume)
│   │   ├── playlist.ts            # Playlist CRUD, playlist songs, membership lookup
│   │   ├── toast.ts               # Toast notification queue/state
│   │   └── theme.ts               # Theme state (dark/light/system with OS preference detection)
│   │
│   ├── router/
│   │   └── index.ts               # Router config with auth guards
│   │
│   ├── composables/
│   │   └── useKeyboardShortcuts.ts # Global keyboard shortcuts for playback control
│   │
│   ├── directives/
│   │   ├── icon.ts                 # v-icon — inject Font Awesome icons into elements
│   │   └── icon-secondary.ts      # v-icon-secondary — variant icon injection
│   │
│   ├── includes/
│   │   ├── appwrite.ts            # Appwrite SDK client, services, and collection IDs
│   │   ├── validation.ts          # VeeValidate plugin (rules, custom messages)
│   │   ├── i18n.ts                # vue-i18n setup with lazy-loaded locale files
│   │   ├── helper.ts              # Utility functions (formatTime)
│   │   ├── progress-bar.ts        # NProgress route transition bars
│   │   └── _globals.ts            # Auto-register base components globally
│   │
│   └── locales/
│       ├── en.json                # English translations
│       └── fr.json                # French translations
│
├── public/                        # Static assets (images, PWA icons)
├── tests/                         # Unit/E2E test files
└── template/                      # Template/reference files
```

---

## Features

### Core Features
- **User Authentication** — Register, login, logout with session persistence via Appwrite
- **Music Upload** — Drag-and-drop or click-to-browse MP3 uploader with real-time progress tracking
- **Audio Playback** — Full-featured player with play, pause, seek, scrub, next, previous
- **Playlist Management** — Create, edit, delete playlists and add/remove songs via modal workflow
- **Shuffle & Repeat** — Three repeat modes (off → all → one) and shuffle toggle
- **Volume Control** — Adjustable volume slider with mute toggle, persisted to localStorage
- **Song Search** — Real-time search with debounce and URL query sync
- **Pagination** — Home and manage pages include paginated song lists with explicit controls
- **Comments** — Add and view comments on songs, with sort by latest/oldest
- **Song Management** — Edit song title/genre, delete songs (with file cleanup)

### UX Features
- **Dark Mode** — Three-way toggle: Light / Dark / System (auto-detects OS preference)
- **Internationalization** — Multi-language support (`en`, `fr`, `de`, `id`, `ja`, `ko`, `nl`, `zh`)
- **Keyboard Shortcuts** — Spacebar, arrow keys, S/R/M for playback control
- **Page Transitions** — Fade transitions between routes
- **Progress Bar** — NProgress loading indicator during route navigation
- **Confirmation Modals** — Reusable modal for destructive actions (delete, logout, upload)
- **Unsaved Changes Guard** — Warns before navigating away from unsaved edits
- **Toast Notifications** — Global success/error/info feedback for playlist and song operations
- **PWA Support** — Installable as a progressive web app with auto-update

---

## UI Design & Styling

### Design System
- **Framework**: TailwindCSS 3 with utility-first approach
- **Dark Mode**: Class-based (`darkMode: 'class'`) with `.dark:` variant utilities
- **Typography**: Roboto font (300, 400, 500, 700 weights) via Google Fonts CDN
- **Icons**: Font Awesome 5 (Free Solid) via CDN
- **Color Palette**:
  - **Primary**: Green (`green-500` / `#10B981`) — used for branding, active states, progress bars
  - **Accent**: Yellow/Amber (`yellow-500`) — used for hover effects, active nav links
  - **Backgrounds**: Gray scale (`gray-50` to `gray-900`) adapting for light/dark modes
  - **Danger**: Red (`red-500`/`red-600`) — used for destructive actions
  - **Info**: Blue (`blue-500`) — used for progress/loading states

### UI Patterns
- **Sticky Header** — Fixed top navigation with shadow, z-50
- **Fixed Bottom Player** — Persistent music player bar pinned to viewport bottom
- **Modal Overlays** — Backdrop blur with centered panels (`Auth`, `ConfirmModal`)
- **Card Components** — White/dark cards with subtle borders and rounded corners
- **Hover Effects** — Opacity reveals for action buttons, color transitions
- **Transitions** — Fade in/out route transitions, smooth CSS transitions (300ms)
- **Range Sliders** — Custom-styled `<input type="range">` with green fill gradients
- **Drag-and-Drop Zone** — Visual feedback on dragover (green highlight)
- **Responsive Layout** — CSS Grid for manage page, Flexbox for player and header
- **Alert Banners** — Colored feedback banners for form submission states (blue/green/red)

### Custom CSS Animations
- **Background Slide** — Infinite horizontal pan for hero & song header images (`50s linear`)
- **Progress Bar Stripes** — Animated diagonal stripes on upload progress bars

---

## Authentication

Powered by **Appwrite Account & Databases** services:

| Action       | Method                                  |
| ------------ | --------------------------------------- |
| Register     | `account.create()` → `createEmailPasswordSession()` → store user doc in `users` collection |
| Login        | `account.createEmailPasswordSession()`  |
| Session Init | `account.get()` on app mount            |
| Logout       | `account.deleteSession('current')`      |

- Sessions are persisted by Appwrite's cookie-based sessions
- Auth state is managed globally via the `auth` Pinia store (`userLoggedIn` ref)
- Route guard redirects unauthenticated users from protected pages to `/`
- `init_login()` intentionally calls `account.get()` on app startup; guests receive a 401 which is expected and simply resolves to `userLoggedIn = false`

---

## Music Player Engine

Built on **Howler.js** for cross-browser HTML5 audio:

- **Playback**: Play, pause, seek (with pause-seek-play workaround for HTML5 streaming)
- **Progress Tracking**: `requestAnimationFrame` loop for smooth seek/duration updates
- **Playlist**: Ordered song array with cursor-based navigation
- **Shuffle**: Random next track (avoids repeating current track)
- **Repeat Modes**: Off → All (loop playlist) → One (loop current track)
- **Volume**: 0–1 range with localStorage persistence, mute toggle
- **Auto-Advance**: Plays next song on track end, respects repeat/shuffle settings
- **Previous Track**: Restarts current song if > 3 seconds elapsed, otherwise goes to previous
- **Always-Visible Player Bar**: Player is rendered even before first song selection
- **Initial Idle State**: Before first playback, controls are disabled, metadata shows `-`, and playlist plus/check icon is hidden
- **Responsive Layout Bands**:
  - `< 640px`: mobile stacked controls
  - `640px – 1070px`: compact tablet/small-laptop layout
  - `>= 1071px`: desktop multi-column layout
- **Auth-Aware Playlist Icon**: Plus/check icon only appears when user is logged in and a song is active

---

## Song Management

On the **Manage Music** page (`/manage-music`, auth required):

- **Upload**: Drag-and-drop or file picker for MP3 files
  - File stored in Appwrite Storage bucket
  - Song metadata document created in `songs` collection
  - Real-time upload progress bar with status icons
- **Edit**: Inline form to update song title and genre
- **Delete**: Removes both the storage file and database document
- **Search + Pagination**: Manage Music page supports client-side search and paginated results (5 songs per page)
- All destructive actions require confirmation via `ConfirmModal`

---

## Playlist System

- **Playlist Library** (`/library`)
  - View playlists in a responsive grid
  - Guests can browse public playlists
  - Playlist creation actions are shown only to logged-in users
- **Playlist Detail** (`/playlist/:id`)
  - Playlist header with metadata and gradient styling
  - Song list with play-at-index, play all, and shuffle play actions
  - Owner-only edit/delete/remove-song operations
- **Add to Playlist Modal**
  - Shows current membership per playlist
  - Supports staged add/remove changes
  - Applies changes in one explicit action with success/error toasts
- **Membership Lookup Cache**
  - `playlist` store maintains a fast lookup map for song-in-playlist checks
  - Keeps song list and player bar plus/check indicators in sync

---

## Commenting System

On the **Song Detail** page (`/song/[id]`):

- Authenticated users can submit comments (validated: required, min 3 chars)
- Comments stored in Appwrite `comments` collection with fields: `content`, `datePosted`, `sid`, `name`, `uid`
- Song's `comment_count` is incremented on each new comment
- Comments sortable by Latest (default) or Oldest
- Sort preference synced to URL query parameter

---

## Internationalization (i18n)

Using **vue-i18n 9** with Composition API (`legacy: false`):

- **Supported Locales**: English (`en`), French (`fr`), German (`de`), Indonesian (`id`), Japanese (`ja`), Korean (`ko`), Dutch (`nl`), Chinese (`zh`)
- **Locale Files**: JSON files in `src/locales/`
- **Lazy Loading**: Files imported eagerly via `import.meta.glob`
- **Language Switcher**: Dropdown in the header navbar
- **Number Formatting**: Currency formats for `en` (USD) and `ja` (JPY)
- **Pluralization**: Used for comment counts (`No comments | 1 Comment | {count} Comments`)

---

## Keyboard Shortcuts

Global shortcuts (disabled when focused on input/textarea/select):

| Key            | Action            |
| -------------- | ----------------- |
| `Space`        | Play / Pause      |
| `→` Arrow Right | Next Song         |
| `←` Arrow Left  | Previous Song     |
| `↑` Arrow Up    | Volume Up (+10%)  |
| `↓` Arrow Down  | Volume Down (-10%)|
| `S`            | Toggle Shuffle    |
| `R`            | Toggle Repeat     |
| `M`            | Toggle Mute       |

---

## Progressive Web App (PWA)

Configured via `vite-plugin-pwa`:

- **Register Type**: Auto-update (service worker updates seamlessly)
- **App Name**: "Music Player"
- **Theme Color**: `#ff5e3a`
- **Caching**: Workbox precaches all JS, CSS, HTML, images, and SVGs
- **Icon**: 192x192 PNG in `assets/img/`

---

## State Management

Five **Pinia** stores using the Composition API (`setup` store) syntax:

### `auth` Store
- `authModalShow` — controls auth modal visibility
- `userLoggedIn` — tracks authentication state
- Actions: `register`, `login`, `init_login`, `signout`, `toggleAuthModal`

### `player` Store
- `currentSong`, `sound` (Howl instance), `seek`, `duration`, `playerProgress`
- `playing`, `playlist`, `currentIndex`, `shuffle`, `repeat`, `volume`, `muted`
- Computed: `hasNext`, `hasPrev`
- Actions: `newSong`, `toggleAudio`, `nextSong`, `prevSong`, `updateSeek`, `setVolume`, `toggleMute`, `toggleShuffle`, `toggleRepeat`, `setPlaylist`, `playIndex`

### `playlist` Store
- `userPlaylists`, `currentPlaylist`, `currentPlaylistSongs`, `userPlaylistSongLookup`
- Supports playlist CRUD and playlist-song relations
- Provides membership helpers used by `SongItem`, `Player`, and playlist modal flows

### `toast` Store
- Global toast queue with auto-dismiss support
- Used across upload, playlist, and management flows

### `theme` Store
- `themeMode` — `'dark' | 'light' | 'system'` (persisted to localStorage)
- `isDarkMode` — computed, reflects actual visual mode
- Watches system preference via `matchMedia`
- Toggles `dark` class on `<html>` element

---

## Routing

File-based routing via `unplugin-vue-router`:

| Route              | Page                 | Auth Required |
| ------------------ | -------------------- | ------------- |
| `/`                | Home (song list)     | No            |
| `/about`           | About page           | No            |
| `/library`         | Playlist library     | No            |
| `/manage-music`    | Upload & manage      | Yes           |
| `/playlist/:id`    | Playlist detail      | No            |
| `/song/:id`        | Song detail & comments | No          |

- **Navigation Guard**: `beforeEach` check for `meta.requiresAuth`
- **Active Link Class**: `text-yellow-500`
- **Progress Bar**: NProgress starts on `beforeEach`, ends on `afterEach`

---

## Form Validation

VeeValidate 4 rules registered globally:

| Rule                | Usage                           |
| ------------------- | ------------------------------- |
| `required`          | Mandatory fields                |
| `min` / `max`       | String length limits            |
| `min_value` / `max_value` | Numeric range (age: 18–100) |
| `email`             | Valid email format              |
| `alpha_spaces`      | Letters and spaces only (name)  |
| `passwords_mismatch`| Confirm password match          |
| `country_excluded`  | Block specific countries        |
| `tos`               | Terms of Service checkbox       |

Custom error messages are configured for all rules in `includes/validation.ts`.

---

## Custom Directives

### `v-icon`
Injects a Font Awesome icon into an element. Supports modifiers:
- `.right` — float right
- `.yellow` — yellow color (default: green)
- `arg: 'full'` — use raw class string

### `v-icon-secondary`
Simplified variant accepting an object `{ icon: string, right?: boolean }`.

---

## Environment Variables

| Variable                                     | Description                    |
| ---------------------------------------------| ------------------------------ |
| `VITE_I18N_LOCALE`                           | Default locale (`en`)          |
| `VITE_I18N_FALLBACK_LOCALE`                  | Fallback locale (`en`)         |
| `VITE_APPWRITE_ENDPOINT`                     | Appwrite API endpoint          |
| `VITE_APPWRITE_PROJECT_ID`                   | Appwrite project ID            |
| `VITE_APPWRITE_DATABASE_ID`                  | Appwrite database ID           |
| `VITE_APPWRITE_USERS_COLLECTION_ID`          | Users collection ID            |
| `VITE_APPWRITE_SONGS_COLLECTION_ID`          | Songs collection ID            |
| `VITE_APPWRITE_COMMENTS_COLLECTION_ID`       | Comments collection ID         |
| `VITE_APPWRITE_PLAYLISTS_COLLECTION_ID`      | Playlists collection ID        |
| `VITE_APPWRITE_PLAYLIST_SONGS_COLLECTION_ID` | Playlist songs collection ID   |
| `VITE_APPWRITE_BUCKET_ID`                    | Storage bucket ID              |

---

## Scripts

```bash
yarn dev          # Start Vite dev server
yarn build        # Build for production
yarn preview      # Preview production build
yarn test:unit    # Run unit tests with Vitest
yarn lint         # Lint with ESLint (auto-fix)
```
