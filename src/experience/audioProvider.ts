import type { NushuStory } from "./storyContent";

export type SentenceAudioStatus = "loading" | "ready" | "missing" | "failed";

export type SentenceAudioErrorMode =
  | "not-recorded"
  | "generation-pending"
  | "provider-error"
  | "invalid-source"
  | "unknown-sentence";

export type SentenceAudioSourceKind = "mock-prototype" | "remote-tts";

export interface SentenceAudioSource {
  kind: SentenceAudioSourceKind;
  description: string;
  uri?: string;
  mimeType?: string;
}

export interface SentenceAudioState {
  sentenceId: string;
  status: SentenceAudioStatus;
  statusLabel: string;
  statusDetail: string;
  source?: SentenceAudioSource;
  errorMode?: SentenceAudioErrorMode;
  evidenceNotice: string;
}

export interface AudioProvider {
  experienceNotice: string;
  getSentenceAudio(sentenceId: string): Promise<SentenceAudioState>;
  getStoryAudioStates(story: NushuStory): Promise<SentenceAudioState[]>;
}

export interface AudioContractReport {
  valid: boolean;
  states: SentenceAudioState[];
  issues: string[];
}

export interface FutureTtsAudioAdapterContract {
  requiredInput: string[];
  requiredOutput: string[];
  optionalOutput: string[];
  errorModes: SentenceAudioErrorMode[];
}

const prototypeAudioDetail =
  "女书声音提示：当前为示意声音，后续会替换为正式点读音频。";

const mockAudioEvidenceNotice =
  "mock 音频不能作为正式用户研究中的真实模型效果证据，只能验证逐句点读流程和音频契约。";

const mockAudioExperienceNotice =
  "当前声音仅用于验证逐句点读流程，不能作为正式研究中的模型效果证据。";

const mockReadySource: SentenceAudioSource = {
  kind: "mock-prototype",
  description: "本地示意点读声音，不代表真实女书 TTS 模型输出。"
};

const mockSentenceAudioCatalog: Record<string, SentenceAudioState> = {
  greeting: {
    sentenceId: "greeting",
    status: "ready",
    statusLabel: "正在播放示意声音",
    statusDetail: prototypeAudioDetail,
    source: mockReadySource,
    evidenceNotice: mockAudioEvidenceNotice
  },
  memory: {
    sentenceId: "memory",
    status: "ready",
    statusLabel: "正在播放示意声音",
    statusDetail: prototypeAudioDetail,
    source: mockReadySource,
    evidenceNotice: mockAudioEvidenceNotice
  },
  promise: {
    sentenceId: "promise",
    status: "missing",
    statusLabel: "这句声音暂未准备好",
    statusDetail: prototypeAudioDetail,
    errorMode: "not-recorded",
    evidenceNotice: mockAudioEvidenceNotice
  }
};

function cloneAudioState(state: SentenceAudioState): SentenceAudioState {
  return {
    ...state,
    source: state.source ? { ...state.source } : undefined
  };
}

function failedUnknownSentenceAudio(sentenceId: string): SentenceAudioState {
  return {
    sentenceId,
    status: "failed",
    statusLabel: "这句声音无法解析",
    statusDetail: "音频提供模块没有找到这个句子的契约状态。",
    errorMode: "unknown-sentence",
    evidenceNotice: mockAudioEvidenceNotice
  };
}

export const mockNushuAudioProvider: AudioProvider = {
  experienceNotice: mockAudioExperienceNotice,
  async getSentenceAudio(sentenceId) {
    const audio = mockSentenceAudioCatalog[sentenceId];

    return audio
      ? cloneAudioState(audio)
      : failedUnknownSentenceAudio(sentenceId);
  },
  async getStoryAudioStates(story) {
    return Promise.all(
      story.sentences.map((sentence) => this.getSentenceAudio(sentence.id))
    );
  }
};

const allowedAudioStatuses: SentenceAudioStatus[] = [
  "loading",
  "ready",
  "missing",
  "failed"
];

export async function validateStoryAudioContract(
  story: NushuStory,
  provider: AudioProvider
): Promise<AudioContractReport> {
  const states = await provider.getStoryAudioStates(story);
  const issues: string[] = [];
  const stateBySentenceId = new Map(
    states.map((state) => [state.sentenceId, state])
  );

  if (states.length !== story.sentences.length) {
    issues.push("音频状态数量必须与故事句子数量一致。");
  }

  story.sentences.forEach((sentence) => {
    const state = stateBySentenceId.get(sentence.id);

    if (!state) {
      issues.push(`句子 ${sentence.id} 没有音频状态。`);
      return;
    }

    if (!allowedAudioStatuses.includes(state.status)) {
      issues.push(`句子 ${sentence.id} 使用了未知音频状态。`);
    }

    if (state.status === "ready" && !state.source) {
      issues.push(`句子 ${sentence.id} 可播放状态必须包含播放来源。`);
    }

    if (state.status === "loading") {
      issues.push(`句子 ${sentence.id} 仍在加载，契约验证需要最终状态。`);
    }

    if (
      (state.status === "missing" || state.status === "failed") &&
      !state.errorMode
    ) {
      issues.push(`句子 ${sentence.id} 错误状态必须包含 errorMode。`);
    }

    if (!state.evidenceNotice) {
      issues.push(`句子 ${sentence.id} 必须声明音频证据边界。`);
    }
  });

  return {
    valid: issues.length === 0,
    states,
    issues
  };
}

export const realTtsAudioAdapterContract: FutureTtsAudioAdapterContract = {
  requiredInput: ["sentenceId", "nushuText", "zhText", "voiceProfile", "locale"],
  requiredOutput: [
    "sentenceId",
    "status",
    "statusLabel",
    "statusDetail",
    "source",
    "errorMode",
    "evidenceNotice"
  ],
  optionalOutput: ["timing", "metadata"],
  errorModes: [
    "not-recorded",
    "generation-pending",
    "provider-error",
    "invalid-source",
    "unknown-sentence"
  ]
};

export { prototypeAudioDetail };
