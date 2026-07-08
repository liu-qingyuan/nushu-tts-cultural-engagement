import type {
  AudioProvider,
  SentenceAudioErrorMode,
  SentenceAudioSource,
  SentenceAudioStatus
} from "./audioProvider";

export type PlaybackStatus = "idle" | "loading" | "playing" | "missing" | "failed";

export interface PlaybackSnapshot {
  activeSentenceId: string | null;
  status: PlaybackStatus;
  statusLabel: string;
  statusDetail: string;
  source?: SentenceAudioSource;
  errorMode?: SentenceAudioErrorMode;
}

export interface PlaybackSession {
  selectSentence(sentenceId: string): Promise<PlaybackSnapshot>;
  stop(): PlaybackSnapshot;
  getSnapshot(): PlaybackSnapshot;
  isSentenceActive(sentenceId: string): boolean;
}

const idleSnapshot: PlaybackSnapshot = {
  activeSentenceId: null,
  status: "idle",
  statusLabel: "尚未选择句子",
  statusDetail: "点击任意故事句子开始逐句点读。"
};

const playbackStatusByAudioStatus: Record<SentenceAudioStatus, PlaybackStatus> =
  {
    loading: "loading",
    ready: "playing",
    missing: "missing",
    failed: "failed"
  };

const loadingSnapshotFor = (sentenceId: string): PlaybackSnapshot => ({
  activeSentenceId: sentenceId,
  status: "loading",
  statusLabel: "正在准备这句声音",
  statusDetail: "正在准备女书点读声音。"
});

const fallbackLabelByStatus: Record<PlaybackStatus, string> = {
  idle: idleSnapshot.statusLabel,
  loading: "正在准备这句声音",
  playing: "声音正在播放",
  missing: "这句声音暂未准备好",
  failed: "声音暂时不可播放"
};

export function createPlaybackSession(
  audioProvider: AudioProvider
): PlaybackSession {
  let snapshot = idleSnapshot;
  let requestVersion = 0;

  return {
    async selectSentence(sentenceId) {
      requestVersion += 1;
      const currentRequest = requestVersion;
      snapshot = loadingSnapshotFor(sentenceId);
      const audio = await audioProvider.getSentenceAudio(sentenceId);

      if (
        currentRequest !== requestVersion ||
        snapshot.activeSentenceId !== sentenceId
      ) {
        return snapshot;
      }

      const status = playbackStatusByAudioStatus[audio.status];
      snapshot = {
        activeSentenceId: sentenceId,
        status,
        statusLabel: audio.statusLabel || fallbackLabelByStatus[status],
        statusDetail: audio.statusDetail,
        source: audio.source,
        errorMode: audio.errorMode
      };
      return snapshot;
    },
    stop() {
      requestVersion += 1;
      snapshot = idleSnapshot;
      return snapshot;
    },
    getSnapshot() {
      return snapshot;
    },
    isSentenceActive(sentenceId) {
      return snapshot.activeSentenceId === sentenceId;
    }
  };
}
