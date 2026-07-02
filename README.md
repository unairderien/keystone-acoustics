# Keystone Acoustics

Keystone Acoustics is a polished, high-end single-page marketing site for a boutique custom mechanical keyboard studio. The experience blends editorial storytelling, rich visual styling, subtle motion, and an interactive waitlist form to present the brand as both a craftsmanship-led product and a design-forward experience.

The project is built as a lightweight static website with a premium, handcrafted feel. Designed to feel tactile, deliberate, and premium from the first scroll.

## Highlights

- Elegant one-page brand experience for a custom keyboard studio
- Responsive layout tailored for desktop and mobile viewing
- Animated waveform interaction and scroll-reveal transitions
- Waitlist form with inline validation and simulated submission feedback
- Clean, modern asset structure suitable for quick deployment and iteration

## Tech Stack

This project uses a straightforward front-end stack built around:

- HTML5 for semantic page structure and content
- CSS3 with custom properties, responsive layouts, and motion styling
- Vanilla JavaScript for interactivity and UI behavior
- Vite as the local development server and production build tool

## Project Structure

```text
.
├── index.html
├── package.json
├── package-lock.json
├── src/
│   ├── main.js
│   ├── style.css
│   └── assets/
```

## Local Development Setup

### Prerequisites

- Node.js 18 or newer
- npm (bundled with Node.js)

### Installation

1. Clone the repository:

    ```bash
    git clone <repository-url>
    cd keystone-acoustics
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Start the development server:

    ```bash
    npm run dev
    ```

4. Open the local preview in your browser:
    ```text
    http://localhost:5173
    ```

### Production Build

To create a production build:

```bash
npm run build
```

To preview the built app locally:

```bash
npm run preview
```

## Live Demo

A demo version is available at:

[https://keystone-acoustics-unairderien.vercel.app](https://keystone-acoustics-unairderien.vercel.app)

## Troubleshooting

> The live demo link may occasionally experience routing anomalies, missing assets, or cache-related display issues due to Vercel deployment quirks. If something appears broken, try a hard refresh, clear your browser cache, or wait a moment and reload the page. Local development should remain the most reliable preview environment.

## Notes

This project is intentionally lightweight and static, making it easy to adapt for portfolio use, product launches, or studio branding pages. If you want to extend it further, the existing structure is well suited for adding more content sections, richer animations, or a real backend waitlist integration.
