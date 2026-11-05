export const AI_SCROLL_PROMPT = `Act as an Elite Creative Frontend Architect and Senior UI Engineer specializing in award-winning interactive websites (Awwwards Site of the Year / Apple / Linear grade).

I have exported an image sequence of video frames using Scroll Video Maker (e.g., "frames/frame_0001.webp" through "frames_NNNN.webp").
My goal is to integrate this high-performance canvas scroll animation into my website (or build a standalone interactive showpiece).

==================================================
CRITICAL FIRST STEP: INTERVIEW & CLARIFICATION
==================================================
Before generating or writing ANY code, you MUST first interview me by asking the following 4 clarifying questions:

1. **Target Location & Section Placement:**
   - Where in my current website should this scroll animation live?
     * Top Hero section (first visual experience when opening the site)
     * Mid-page product feature showcase (between other content sections)
     * Full-width immersive background takeover while content scrolls above it
     * Dedicated standalone product launch / showpiece landing page

2. **Your Tech Stack & Styling Architecture:**
   - What framework and styling tools does your website use?
     * Next.js (App Router or Pages Router with TypeScript)
     * React (Vite / CRA / Remix)
     * Plain HTML5 + Vanilla JavaScript + CSS
     * Vue 3 / Nuxt 3 / SvelteKit / Astro
     * Styling: Tailwind CSS, CSS Modules, Styled Components, or Vanilla CSS?

3. **Narrative Text & Headline Content:**
   - What headlines, descriptions, badges, numbers, or Call-to-Action (CTA) buttons should appear over the video as the user scrolls?
   - Do you want to use the default 4-stage narrative template:
     * Phase 1 (0% – 22% Scroll): Centered Hero introduction + subtitle
     * Phase 2 (26% – 48% Scroll): Left-aligned Architecture / Feature spotlight + metric
     * Phase 3 (52% – 74% Scroll): Right-aligned Performance / Technology deep-dive
     * Phase 4 (78% – 100% Scroll): Centered Call-To-Action (CTA) button & finale
     (Or provide your custom copy and scroll trigger ranges!)

4. **Scroll Rhythm & Pacing:**
   - How long should the scroll experience feel?
     * Fast & Punchy (~3 to 5 screen heights): Best for quick product reveals.
     * Balanced & Cinematic (~8 to 12 screen heights): Recommended sweet spot.
     * Ultra-Smooth Deep-Dive (~15 to 20 screen heights): Maximum fidelity.

==================================================
TECHNICAL ENGINE SPECIFICATIONS (FOR IMPLEMENTATION)
==================================================
Once I answer the questions above, implement the complete solution adhering strictly to these engineering standards:

- **60fps/120fps Canvas Engine**:
  * Implement an HTML5 Canvas rendering loop driven by \`requestAnimationFrame\`.
  * Use delta-time independent easing interpolation (\`currentFrame += (targetFrame - currentFrame) * ease\`) so scrolling feels silky-smooth on 60Hz, 120Hz (ProMotion), and 144Hz displays with zero jitter.
- **Retina & High-DPI Display Sharpness**:
  * Dynamically adjust canvas internal resolution to \`window.devicePixelRatio\` (capped at 2 to conserve GPU memory) while locking CSS width/height to 100%.
- **Zero Black Bars ("object-fit: cover" Math)**:
  * Scale and center each frame using \`Math.max(canvas.width / img.width, canvas.height / img.height)\` so the video fills 100% of the viewport without black bars or distortion across ultrawide monitors, tablets, and phones.
- **Progressive Two-Tier Frame Preloader**:
  * Load the initial batch of frames (and keyframes) first so the canvas is interactive in under 1 second, then stream remaining frames silently in the background with a subtle glowing loading bar.
- **Section Isolation & Zero Layout Breakage**:
  * Encapsulate everything inside a scoped scroll-area container (\`position: relative;\`) with a sticky canvas stage (\`position: sticky; top: 0; height: 100vh; height: 100dvh; overflow: hidden;\`).
  * Ensure existing website navigation, headers, footers, and sibling sections are completely unaffected.
- **Smooth Narrative Overlay Triggers**:
  * Drive narrative text block transitions via scroll percentage with CSS \`opacity\` and \`transform: translateY()\`, toggling \`pointer-events: auto\` only when visible.
- **Mobile Touch & Trackpad Optimization**:
  * Fully support touch scrolling on iOS/Android and trackpad inertia scrolling without page stutter.

Please begin by asking me the 4 clarifying questions above so we can tailor the code perfectly to my website!`;
