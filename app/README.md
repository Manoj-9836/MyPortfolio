## Versioning & Release

Use npm versioning to bump app versions without manually editing `package.json`.

### Bump version

- Patch (bug/UI fixes): `npm run release:patch`
- Minor (new backward-compatible features): `npm run release:minor`
- Major (breaking changes): `npm run release:major`

This will:

- update `version` in `package.json`
- create a Git commit
- create a Git tag

### Push commits + tags

After bumping version, push with:

`npm run release:push`

Vercel will detect the push and rebuild automatically.

## CursorSwarm Animation

The website integrates `cursor-swarm.js` to create a scroll-driven "agents build the page" animation.

### Library Location & Assets
- **Vendor Scripts**: [`public/vendor/cursor-swarm.min.js`](public/vendor/cursor-swarm.min.js) (production build, loaded in `index.html`)
- **Development/Readable Source**: [`public/vendor/cursor-swarm.js`](public/vendor/cursor-swarm.js)
- **License**: [`public/vendor/cursor-swarm.LICENSE`](public/vendor/cursor-swarm.LICENSE) (MIT License)

### Configuration & Controls
All settings are centralized in [`src/lib/cursorSwarm.ts`](src/lib/cursorSwarm.ts) in the `SWARM_CONFIG` object:

```ts
export const SWARM_CONFIG = {
  enabled: true,               // Single flag to enable/disable the animation entirely
  cursors: 3,                  // Cursor count on desktop
  mobileCursors: 2,            // Cursor count on mobile devices (<768px)
  palette: ['#D9541E', '#F3EEE3', '#FF7A3D'], // Agent cursor colors
  ignore: 'nav, header, form, ...',            // Selectors excluded from the swarm
  deconstruct: false,          // Build once: content stays permanently built after cursors assemble it
  copyPaste: 0.55,             // Probability of copy-pasting repeated sibling cards
  relocation: 0.15,            // Probability of building slightly out-of-place and dragging home
  exitAfterBuild: true,        // Fly agents off-screen when out of work
  idle: 'hide',                // Cursors disappear completely when not actively building
  hud: true,                   // Toggle the status HUD pill
  hudPosition: 'bottom-left',  // 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'
  respectReducedMotion: true,  // Automatically skips animation for prefers-reduced-motion
  cloakTimeout: 2000,          // Fallback timeout to guarantee page visibility
};
```

### To Disable
Set `SWARM_CONFIG.enabled` to `false` in `src/lib/cursorSwarm.ts`. The page will render normally with standard layout.

### Section & Component Attributes
Sections and elements use documented `data-cs*` attributes:
- `data-cs="type"`: Headings typed character-by-character with caret.
- `data-cs="words"`: Paragraphs and bios typed word-by-word.
- `data-cs="pop"`: Action buttons and skill chips popped into existence.
- `data-cs="media"`: Profile photos, certificate images, and project thumbnails revealed via scanlines.
- `data-cs-copy="true"`: Repeated cards in grids (Projects, Skills, Education, Certifications, Achievements, Blog) copied from sibling cards.
- `data-cs-ignore`: Navigation bar, search inputs, dialog modals, and forms are ignored to ensure full user interactivity.


