# Editorial Case Study Design System

## Direction

This portfolio presents a software developer to recruiters through evidence:
selected work, engineering capability, education, community impact, writing,
credentials, and recognition. The visual language is warm, precise, and
technical—closer to an engineering journal than a generic portfolio template.

Keep existing content, API data, and routing unless a task explicitly requests
otherwise.

## Colors

| Token | Value | Use |
| --- | --- | --- |
| `paper` | `#F3EEE3` | Primary light surface and page background |
| `ink` | `#111111` | Text, dark surfaces, rules, and borders |
| `signal` | `#D9541E` | Large display emphasis, borders, icons, and controls |

Rules:

- Use `paper` with `ink` text for light sections.
- Use `ink` with `paper` text for dark sections.
- Use `signal` sparingly to direct attention.
- Orange is allowed only for large text, borders, icons, and controls.
- Never use orange for small body copy, captions, metadata, or dense labels.
- Do not add gradients, glassmorphism, neon colors, or unrelated category colors.
- Surfaces are flat and opaque. Use borders, spacing, scale, and real imagery for
  contrast.
- Maintain at least 4.5:1 contrast for normal text and 3:1 for large text and
  controls.

## Typography

### Font pairing

- **Display:** `Comic Sans MS`, `Comic Neue`, fallback `cursive, sans-serif`.
- **Body, interface, tags, metadata, and indexes:** `Inter`, `Open Sans`,
  fallback `-apple-system, BlinkMacSystemFont, sans-serif`.
- All portfolio content uses this pairing. Existing `font-serif` and
  `font-mono` utility classes resolve to the body/interface family so no
  legacy font leaks into tags, navigation, cards, or article content.

Load only the weights used by the interface. Do not introduce additional display
fonts without a deliberate system change.

### Type scale

| Token | Desktop | Mobile | Line height | Use |
| --- | ---: | ---: | ---: | --- |
| `display` | 128px max | 56px min | 0.93 | Hero name |
| `h1` | 56px | 40px | 1.05 | Page-level heading |
| `h2` | 48px | 36px | 1.10 | Section heading |
| `h3` | 28px | 22px | 1.20 | Project or item heading |
| `body-lg` | 20px | 18px | 1.50 | Introductory copy |
| `body` | 16px | 16px | 1.55 | Default body copy |
| `body-sm` | 14px | 14px | 1.50 | Supporting copy |
| `meta` | 12px | 11px | 1.35 | Dates, labels, indexes |

Rules:

- Keep body copy between 45 and 75 characters per line.
- Use sentence case for headings and controls.
- Use uppercase only for short mono labels, dates, and numbered section markers.
- Use tight tracking for display headings and normal tracking for body copy.
- Do not use oversized type to compensate for weak content.

## Spacing

Use a 4px base unit:

| Token | Value |
| --- | ---: |
| `space-1` | 4px |
| `space-2` | 8px |
| `space-3` | 12px |
| `space-4` | 16px |
| `space-6` | 24px |
| `space-8` | 32px |
| `space-12` | 48px |
| `space-16` | 64px |
| `space-24` | 96px |
| `space-32` | 128px |

Layout rules:

- Center content in a maximum 1200px frame.
- Use 48px horizontal padding on desktop, 32px on tablet, and 20px on mobile.
- Use 96px section padding on desktop, 64px on tablet, and 48px on mobile.
- Align section rules, labels, headings, and content to the same frame edges.
- Let whitespace separate content groups; do not wrap every group in a card.
- Keep one clear primary action per viewport.

## Radius and borders

| Token | Value | Use |
| --- | ---: | --- |
| `radius-sm` | 2px | Inputs and compact controls |
| `radius-md` | 4px | Buttons and image frames |
| `radius-lg` | 8px | Occasional featured surface |
| `radius-pill` | 9999px | Status or tag controls only |

Rules:

