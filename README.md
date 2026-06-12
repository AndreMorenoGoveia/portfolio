# André Goveia — Portfolio

A scroll-driven portfolio in the spirit of an illuminated manuscript: a WebGL
marble colonnade you travel through as you scroll, project "plates" framed like
Renaissance engravings, and per-project pages typeset like scientific
monographs over an interactive gold ink background.

Built with **Vue 3 + TypeScript + Vite**, **Three.js** (all geometry is
procedural — no model files), and **GSAP ScrollTrigger**.

## Develop

```sh
npm install
npm run dev
```

## Make it yours

- **Identity** — name, tagline, links: [`src/data/site.ts`](src/data/site.ts)
- **Projects** — every plate and monograph: [`src/data/projects.ts`](src/data/projects.ts)
- **Palette & type** — design tokens: [`src/styles/main.css`](src/styles/main.css)
- **The 3D scene** — [`src/three/colonnadeScene.ts`](src/three/colonnadeScene.ts)
- **The paper-page ink field** — [`src/three/inkField.ts`](src/three/inkField.ts)

## Build

```sh
npm run build && npm run preview
```
