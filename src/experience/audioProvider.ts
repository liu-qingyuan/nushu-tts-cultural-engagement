export type SentenceAudioStatus = "loading" | "ready" | "missing" | "failed";

export interface SentenceAudioState {
  sentenceId: string;
  status: SentenceAudioStatus;
  statusLabel: string;
  statusDetail: string;
}

export interface AudioProvider {
  getSentenceAudio(sentenceId: string): Promise<SentenceAudioState>;
}

const prototypeAudioDetail =
  "Nushu TTS prototype audio / 女书 TTS 原型音频；当前为占位播放状态，不代表真实模型效果。";

export const mockNushuAudioProvider: AudioProvider = {
  async getSentenceAudio(sentenceId) {
    if (sentenceId === "promise") {
      return {
        sentenceId,
        status: "missing",
        statusLabel: "原型音频暂缺",
        statusDetail: prototypeAudioDetail
      };
    }

    return {
      sentenceId,
      status: "ready",
      statusLabel: "正在播放 mock 原型音频",
      statusDetail: prototypeAudioDetail
    };
  }
};

export { prototypeAudioDetail };
