# Gbera Front-End Foundation

Shared HTML/CSS/JavaScript foundation for the Gbera ride-hailing web app.
Plain HTML, CSS, and vanilla JavaScript only — no frameworks, build tools, or servers required.

## File structure

```
gbera/
├── css/
│   ├── variables.css   (design tokens)
│   ├── reset.css       (modern CSS reset)
│   ├── base.css        (body, typography, links, images)
│   ├── layout.css      (container, grid, flex/spacing/text utilities)
│   ├── components.css  (buttons, forms, cards, badges, alerts, tables, modal, navbar, footer, extras)
│   └── styles.css      (the ONLY stylesheet pages link to; @imports the above)
└── js/
    ├── utils.js        (helper functions on Gbera.utils)
    ├── components.js   (injects shared navbar + footer)
    └── main.js         (init, mobile menu, modal behavior)
```

Each developer adds their own page-specific files (e.g. `css/book-ride.css`, `js/book-ride.js`) on their feature branch. Do not edit the shared files unless coordinating with the team.

## How to include (every HTML page)

Mount points (place where the shared chrome should render):

```html
<div id="gbera-navbar"></div>
<!-- page content -->
<div id="gbera-footer"></div>
```

**Root pages (e.g. `index.html` at project root):**

```html
<link rel="stylesheet" href="css/styles.css">
...
<script src="js/utils.js"></script>
<script src="js/components.js"></script>
<script src="js/main.js"></script>
```

**Pages inside `/pages/` (e.g. `pages/book-ride.html`):**

```html
<link rel="stylesheet" href="../css/styles.css">
...
<script src="../js/utils.js"></script>
<script src="../js/components.js"></script>
<script src="../js/main.js"></script>
```

Load scripts in the order **utils → components → main**, at the end of `<body>`. `main.js` calls `renderNavbar()`/`renderFooter()` only when their mount elements exist, and wires the mobile menu toggle plus modal open/close via data attributes.

## JavaScript API

Global namespace: `window.Gbera`.

- `Gbera.utils`
  - `formatCurrency(amount)` → `"₦2,500.00"`
  - `formatDate(date)`, `formatTime(date)`
  - `debounce(fn, delay)`
  - `getQueryParam(name)`
  - `storage.save(key, value)`, `storage.load(key)`, `storage.remove(key)` (also top-level `Gbera.utils.save/load/remove`)
  - `isValidEmail(email)`, `isValidPhone(phone)` (Nigerian formats)
  - `showToast(message, type, duration)` — auto-dismissing `.alert`-styled notification
- `Gbera.components.renderNavbar()`, `Gbera.components.renderFooter()`

## Modal usage

```html
<button data-modal-open="ride-modal">Open</button>

<div class="modal-backdrop" data-modal-backdrop="ride-modal"></div>
<div class="modal" id="ride-modal" aria-hidden="true">
  <div class="modal-content">
    <div class="modal-header"><h3>Title</h3></div>
    <div class="modal-body">...</div>
    <div class="modal-footer">
      <button class="btn btn-ghost" data-modal-close>Cancel</button>
      <button class="btn btn-primary" data-modal-close>OK</button>
    </div>
  </div>
</div>
```

Modals also close on backdrop click and the `Escape` key.

## Navbar links config

Edit the single `NAV_CONFIG` object at the top of `js/components.js` to change navbar links. Paths are relative to the project root and are resolved automatically for pages in `/pages/`.

## Design tokens

All colors, spacing, radii, shadows, etc. are CSS custom properties on `:root` in `css/variables.css`. Prefer using tokens (e.g. `var(--color-primary)`, `var(--space-4)`) in page-specific CSS for consistency.

## Accessibility & motion

- Visible focus states, ≥44px tap targets on buttons.
- Respects `prefers-reduced-motion`.
- Mobile-first with breakpoints at ~640px, 768px, 1024px.

## Class reference (grouped)

- **Buttons:** `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-outline`, `.btn-danger`, `.btn-ghost`, `.btn-sm`, `.btn-lg`, `.btn-block`, `.btn-icon`, `.is-loading`
- **Forms:** `.form-group`, `.form-label`, `.form-input`, `.form-select`, `.form-textarea`, `.form-checkbox`, `.form-radio`, `.form-error`, `.form-hint`, `.input-icon`
- **Cards:** `.card`, `.card-header`, `.card-body`, `.card-footer`, `.card-image`
- **Badges:** `.badge-success`, `.badge-warning`, `.badge-danger`, `.badge-info`, `.badge-neutral`, `.badge-primary`
- **Alerts:** `.alert-success`, `.alert-warning`, `.alert-danger`, `.alert-info`
- **Tables:** `.table`, `.table-responsive`
- **Modal:** `.modal`, `.modal-backdrop`, `.modal-content`, `.modal-header`, `.modal-body`, `.modal-footer`
- **Navbar:** `.navbar`, `.navbar-brand`, `.navbar-links`, `.navbar-toggle`, `.navbar-menu`, `.navbar-actions`, `.active`
- **Footer:** `.footer`, `.footer-grid`, `.footer-col`, `.footer-bottom`
- **Extras:** `.avatar`, `.divider`, `.spinner`, `.map-placeholder`
- **Layout:** `.container`, `.section`, `.grid`, `.flex`, `.items-center`, `.justify-between`, `.gap-*`, `.mt-*`, `.mb-*`, `.p-*`, `.text-center`, `.text-muted`, `.hide-mobile`, `.hide-desktop`
