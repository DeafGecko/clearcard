# ClearCard

ClearCard is a mobile-first communication card app I built for Deaf and Hard of Hearing people. It is designed for situations where spoken communication is unreliable, inaccessible, or too slow: medical appointments, restaurants, service counters, emergencies, and everyday errands.

The idea is straightforward. Write a message once, save it as a card, and open it in a large full-screen view when it is needed. The interface stays intentionally direct so the message remains the focus.

## Why I Built It

Repeatedly typing the same explanation on a phone creates friction, especially in stressful or time-sensitive situations. ClearCard turns those repeated messages into reusable tools.

I treat accessibility as part of the application architecture, not as a layer added after the UI is finished. That affects the typography, contrast, touch targets, responsive behavior, motion, and the number of steps required to reach a card.

## Current Features

- Create, edit, delete, and organize reusable communication cards
- Open cards in a full-screen presentation view
- Filter cards by Medical, Services, Daily, Emergency, Vault, or custom categories
- Swipe left on mobile and iPad to reveal Edit and Delete actions
- Manage custom categories and their order
- Store private cards in a passcode-protected Vault
- Use one shared six-digit Secret Code for Vault access and private cards
- Adjust display size with Compact, Normal, and Enlarged modes
- Choose Light, low-glare Dark, or High Contrast appearance modes
- Select an accent color and full-screen display text color
- Rotate full-screen text when showing a message across a table
- Keep cards and preferences in browser `localStorage`

## Accessibility Approach

ClearCard uses Atkinson Hyperlegible for the primary interface. The Secret Code keypad uses Inter for clear numeric recognition. Both fonts are bundled locally with `@fontsource`, so the interface does not depend on a remote font request.

The appearance modes serve different needs:

- **Light** uses a white background and black text for daylight readability.
- **Dark** uses near-black surfaces, soft off-white text, and restrained accents to reduce glare for people who are sensitive to bright screens, including some people affected by migraine or photosensitivity.
- **High Contrast** uses pure black, signal yellow, and stronger boundaries for maximum visual separation.

Other accessibility decisions include:

- Large touch targets for primary actions
- Responsive type and control sizing
- Visible focus and pressed states
- Text labels or accessible names for icon controls
- Reduced-motion support for the Settings drawer
- Haptic feedback where the browser and device support vibration
- WCAG-aware text contrast and component boundaries

Accessibility requirements vary by person and device. The three display modes are options, not assumptions about what every user needs.

## Technical Stack

| Area           | Technology                                               |
| -------------- | -------------------------------------------------------- |
| UI             | React 19 with functional components and hooks            |
| Language       | TypeScript 5.8                                           |
| Build system   | Vite 6                                                   |
| Styling        | Tailwind CSS 4 plus scoped CSS custom properties         |
| Icons          | Lucide React and local React SVG components              |
| Fonts          | `@fontsource/atkinson-hyperlegible`, `@fontsource/inter` |
| Persistence    | Browser `localStorage`                                   |
| Serverless API | Vercel function in `api/grammar.ts`                      |
| Deployment     | Vercel configuration included                            |

The app is client-rendered and does not currently require an account or database. Preferences use a typed `UserPreferences` model and persist through the storage adapter in `lib/storage.ts`. Theme and display-size values are exposed to CSS through `data-theme` and `data-display-size` attributes on the application shell.

## Project Structure

```text
clearcard/
├── App.tsx                       Main application state and navigation
├── index.tsx                     React entry point and bundled font imports
├── index.css                     Theme tokens, responsive sizing, and global UI rules
├── types.ts                      Shared TypeScript domain types
├── components/
│   ├── CardEditorModal.tsx       Create and edit communication cards
│   ├── CategoryManagerModal.tsx  Add, remove, and reorder categories
│   ├── FullscreenViewer.tsx      Large presentation view
│   ├── Icons.tsx                 Local icon components
│   ├── PasscodeModal.tsx         Shared Secret Code keypad
│   └── SettingsModal.tsx         Appearance, sizing, color, and security settings
├── lib/
│   └── storage.ts                localStorage persistence and defaults
├── services/
│   └── geminiService.ts          Reserved service integration
└── api/
    └── grammar.ts                Vercel serverless grammar endpoint
```

## Local Development

### Requirements

- Node.js 18 or newer
- npm

### Install

```bash
npm install
```

### Start the Development Server

```bash
npm run dev
```

Vite is configured for `http://localhost:3000`. If that port is occupied, Vite selects another available port and prints the URL in the terminal.

### Production Build

```bash
npm run build
```

### Preview the Production Build

```bash
npm run preview
```

## Data and Privacy

Cards, categories, appearance preferences, and the Secret Code are currently stored in browser `localStorage`. There is no account system or cloud synchronization.

This keeps the app simple and offline-friendly after its assets load, but `localStorage` is not encrypted secure storage. Clearing browser data removes locally stored cards, and anyone with access to the same browser profile may be able to inspect stored values. The Vault is an interface-level privacy feature, not a substitute for platform encryption or a password manager.

## Current Limitations

- Data does not synchronize between browsers or devices.
- There is no export or import workflow yet.
- The app is not currently packaged as an installable PWA.
- Automated unit and end-to-end test coverage still needs to be added.
- The repository includes grammar service code, but Smart Rewrite is not exposed in the current card editor UI.

## Direction

The next useful work is practical rather than decorative:

- Add encrypted export and import for backups
- Add installable PWA support and offline caching
- Add automated accessibility and interaction tests
- Improve keyboard and screen-reader verification across complete workflows
- Add optional language support without making the core interface harder to scan

ClearCard is built around one priority: help someone communicate clearly with as little friction as possible.
