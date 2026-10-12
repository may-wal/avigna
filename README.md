# Avigna frontend

A responsive, static agricultural ecommerce and services website, using Avigna's supplied logo assets and service themes from the farm report folders.

Open `dist/index.html` in a browser. No installation or build is required. Deploy the contents of `dist` to any static website host.

Includes a redesigned editorial hero, six sample products with interactive packaging, quick-view dialogs, favourites, product comparison, search and category filters, price sorting, a persistent local shopping bag, quantity controls, and a demo checkout. Agricultural services, a rotatable 3D farm terrain with three layers and growth-stage controls, an illustrative crop planner, sample weather scenarios, field notes, an FAQ, and Avigna's original brand-animation video complete the experience. No backend, payment, or enquiry delivery is connected.

The six products, packaging, and prices are illustrative and labelled in the UI. Replace them with the approved catalog before launch. Service descriptions are based on supplied report topics, rather than verified commercial offerings. Weather is explicitly a sample scenario, not a live forecast. The farm visualization does not contain real measurements. The planner does not prescribe product doses. Photography is sourced from Unsplash. Fonts load from Google Fonts with local fallbacks.

The 3D model uses a lightweight canvas renderer with projected world coordinates and no runtime libraries. It pauses offscreen, limits pixel density, and supports reduced-motion preferences. The UI includes keyboard controls, accessible dialogs, focus handling, and responsive desktop/tablet/mobile layouts. Shopping bags and favourites are saved in browser localStorage; enquiry and checkout details stay in the page.

Optional developer commands (Node.js required):

```sh
npm install
npm run dev
npm test
```

The static preview runs at `http://127.0.0.1:4173`. The development dependency is used only for DOM-based verification, never by the website. `npm test` covers 15 interaction and asset checks. Browser visual verification was unavailable because permission to access the local preview was declined in this session.

Source files: `dist/index.html`, `dist/styles.css`, `dist/experience.css`, `dist/app.js`, and `dist/experience.js`. Deploy only `dist`; no build is needed.
