## Summary

Full redesign of the portfolio based on the "Hammam Portfolio Redesign" canvas (همام DB brand: navy → blue, Neo Sans Arabic), dark by default, with real CV content, a new Projects page, and scroll/click interactions.

## What changed

- **Design system & theme** — brand tokens as CSS variables mapped into Tailwind v4; dark default with a light toggle (saved per visitor, applied before first paint); full Arabic RTL and English.
- **CV data** — experience (Adim Tech, freelance), education, grouped skills (Nest.js / Docker marked Basic), contact details. Removed fake skill percentages and placeholder companies.
- **Projects page (`/projects`)** — category filters with GSAP Flip, cards with 3D tilt and hover video preview, and a gallery modal (images + videos, thumbnails, arrow keys, deep link via `?p=<id>`). Portrait screenshots get a taller stage with a blurred backdrop.
- **Featured projects** — Bathth streaming platform, Al-Tebyan school system and the retail POS lead the home page and the projects page, with descriptions (EN/AR) and stacks taken from each project's `package.json` / README.
- **Interactions** — hero intro with a clickable typing terminal, pinned horizontal projects row on desktop, scroll-velocity tech marquee, timeline that draws on scroll, count-up stats, magnetic buttons, cursor glow, card spotlight borders, click ripples, scroll progress bar. All respect `prefers-reduced-motion`.
- **Contact** — WhatsApp in the contact cards, a "Send on WhatsApp" form button, social row and footer; copy-to-clipboard for email and phone; form opens the mail app (no backend).
- **Routing** — `react-router-dom` added; `@gsap/react` added for scoped animation cleanup.
- **Mobile** — horizontal overflow clipped at the root (animation start states were widening the phone viewport), mobile menu portalled to `<body>` so the header's `backdrop-filter` no longer collapses it, swipeable skill categories, tighter timeline, full-width form buttons, and an RTL-safe filter pill on the projects page.

## Notes for review

- `tsconfig.app.json` sets `forceConsistentCasingInFileNames: false` to work around GSAP shipping both `Flip.d.ts` and `flip.d.ts` (fails on Windows otherwise).
- Vendor chunks are split in `vite.config.ts`.
- Media lives in `public/projects/<folder>/`; `tebyan_video.mp4` is ~39 MB and could be compressed. The `Bath Stream platfrom` folder name has spaces, so its paths are URL-encoded in `projects.json`.
- Older projects (training system, marketplace dashboard, etc.) still have no media and show branded placeholders.
- The SPA uses path routes, so the host needs a fallback to `index.html` for `/projects`.

## Testing

- `tsc -b`, `eslint`, and `vite build` pass.
- Checked in the browser at desktop and phone width, in English and Arabic: hero, pinned projects row, filters, gallery (landscape + portrait), timeline, contact form validation, WhatsApp links.
- Phone width (375px): page width equals the viewport, menu overlay opens full-screen, filter pill matches the active tab in both directions.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
