export interface FeedbackRatings {
  familiarity: number;
  interest: number;
  participationIntent: number;
}

export interface FeedbackRecord {
  storyId: string;
  ratings: FeedbackRatings;
  openComment: string;
  stage: "post-experience";
  submittedAt: string;
}

export interface FeedbackSubmissionResult {
  recordId: string;
  submittedAt: string;
}

export interface FeedbackSubmitter {
  submitFeedback(record: FeedbackRecord): Promise<FeedbackSubmissionResult>;
}

export interface MemoryFeedbackSubmitter extends FeedbackSubmitter {
  readonly records: FeedbackRecord[];
}

export function createMemoryFeedbackSubmitter(): MemoryFeedbackSubmitter {
  const records: FeedbackRecord[] = [];

  return {
    get records() {
      return [...records];
    },
    async submitFeedback(record) {
      records.push(record);

      return {
        recordId: `${record.storyId}-feedback-${records.length}`,
        submittedAt: record.submittedAt
      };
    }
  };
}
