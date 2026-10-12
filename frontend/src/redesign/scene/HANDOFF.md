# Motion and 3D implementation — 2026-10-12

The earlier pass was visually restrained and did not contain a live 3D experience. This pass adds that experience to the production homepage rather than relying on the old legacy BIM demo.

## What changed

- A procedural Three.js sculpture in the hero: four beveled glass/metal perspectives, image-based lighting, real depth and real-time rendering.
- Drag to rotate, left/right keyboard rotation, three arrangement choices, Pause/Play, Follow scroll, and Reset view. Native vertical touch scrolling is preserved with `touch-action: pan-y`.
- Scroll alignment is reversible. Choosing an arrangement overrides automatic alignment until Follow scroll is selected.
- Headings enter as whole blocks; images reveal with an animated mask. Arabic glyphs are not split into character animations. Text starts readable and does not depend on animation completion.
- Stronger bounded image parallax and outgoing-card scaling; image zoom/brightness on hover, service selection hover, button/arrow movement and journey-row feedback.
- The floating call action follows actual CTA visibility, including when the model makes the mobile hero taller. Booking contracts and files are unchanged.

## Boundaries and rendering

Owned files: `frontend/src/redesign/scene/**`, homepage JSX/CSS, and the public composition’s floating-call visibility logic. The optional injected hero visual still takes precedence, avoiding two renderers if another phase supplies one. No package, lockfile, backend, database, or foundation token changes were made.

Three.js was already installed. The renderer is dynamically imported near the visible hero. There are four panel groups with shared geometries/materials, capped device pixel ratio of 1.5, and a target ceiling of 30 automatic draw calls per second. Rendering stops offscreen, in a hidden document, on Pause, and under reduced motion. Materials, geometry, environment render target, canvas, observers and listeners are disposed on unmount. A CSS 3D view remains during loading or WebGL failure/context loss. These controls use the same arrangement math in both paths.

The main layout preserves imagery, all nine canonical services, the existing section IDs and booking callback sources. No customer submissions were made for these checks.

## Actual verification

- 19 existing homepage content/SSR/source checks and 3 new scene-math tests passed (22/22). New tests cover invalid/out-of-range progress, alignment with retained depth, and exact reversal without accumulated state.
- Production build passed: Vite 6.4.3, 1,947 modules. Initial JS 365.31 kB / 115.13 kB gzip; CSS 41.20 kB / 8.97 kB gzip. The deferred renderer helper is 4.72 kB and the shared Three.js chunk is 571.29 kB / 144.81 kB gzip. Vite warns about that shared graphics chunk. These are bundle sizes, not loading or Core Web Vitals results.
- Browser verified a real canvas with `data-renderer=webgl` on port 3001. The renderer advanced its draw counter, and the pause counter remained 2609 across separate observations. Keyboard rotation changed the yaw to 12.605 degrees while paused.
- Pointer dragging changed yaw to 56.15 degrees. Reset and arrangement selections updated their actual pressed states.
- Follow scroll changed progress from 0 to 0.339 on forward scroll, with Connect selected; reverse scroll restored Explore.
- Offscreen draw count stayed at 1537 across separate observations. Image hover reached a computed scale of 1.2.
- EN/AR mobile at 390×844 showed no horizontal overflow. The English primary call ended at approximately 458 px, within the initial viewport; Arabic model selection kept the floating call action available.
- The actual Reduce motion control disabled sticky card behavior and automatic model rendering, while keeping manual controls usable. System preference logic is implemented; the native OS setting was not changed in this test.
- `git diff --check` and formatting checks pass. Unrelated phase source files remain untouched.

## Limits

No available trace/Lighthouse tool was exposed in this session, so CPU time, frame pacing, thermal behavior, Core Web Vitals and physical-device performance were not measured. WebGL initialization failure/context-loss recovery was inspected in code; a context loss was not forcibly injected. A CSS 3D loading view was observed before the real renderer initialized. Native mobile touch hardware and screen-reader behavior were not tested.

Implementation API reference: [Three.js documentation](https://threejs.org/docs/). Installed source and live browser output were used to verify API behavior.

## Review

Refresh http://127.0.0.1:3001/ and start at the hero. The page is rebuilt locally; no external deployment or commit was made.
