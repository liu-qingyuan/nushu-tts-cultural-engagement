# Redesign implementation contract

This contract records the foundation slice for issue #11. It keeps the current
Vite + TypeScript + vanilla CSS stack and does not change the research flow,
audio provider, feedback submitter, or participation action contracts.

## Scan

- Framework and styling: Vite, TypeScript, DOM rendering in `src/main.ts`, and a
  single vanilla CSS file in `src/styles.css`.
- Existing assets: `src/assets/noto-sans-nushu.ttf` is the only approved Nushu
  glyph asset in the product UI for story text.
- Existing flow: opening, before-reading ratings, sentence-level story reading,
  participation actions, after-reading feedback, and completion remain a linear
  single-page experience.
- Reference package: saved desktop and mobile images in
  `docs/design/nushu-redesign/reference-images/` define composition and mood, but
  their pseudo Nushu marks are placeholders only.

## Diagnose

- Generic prototype traces found:
  - System/Inter-like sans stack flattened the cultural/editorial voice.
  - Several white card surfaces and neutral borders read as generic UI instead
    of paper archive material.
  - Buttons and rating controls had focus states, but hover and pressed feedback
    were incomplete.
  - Rating controls looked like generic radio tiles rather than ruler or tick
    marks.
  - Paper texture, ink, cinnabar, deep jade-gray, hairline, and waveform rules
    existed only as scattered values rather than a reusable foundation.
- Cultural and asset risks:
  - Generated reference images include pseudo Nushu marks; implementation must
    not copy those marks as real text.
  - The UI must not describe generated ambience as real artifacts, real historic
    photos, or museum collection material.

## Fix

- `src/styles.css` now defines the shared warm paper, ink, cinnabar, deep
  jade-gray, low-contrast hairline, sound-line, and warm shadow tokens.
- The global typography stack uses editorial system serif fonts instead of an
  Inter-first stack; Nushu story glyphs continue to use `Noto Sans Nushu`.
- Paper fiber and archival ruling are implemented with CSS backgrounds only.
  They are atmosphere, not evidence or artifact imagery.
- Primary actions, feedback submit, participation actions, sentence buttons,
  textareas, and rating controls include hover, active/pressed, disabled, and
  focus-visible states.
- Rating controls use tick-like background treatment and cinnabar selected
  states while remaining native radio inputs for accessibility.
- Story and preview Nushu text remains DOM text rendered through the local
  Nushu font. Do not replace story glyphs with generated images.

## Boundary

- Allowed ambience: paper, ink wash, abstract audio/waveform motifs, archive
  rulings, and non-claim visual texture.
- Not allowed: AI-generated pseudo Nushu as story content, claims of real
  historical photos, claims of real artifacts, claims of museum holdings, or
  changes to the current public contracts without a new issue and Mermaid gate.
