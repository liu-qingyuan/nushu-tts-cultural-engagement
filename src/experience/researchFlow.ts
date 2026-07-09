export type ResearchFlowPhase =
  | "pre-experience"
  | "story-experience"
  | "post-experience"
  | "complete";

export interface ResearchScaleInput {
  familiarity: number;
  interest: number;
  participationIntent: number;
}

export interface PreExperienceRecord extends ResearchScaleInput {
  submittedAt: string;
}

export interface PostExperienceInput extends ResearchScaleInput {
  openComment?: string;
  feedbackRecordId?: string;
}

export interface PostExperienceRecord extends ResearchScaleInput {
  openComment: string;
  feedbackRecordId?: string;
  submittedAt: string;
}

export interface ResearchRecord {
  preExperience?: PreExperienceRecord;
  storyCompletedAt?: string;
  postExperience?: PostExperienceRecord;
  completedAt?: string;
}

export interface ResearchFlowSnapshot {
  phase: ResearchFlowPhase;
  canAdvance: boolean;
  record: ResearchRecord;
}

export interface ResearchFlowSession {
  getSnapshot(): ResearchFlowSnapshot;
  enterSharedStory(): ResearchFlowSnapshot;
  updatePreExperience(input: Partial<ResearchScaleInput>): ResearchFlowSnapshot;
  submitPreExperience(input?: Partial<ResearchScaleInput>): ResearchFlowSnapshot;
  markStoryComplete(): ResearchFlowSnapshot;
  updatePostExperience(input: Partial<ResearchScaleInput>): ResearchFlowSnapshot;
  submitPostExperience(
    input: Partial<PostExperienceInput>
  ): ResearchFlowSnapshot;
}

interface ResearchFlowOptions {
  now?: () => string;
}

function isValidScaleValue(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 5
  );
}

function hasCompleteScaleInput(
  input: Partial<ResearchScaleInput>
): input is ResearchScaleInput {
  return (
    isValidScaleValue(input.familiarity) &&
    isValidScaleValue(input.interest) &&
    isValidScaleValue(input.participationIntent)
  );
}

function assertCompleteScaleInput<T extends Partial<ResearchScaleInput>>(
  input: T
): asserts input is T & ResearchScaleInput {
  if (!hasCompleteScaleInput(input)) {
    throw new RangeError(
      "Research scale values must be whole numbers from 1 to 5."
    );
  }
}

function cloneRecord(record: ResearchRecord): ResearchRecord {
  return {
    preExperience: record.preExperience
      ? { ...record.preExperience }
      : undefined,
    storyCompletedAt: record.storyCompletedAt,
    postExperience: record.postExperience
      ? { ...record.postExperience }
      : undefined,
    completedAt: record.completedAt
  };
}

export function createResearchFlowSession(
  options: ResearchFlowOptions = {}
): ResearchFlowSession {
  const now = options.now ?? (() => new Date().toISOString());
  let phase: ResearchFlowPhase = "pre-experience";
  const record: ResearchRecord = {};
  let preDraft: Partial<ResearchScaleInput> = {};
  let postDraft: Partial<ResearchScaleInput> = {};

  function canAdvance() {
    if (phase === "pre-experience") {
      return hasCompleteScaleInput(preDraft);
    }

    if (phase === "story-experience") {
      return true;
    }

    if (phase === "post-experience") {
      return hasCompleteScaleInput(postDraft);
    }

    return false;
  }

  function snapshot(): ResearchFlowSnapshot {
    return {
      phase,
      canAdvance: canAdvance(),
      record: cloneRecord(record)
    };
  }

  return {
    getSnapshot: snapshot,
    enterSharedStory() {
      if (phase === "pre-experience") {
        phase = "story-experience";
      }

      return snapshot();
    },
    updatePreExperience(input) {
      if (phase === "pre-experience") {
        preDraft = { ...preDraft, ...input };
      }

      return snapshot();
    },
    submitPreExperience(input = preDraft) {
      if (phase !== "pre-experience") {
        return snapshot();
      }

      assertCompleteScaleInput(input);
      record.preExperience = {
        ...input,
        submittedAt: now()
      };
      phase = "story-experience";

      return snapshot();
    },
    markStoryComplete() {
      if (phase === "story-experience") {
        record.storyCompletedAt = now();
        phase = "post-experience";
      }

      return snapshot();
    },
    updatePostExperience(input) {
      if (phase === "post-experience") {
        postDraft = { ...postDraft, ...input };
      }

      return snapshot();
    },
    submitPostExperience(input) {
      if (phase !== "post-experience") {
        throw new Error(
          "Post-experience feedback can only be submitted after the story."
        );
      }

      assertCompleteScaleInput(input);

      const submittedAt = now();
      record.postExperience = {
        familiarity: input.familiarity,
        interest: input.interest,
        participationIntent: input.participationIntent,
        openComment: input.openComment?.trim() ?? "",
        feedbackRecordId: input.feedbackRecordId,
        submittedAt
      };
      record.completedAt = submittedAt;
      phase = "complete";

      return snapshot();
    }
  };
}
