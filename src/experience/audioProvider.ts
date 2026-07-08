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
  "女书声音提示：当前为示意声音，后续会替换为正式点读音频。";

export const mockNushuAudioProvider: AudioProvider = {
  async getSentenceAudio(sentenceId) {
    if (sentenceId === "promise") {
      return {
        sentenceId,
        status: "missing",
        statusLabel: "这句声音暂未准备好",
        statusDetail: prototypeAudioDetail
      };
    }

    return {
      sentenceId,
      status: "ready",
      statusLabel: "正在播放示意声音",
      statusDetail: prototypeAudioDetail
    };
  }
};

export { prototypeAudioDetail };
