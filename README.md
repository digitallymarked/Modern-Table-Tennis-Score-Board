# Modern Table Tennis Score Board

Free and open source table tennis score board with automatic serve tracking, match timer, and multi-match support.

[Live Demo](https://modern-table-tennis-score-board.vercel.app/)

## Features

- **Automatic serve tracking** — ball indicator animates across the full screen width to show who is serving, based on standard table tennis rules (every 2 points, deuce handling included)
- **Match & game scoring** — track both game score and match score independently
- **Player names** — editable player names saved to local storage
- **Match title** — customisable match/event label
- **Confetti on game win** — celebration animation when a player wins a game
- **Players always swap sides on next game** — sides are swapped automatically when starting a new game while the first server stays on the same side
- **Match timer** — stopwatch with play/pause inline next to the timer display, timer centered on screen
- **Keyboard shortcuts** — full keyboard control:
  | Key | Action |
  |-----|--------|
  | Q | Left game score +1 |
  | A | Left game score −1 |
  | W | Left match score +1 |
  | S | Left match score −1 |
  | R | Right game score +1 |
  | F | Right game score −1 |
  | E | Right match score +1 |
  | D | Right match score −1 |
- **48×48px touch targets** — all score buttons are mobile-friendly
- **Drag to set scores** — drag up/down on any score number to adjust it directly
- **Fullscreen mode** — single button to go fullscreen
- **Dark / light mode** — toggle with animated icon
- **Persistent state** — all scores, names, and settings saved to local storage
- **Share result** — native share sheet via Web Share API

## Menu Actions

Accessible from the grid icon in the top-right corner. The menu stays open until explicitly dismissed (Escape or click outside).

**Reset**
- Reset Game Score
- Reset Match Score
- Reset All

**Swap**
- Swap Player Names
- Swap Match Score
- Swap Game Score

**Timer**
- Reset Timer
- Show / Hide Timer

**Other**
- Share Result

## Tech Stack

- [Next.js 15](https://nextjs.org/) (App Router)
- [React 19](https://react.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Base UI](https://base-ui.com/) — headless UI primitives (Popover, Switch)
- [Motion](https://motion.dev/) — animations and layout transitions
- [Lucide React](https://lucide.dev/) — icons
- [next-themes](https://github.com/pacocoursey/next-themes) — dark/light mode
- TypeScript

## Self Hosting

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
npm start
```

## License

Distributed under the [MIT License](LICENSE).
