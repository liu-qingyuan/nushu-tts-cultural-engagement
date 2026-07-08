import { describe, expect, it } from "vitest";
import {
  mockNushuAudioProvider,
  prototypeAudioDetail,
  type AudioProvider,
  type SentenceAudioState
} from "./audioProvider";
import { createPlaybackSession } from "./playbackSession";

describe("Nushu story playback session", () => {
  it("starts and stops a reading audio state for a selected sentence", async () => {
    const session = createPlaybackSession(mockNushuAudioProvider);

    const playback = session.selectSentence("greeting");

    expect(session.getSnapshot()).toEqual({
      activeSentenceId: "greeting",
      status: "loading",
      statusLabel: "正在准备这句声音",
      statusDetail: "正在准备女书点读声音。"
    });

    const active = await playback;

    expect(active).toEqual({
      activeSentenceId: "greeting",
      status: "playing",
      statusLabel: "正在播放示意声音",
      statusDetail: "女书声音提示：当前为示意声音，后续会替换为正式点读音频。",
      source: expect.objectContaining({
        kind: "mock-prototype"
      }),
      errorMode: undefined
    });
    expect(session.isSentenceActive("greeting")).toBe(true);

    session.stop();

    expect(session.getSnapshot()).toEqual({
      activeSentenceId: null,
      status: "idle",
      statusLabel: "尚未选择句子",
      statusDetail: "点击任意故事句子开始逐句点读。"
    });
  });

  it("keeps playback mutually exclusive when switching sentences", async () => {
    const session = createPlaybackSession(mockNushuAudioProvider);

    await session.selectSentence("greeting");
    const active = await session.selectSentence("memory");

    expect(active.activeSentenceId).toBe("memory");
    expect(session.isSentenceActive("greeting")).toBe(false);
    expect(session.isSentenceActive("memory")).toBe(true);
  });

  it("keeps the selected sentence visible when audio is missing", async () => {
    const provider: AudioProvider = {
      experienceNotice: prototypeAudioDetail,
      async getSentenceAudio(sentenceId) {
        return {
          sentenceId,
          status: "missing",
          statusLabel: "provider 报告声音缺失",
          statusDetail: prototypeAudioDetail,
          errorMode: "not-recorded",
          evidenceNotice: prototypeAudioDetail
        };
      },
      async getStoryAudioStates(story) {
        return Promise.all(
          story.sentences.map((sentence) => this.getSentenceAudio(sentence.id))
        );
      }
    };
    const session = createPlaybackSession(provider);

    const active = await session.selectSentence("promise");

    expect(active).toEqual({
      activeSentenceId: "promise",
      status: "missing",
      statusLabel: "provider 报告声音缺失",
      statusDetail: prototypeAudioDetail,
      source: undefined,
      errorMode: "not-recorded"
    });
    expect(session.isSentenceActive("promise")).toBe(true);
  });

  it("does not let a stale audio response replace a newer selected sentence", async () => {
    let resolveGreeting:
      | ((value: SentenceAudioState) => void)
      | undefined;
    const provider: AudioProvider = {
      experienceNotice: prototypeAudioDetail,
      async getSentenceAudio(sentenceId) {
        if (sentenceId === "greeting") {
          return new Promise((resolve) => {
            resolveGreeting = resolve;
          });
        }

        return {
          sentenceId,
          status: "ready",
          statusLabel: "正在播放第二句声音",
          statusDetail: prototypeAudioDetail,
          source: {
            kind: "mock-prototype",
            description: "第二句示意声音。"
          },
          evidenceNotice: prototypeAudioDetail
        };
      },
      async getStoryAudioStates(story) {
        return Promise.all(
          story.sentences.map((sentence) => this.getSentenceAudio(sentence.id))
        );
      }
    };
    const session = createPlaybackSession(provider);

    const stalePlayback = session.selectSentence("greeting");
    const active = await session.selectSentence("memory");
    resolveGreeting?.({
      sentenceId: "greeting",
      status: "ready",
      statusLabel: "过期的第一句声音",
      statusDetail: prototypeAudioDetail,
      source: {
        kind: "mock-prototype",
        description: "第一句示意声音。"
      },
      evidenceNotice: prototypeAudioDetail
    });
    await stalePlayback;

    expect(active.activeSentenceId).toBe("memory");
    expect(session.getSnapshot()).toEqual({
      activeSentenceId: "memory",
      status: "playing",
      statusLabel: "正在播放第二句声音",
      statusDetail: prototypeAudioDetail,
      source: {
        kind: "mock-prototype",
        description: "第二句示意声音。"
      },
      errorMode: undefined
    });
  });
});
