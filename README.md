# Nushu TTS Cultural Engagement

Public research prototype for packaging a Nushu text/story experience with a custom TTS model, then studying whether speech-based interaction lowers the perceptual barrier to an endangered writing tradition and improves user interest, understanding, and engagement.

## Core Idea

We build a simple, usable application around a Nushu TTS model:

- Nushu story/text browsing
- baseline TTS vs. enhanced Nushu TTS comparison when useful for the technical demo
- lightweight user feedback interface
- study flow for interviews and scales around interest, understanding, and participation

The design goal is not to make interaction design the main contribution. The system should make the technical contribution legible, make Nushu easier to experience, and provide enough structure for an HCI/IUI-style user study.

## Early Research Framing

Working claim:

> We use TTS technology to lower the perceptual barrier to Nushu, an endangered cultural and linguistic practice, and study how this affects people's interest and engagement.

Potential contribution split:

- Technical: an enhanced TTS model for Nushu or Nushu-adjacent speech presentation.
- System: a compact cultural experience that connects Nushu text, story, audio, and feedback.
- HCI: evidence from user experience evaluation that speech-supported interaction can improve interest, comprehension, or engagement with endangered cultural heritage.

## Prototype Scope

Keep the first version narrow:

- choose/read a short Nushu story
- show Nushu text, transliteration/translation, and cultural note
- play generated speech
- optionally compare baseline and enhanced TTS
- collect rating, correction/comment, and interview notes

## Local Prototype

This repository now includes a responsive web prototype for the top-level Nushu
story experience.

```bash
npm install
npm run dev
```

The dev server prints a local URL, usually `http://127.0.0.1:5173/`.

## Validation

Run the minimal verification command before handing off changes:

```bash
npm run check
```

`npm run check` runs the Vitest entry tests and a production build.

## Top-Level Experience Interface

The current implementation treats “女书故事体验” as a user-visible research
journey, not as a layout or file structure. Its public model describes the
participant-facing entry point and the default structured story:

- a default research entry shown to participants
- a single “start default experience” action
- a study note that makes the prototype boundary explicit
- a default story with stable sentence ids, Nushu text, Chinese explanation,
  English support text, cultural notes, and source/adaptation labeling
- sentence-level prototype audio state that keeps the selected Nushu text,
  translations, notes, and playback status synchronized

The story content is currently provided by a local structured data adapter
behind the story content interface. Prototype audio is provided through an
audio provider interface and a mock adapter; the playback session owns the
current sentence, switching, stop state, and highlight synchronization. The mock
adapter is not a real TTS model quality claim. Post-experience feedback is
submitted through a replaceable feedback submitter interface and defaults to an
in-memory research record adapter. This prototype does not lock in a baseline
TTS comparison, backend, account system, CMS, or real TTS model.
