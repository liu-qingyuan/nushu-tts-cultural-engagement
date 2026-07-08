import { describe, expect, it } from "vitest";
import { createResearchFlowSession } from "./researchFlow";

describe("research flow session", () => {
  it("requires complete pre-experience scale answers before entering the story", () => {
    const session = createResearchFlowSession({
      now: () => "2026-07-08T00:00:00.000Z"
    });

    expect(session.getSnapshot()).toMatchObject({
      phase: "pre-experience",
      canAdvance: false,
      record: {}
    });

    session.updatePreExperience({
      familiarity: 2,
      interest: 4
    });
    expect(session.getSnapshot()).toMatchObject({
      phase: "pre-experience",
      canAdvance: false
    });

    const snapshot = session.submitPreExperience({
      familiarity: 2,
      interest: 4,
      participationIntent: 3
    });

    expect(snapshot).toMatchObject({
      phase: "story-experience",
      canAdvance: true,
      record: {
        preExperience: {
          familiarity: 2,
          interest: 4,
          participationIntent: 3,
          submittedAt: "2026-07-08T00:00:00.000Z"
        }
      }
    });
  });

  it("rejects out-of-range required scale values without changing phase", () => {
    const session = createResearchFlowSession();

    expect(() =>
      session.submitPreExperience({
        familiarity: 0,
        interest: 4,
        participationIntent: 3
      })
    ).toThrow("Research scale values must be whole numbers from 1 to 5.");

    expect(session.getSnapshot()).toMatchObject({
      phase: "pre-experience",
      canAdvance: false,
      record: {}
    });
  });

  it("records story completion before accepting post-experience feedback", () => {
    const timestamps = [
      "2026-07-08T00:00:00.000Z",
      "2026-07-08T00:01:00.000Z",
      "2026-07-08T00:02:00.000Z"
    ];
    const session = createResearchFlowSession({
      now: () => timestamps.shift() ?? "2026-07-08T00:03:00.000Z"
    });

    session.submitPreExperience({
      familiarity: 2,
      interest: 4,
      participationIntent: 3
    });

    expect(() =>
      session.submitPostExperience({
        familiarity: 4,
        interest: 5,
        participationIntent: 5,
        openComment: "The story made the TTS goal easier to understand.",
        feedbackRecordId: "feedback-1"
      })
    ).toThrow("Post-experience feedback can only be submitted after the story.");

    session.markStoryComplete();
    session.updatePostExperience({
      familiarity: 4,
      interest: 5,
      participationIntent: 5
    });
    expect(session.getSnapshot()).toMatchObject({
      phase: "post-experience",
      canAdvance: true
    });

    const complete = session.submitPostExperience({
      familiarity: 4,
      interest: 5,
      participationIntent: 5,
      openComment: "The story made the TTS goal easier to understand.",
      feedbackRecordId: "feedback-1"
    });

    expect(complete).toMatchObject({
      phase: "complete",
      canAdvance: false,
      record: {
        storyCompletedAt: "2026-07-08T00:01:00.000Z",
        postExperience: {
          familiarity: 4,
          interest: 5,
          participationIntent: 5,
          openComment: "The story made the TTS goal easier to understand.",
          feedbackRecordId: "feedback-1",
          submittedAt: "2026-07-08T00:02:00.000Z"
        },
        completedAt: "2026-07-08T00:02:00.000Z"
      }
    });
  });

  it("completes post-experience feedback when open comment is omitted", () => {
    const session = createResearchFlowSession({
      now: () => "2026-07-08T00:00:00.000Z"
    });

    session.submitPreExperience({
      familiarity: 1,
      interest: 3,
      participationIntent: 2
    });
    session.markStoryComplete();

    const complete = session.submitPostExperience({
      familiarity: 3,
      interest: 4,
      participationIntent: 4
    });

    expect(complete).toMatchObject({
      phase: "complete",
      record: {
        postExperience: {
          familiarity: 3,
          interest: 4,
          participationIntent: 4,
          openComment: "",
          submittedAt: "2026-07-08T00:00:00.000Z"
        }
      }
    });
  });
});
