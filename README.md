# 🚀 Modern Full-Stack Portfolio

A stunning, modern portfolio website built with React, TypeScript, and GSAP animations. Features multi-language support (English/Arabic) with RTL layout and a premium design aesthetic.

![Portfolio Preview](https://img.shields.io/badge/Status-Live-success) ![React](https://img.shields.io/badge/React-19.2.0-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue) ![GSAP](https://img.shields.io/badge/GSAP-Latest-green)

## ✨ Features

- **🎨 Modern Design**: Glassmorphism, vibrant gradients, animated backgrounds
- **🎬 Creative GSAP Animations**: Scroll-triggered effects, 3D transformations, magnetic buttons
- **🌍 Multi-Language**: Full English and Arabic support with RTL layout
- **📱 Fully Responsive**: Works seamlessly on mobile, tablet, and desktop
- **⚡ Performance Optimized**: Built with Vite for fast loading
- **🔧 Maintainable**: TypeScript, modular components, reusable data structures

## 🎯 Sections

- **Hero**: Animated introduction with floating gradient orbs
- **Projects**: Showcase your work with 3D tilt effect cards
- **Skills**: Categorized skills with animated progress bars
- **Experience**: Professional timeline with duration calculation
- **Contact**: Form with validation and social media links
- **Footer**: Back-to-top button and copyright

## 🛠️ Tech Stack

- **Frontend**: React 19.2.0, TypeScript 5.9.3
- **Build Tool**: Vite 7.2.4
- **Animations**: GSAP with ScrollTrigger
- **Internationalization**: react-i18next
- **Form Management**: react-hook-form
- **Styling**: CSS with custom variables and utilities

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm installed

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd hammam-portfolio

# Install dependencies
npm install

# Start development server
npm run dev
```

The portfolio will be available at `http://localhost:5173/`

### Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## 📝 Customization

### Update Personal Information

1. **Translations**: Edit `src/i18n/locales/en.json` and `ar.json`
2. **Projects**: Modify `src/data/projects.ts`
3. **Skills**: Update `src/data/skills.ts`
4. **Experience**: Edit `src/data/experiences.ts`
5. **Contact**: Change email and social links in `src/components/Contact.tsx`

### Change Colors

Edit CSS variables in `src/styles/variables.css`:

```css
:root {
  --color-primary: hsl(258, 89%, 66%); /* Purple */
  --color-secondary: hsl(180, 77%, 58%); /* Cyan */
  --color-accent: hsl(330, 85%, 65%); /* Pink */
}
```

### Add Project Images

Place images in `/public/projects/` and update paths in `src/data/projects.ts`

## 📂 Project Structure

```
src/
├── components/          # React components
│   ├── Navigation.tsx
│   ├── Hero.tsx
│   ├── Projects.tsx
│   ├── Skills.tsx
│   ├── Experience.tsx
│   ├── Contact.tsx
│   └── Footer.tsx
├── data/               # Portfolio content
│   ├── projects.ts
│   ├── skills.ts
│   └── experiences.ts
├── i18n/               # Localization
│   ├── config.ts
│   └── locales/
│       ├── en.json
│       └── ar.json
├── hooks/              # Custom React hooks
│   └── useGSAPAnimation.ts
├── styles/             # Global styles
│   ├── variables.css
│   └── global.css
├── utils/              # Utilities
│   └── animations.ts
├── App.tsx             # Main component
└── main.tsx            # Entry point
```

## 🎬 GSAP Animations

The portfolio includes various GSAP animations:

- **Text Reveals**: Skewed text animations with stagger
- **Scroll Triggers**: Sections fade in on scroll
- **3D Tilt**: Project cards with perspective transform
- **Magnetic Buttons**: Buttons follow cursor on hover
- **Floating Orbs**: Background gradients with random movement
- **Progress Bars**: Animated skill proficiency levels
- **Stagger Effects**: Sequential animations for lists

## 🌐 Internationalization

Supports English and Arabic with:

- Automatic language detection
- Language persistence (localStorage)
- Full RTL layout for Arabic
- Arabic typography (Cairo font)
- Mirrored animations for RTL

Toggle language using the button in the navigation bar.

## 📱 Responsive Breakpoints

- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px+

## 🎨 Design System

- **Colors**: Vibrant gradients with purple, cyan, and pink
- **Typography**: Inter (body), Space Grotesk (headings), Cairo (Arabic)
- **Effects**: Glassmorphism, glow, shimmer, gradients
- **Animations**: Smooth with custom easing functions

## 🔧 Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 📦 Dependencies

### Core

- react: ^19.2.0
- react-dom: ^19.2.0
- typescript: ~5.9.3

### Animations

- gsap: Latest

### Internationalization

- react-i18next: Latest
- i18next: Latest
- i18next-browser-languagedetector: Latest

### Forms

- react-hook-form: Latest

### Development

- vite: ^7.2.4
- @vitejs/plugin-react: ^5.1.1
- eslint: ^9.39.1

## 🚀 Deployment

### Recommended Platforms

- **Vercel**: Zero-config deployment
- **Netlify**: Automatic CI/CD from GitHub
- **GitHub Pages**: Free hosting for static sites
- **AWS S3 + CloudFront**: Scalable hosting

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

### Deploy to Netlify

```bash
npm run build
# Upload /dist folder to Netlify
```

## ✅ Browser Support

- Chrome 76+
- Firefox 103+
- Safari 9+
- Edge 79+

_Note: Requires backdrop-filter support for glassmorphism effects_

## 📝 License

This project is open source and available for personal and commercial use.

## 🤝 Contributing

Feel free to fork this project and customize it for your own portfolio!

## 📧 Contact

For questions or feedback, reach out via the contact form in the portfolio.

---

**Built with ❤️ using React, TypeScript, and GSAP**

_Created: January 2026_
