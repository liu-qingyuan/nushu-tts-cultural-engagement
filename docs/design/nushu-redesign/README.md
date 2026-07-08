# Nushu redesign design package

This package captures the current design direction only. It is intended as input for a later `$to-prd-lqy` pass, then a `$to-issues-lqy` vertical-slice breakdown. It is not an implementation plan that should be coded in one large change.

## Confirmed design decisions

- Use a **文化展览式互动体验** positioning: the page should feel like a refined digital cultural exhibition, not a research questionnaire.
- Use a **纸本档案 + 声音仪式感** visual direction: paper texture, archive annotations, ink, muted cinnabar, sentence highlighting, and waveform/sound motifs.
- Preserve the **线性研究流程 + 故事体验优先** structure: opening, before-reading note, sentence-level story reading, after-reading feedback, and participation actions.
- Nushu glyphs must use **真实女书字形素材**. In this project, that means rendering Unicode Nushu text with the included real Nushu font until licensed image assets exist.
- Generated imagery is allowed for ambience only: paper, archive desk, ink texture, abstract exhibition scenes, waveform motifs. It must not be described as a real historical photo, real artifact, or museum collection.

These terms are also recorded in `CONTEXT.md`.

## Reference images

Desktop section references:

1. [desktop-01-hero.png](reference-images/desktop-01-hero.png)
2. [desktop-02-pre-reading.png](reference-images/desktop-02-pre-reading.png)
3. [desktop-03-story-reader.png](reference-images/desktop-03-story-reader.png)
4. [desktop-04-feedback.png](reference-images/desktop-04-feedback.png)
5. [desktop-05-participation.png](reference-images/desktop-05-participation.png)

Mobile screen references:

1. [mobile-01-hero.png](reference-images/mobile-01-hero.png)
2. [mobile-02-pre-reading.png](reference-images/mobile-02-pre-reading.png)
3. [mobile-03-story-reader.png](reference-images/mobile-03-story-reader.png)
4. [mobile-04-feedback.png](reference-images/mobile-04-feedback.png)
5. [mobile-05-participation.png](reference-images/mobile-05-participation.png)

Important: the generated images may contain AI-looking pseudo Nushu marks. Treat those marks as composition placeholders only. The implementation must render actual story Nushu text with the project font.

## Extracted design system

- Palette: warm paper background, off-black ink, muted cinnabar accent, deep jade-gray secondary tone, low-contrast hairlines.
- Material: subtle paper fiber, ink bleed, stamp-like active marks, soft archival shadows.
- Typography: editorial display scale for section titles; readable Chinese/English body copy; Nushu text displayed as a specimen using the Nushu font.
- Controls: rectangular ink or cinnabar buttons, underlined secondary links, large touch targets, visible focus states.
- Rating controls: 1-5 ruler-like controls with ink tick marks and cinnabar selected state.
- Story reader: open reading-table layout with sentence index, active Nushu specimen, translation, cultural note, and waveform playback area.
- Mobile: app-like responsive web, not a native app rewrite; safe-area-aware spacing, bottom/sticky actions where helpful, large readable text.

## PRD input for `$to-prd-lqy`

The PRD should ask for a visual redesign of the existing responsive web prototype, not a rewrite of the research model.

Primary user problem:

Users can complete the current flow, but the page still feels more like a functional prototype than a rich cultural experience. The redesign should make the Nushu story, voice, and cultural context feel immediate and memorable while preserving the research flow.

Solution shape:

Redesign the current single-page responsive web experience into a cultural exhibition-style story reader. Keep the existing before-reading ratings, sentence-level playback, after-reading feedback, save/share/learn-more actions, and testable state flow. Replace generic prototype surfaces with the archive/sound visual system above.

Suggested highest testing seam:

Use the existing top-level render behavior as the main seam: render the experience, interact as a user, and assert visible state changes and accessible behavior. Avoid testing CSS internals.

## Proposed issue slicing for `$to-issues-lqy`

Use these as a starting point, then quiz the user before publishing issues.

1. **Design-system foundation and asset rules**
   - Blocked by: none.
   - Scope: establish paper/archive palette, typography rules, Nushu glyph rendering constraints, metadata, and reusable CSS foundations without changing the flow.
   - Skills for agent: `$redesign-existing-projects`; optionally `$image-to-code` for extracting the common system from the saved references.

2. **Hero and before-reading note redesign**
   - Blocked by: design-system foundation.
   - Scope: redesign the entry and pre-reading rating experience end to end, preserving validation and the transition into the story.
   - Skills for agent: `$image-to-code`; use `$imagegen-frontend-web` only if the saved hero/pre-reading references need regeneration.

3. **Sentence-level story reader redesign**
   - Blocked by: design-system foundation.
   - Scope: redesign the story reader around a reading-table layout with sentence index, active Nushu specimen, translation, cultural note, and playback status.
   - Skills for agent: `$image-to-code`; use existing playback tests as behavioral guardrails.

4. **Feedback and participation completion redesign**
   - Blocked by: design-system foundation.
   - Scope: redesign after-reading ratings, open feedback, completion, save/share/learn-more actions, and inline status states.
   - Skills for agent: `$image-to-code`.

5. **Mobile responsive polish against phone references**
   - Blocked by: hero/pre-reading, story reader, feedback/participation.
   - Scope: make the implemented page match the mobile screen references as a responsive web experience, not a native app.
   - Skills for agent: `$imagegen-frontend-mobile` only if mobile references need regeneration; otherwise use saved mobile images.

6. **Visual QA, accessibility, and regression pass**
   - Blocked by: all redesign implementation slices.
   - Scope: run automated checks, verify keyboard focus and responsive screenshots, ensure no fake Nushu glyph images were introduced, and confirm the flow remains usable.
   - Skills for agent: Playwright-oriented validation if available; no new image generation unless visual gaps are discovered.

Mermaid gate expectation: most slices should not require Mermaid because they should preserve existing state machines and contracts. If any slice changes the research flow state machine, audio provider contract, feedback submitter contract, or participation action contract, that slice should require a Mermaid diagram before implementation.

## Skill routing for later agents

- `$grill-with-docs-lqy`: already used for design decisions; continue only if the design direction changes.
- `$to-prd-lqy`: next step. Use this design package and `CONTEXT.md`; do not re-interview.
- `$to-issues-lqy`: after the PRD exists, split into the vertical slices above and publish agent-ready issues.
- `$imagegen-frontend-web`: regenerate desktop section references only if a slice needs clearer visual input.
- `$imagegen-frontend-mobile`: regenerate mobile screen references only if mobile implementation ambiguity remains.
- `$image-to-code`: implementation agents should use it to analyze the saved references before coding each visual slice.
- `$redesign-existing-projects`: useful for auditing and removing generic prototype patterns while keeping the current stack.