- Prefer square or lightly rounded geometry.
- Do not use rounded cards as the default container pattern.
- Use 1px ink borders at reduced opacity or solid signal borders for emphasis.
- Avoid heavy shadows. Prefer rules, offset spacing, and flat color blocks.

## Page structure

Use the page as a recruiter-friendly narrative:

1. Hero — identity, positioning, proof point, and primary action
2. `01 / About` — professional summary and capabilities
3. `02 / Selected work` — projects and measurable outcomes
4. `03 / Skills` — practical technical toolkit
5. `04 / Education` — chronological academic timeline
6. `05 / Writing` — searchable blog and article detail view
7. `06 / Credentials` — certifications and verification links
8. `07 / Recognition` — milestones and achievements
9. Contact — clear conversion path

Each numbered section needs one concise label, one clear heading, and an
appropriate content structure. Do not force every section into the same card
grid.

## Component rules

### Navigation

- Keep the navigation compact, stable, and easy to scan.
- Use text links with a visible active state.
- Use `signal` for the active indicator or a small control border.
- Mobile controls must have a 44px minimum touch target and visible focus state.
- Section links must account for the fixed navigation height.

### Hero

- Use a left-aligned editorial composition.
- Show the name, specific positioning statement, proof point, and one primary CTA.
- Use `signal` only in large display text, a rule, icon, or control.
- Do not delay content behind a long loading screen.

### Project case studies

- Projects are the primary evidence and receive the strongest hierarchy.
- Use real project visuals: screenshots, product UI, diagrams, or authentic
  repository visuals. Never use decorative placeholders or gradients.
- Present the problem, contribution, technologies, and measurable outcome when
  the data supports it.
- Use consistent image ratios and meaningful alt text.
- Keep live product and repository actions explicit.

### Blog and article view

- Blog cards should expose title, category, date, excerpt, and reading action.
- Pagination must be keyboard accessible and show the current page.
- Article views should use a flat reading surface with strong title hierarchy,
  readable line length, visible progress, and clear close/share controls.
- Sanitize rich HTML and style headings, links, lists, images, quotes, and code
  consistently.

### Education, community, recognition, and credentials

- Education uses a timeline or chronological structure.
- Community work should emphasize role, organization, period, and impact.
- Recognition should emphasize the achievement and its evidence, not decoration.
- Certifications should show issuer, date, description, and verification link
  when available.

### Tags and metadata

- Use mono text for dates, roles, stacks, labels, and indexes.
- Tags are informational and flat, not decorative pills by default.
- Do not use skill percentage bars without a credible measurement basis.

### Buttons and controls

- Use flat ink or signal controls with clear text labels.
- Keep primary and secondary controls visually distinct.
- Provide hover, pressed, keyboard focus, and disabled states.
- Keep every interactive target at least 44px by 44px.

## Motion

- Use short hero entrances, quiet reveals, and restrained hover feedback.
- Prefer opacity and transform transitions between 150ms and 300ms.
- Respect `prefers-reduced-motion` in CSS and animation-library logic.
- Do not use scroll-jacking, looping decorative motion, tilt, or excessive scale.
- Scope GSAP work and clean up listeners, contexts, and ScrollTriggers on unmount.

## Responsive behavior

Validate at 390px, 768px, 1024px, and 1440px widths.

- Preserve content hierarchy at every width.
- Stack editorial columns before content becomes cramped.
- Never allow horizontal overflow.
- Keep body text at 16px or larger on mobile.
- Keep images lazy-loaded with meaningful dimensions and alt text.
- Provide loading, empty, and error states for API-backed sections.
- Ensure modal content, pagination, timelines, and forms remain usable by touch.

## Finish criteria

Before shipping a design change:

- The page reads as one editorial system, not a collection of templates.
- The required palette is used consistently.
- Orange appears only in approved roles.
- No gradients or glassmorphism remain in public portfolio surfaces.
- Project visuals are real, visible, and accessible.
- Numbered sections create an obvious recruiter scan path.
- Focus states, contrast, keyboard navigation, and reduced motion are verified.
