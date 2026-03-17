# ClearCard — Smart Vis-Com Cards

> A modern, AI-powered communication tool designed for the Deaf and Hard of Hearing community.

---

## What is ClearCard?

ClearCard is a mobile-first web app that helps Deaf and Hard of Hearing individuals communicate quickly and clearly with hearing people in everyday situations — at the doctor, restaurant, store, or anywhere else.

Instead of typing out messages repeatedly, users build a personal library of high-contrast communication cards that can be shown on screen instantly.

---

## Features

### Communication Cards
- Create and store personal communication cards organized by category
- Full-screen display mode with adjustable font size for easy reading
- High-contrast text options (white or yellow) for maximum visibility
- Flip mode to rotate text for showing across a table

### Categories
- **Medical** — doctor visits, prescriptions, appointments
- **Daily** — restaurants, coffee orders, everyday tasks
- **Services** — car service, hair salon, rideshare
- **Emergency** — urgent alerts, emergency contacts
- **Vault** — sensitive private information locked behind a passcode
- Custom categories you can add and reorder

### Vault (Private Cards)
- Passcode-protected private card storage
- Toggle any card as private directly in the editor
- Vault auto-locks when leaving the section

### ClearChat
- Silent back-and-forth conversation tool
- **Deaf** and **Hearing** labeled message bubbles
- Auto-shifts to the other person after each message is sent
- Voice-to-text mic button for the hearing person
- Conversation history saved locally with editable names (Chat 1, Chat 2, etc.)
- Persistent across sessions using localStorage

### Smart Generate
- **Generate Card tab** — describe a situation and get a ready-made card instantly
- Supports English and Spanish
- Professional or Casual tone selection
- **Fix Grammar tab** — paste any text and get 2–3 corrected versions
- Copy to clipboard or save directly as a card

### Settings
- Accent color picker (5 presets + custom color wheel)
- Display text color (White or Yellow)
- Passcode management for Vault access

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Styling | Tailwind CSS v4 |
| Build Tool | Vite 6 |
| Icons | Lucide React |
| Storage | localStorage (no backend required) |
| Deployment | Vercel |
| API (grammar) | Anthropic Claude via Vercel serverless function |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Install & Run

```bash
git clone https://github.com/yourusername/clearcard.git
cd clearcard
npm install
npm run dev
```

Open **http://localhost:3000** in your browser.

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

```bash
npx vercel --prod
```

---

## Project Structure

```
clearcard/
├── App.tsx                    # Root app component
├── index.tsx                  # React entry point
├── index.html                 # HTML shell
├── index.css                  # Global styles + Tailwind
├── types.ts                   # TypeScript types
├── components/
│   ├── CardEditorModal.tsx    # Create/edit cards
│   ├── CategoryManagerModal.tsx
│   ├── ClearChat.tsx          # Silent conversation tool
│   ├── FullscreenViewer.tsx   # Full-screen card display
│   ├── Icons.tsx              # SVG icon components
│   ├── PasscodeModal.tsx      # Vault passcode entry
│   ├── SettingsModal.tsx      # App settings
│   └── SmartGenerateModal.tsx # AI card & grammar tool
├── lib/
│   └── storage.ts             # localStorage helpers
├── services/
│   └── geminiService.ts       # Smart generate templates
└── api/
    └── grammar.ts             # Vercel serverless grammar API
```

---

## Privacy

ClearCard stores all data **locally on the user's device** using `localStorage`. No accounts, no servers, no data collection. Each user's cards, conversations, and settings stay private on their own phone or browser.

---

## Accessibility

- High-contrast display mode
- Adjustable font size (24px–160px)
- Full ARIA labels and roles throughout
- Keyboard navigable
- Haptic feedback on supported devices
- Designed specifically for the Deaf and Hard of Hearing community

---

## Roadmap

- [ ] Add language support (Spanish, French, Chinese, and more)
- [ ] AI-powered grammar correction via Anthropic API

---

## License

MIT License — free to use, modify, and distribute.

---

Built with ❤️ for the Deaf and Hard of Hearing community.
