import { describe, expect, it } from "vitest";
import {
  mockNushuAudioProvider,
  prototypeAudioDetail,
  type AudioProvider
} from "./audioProvider";
import { createPlaybackSession } from "./playbackSession";

describe("Nushu story playback session", () => {
  it("starts and stops a mock prototype audio state for a selected sentence", async () => {
    const session = createPlaybackSession(mockNushuAudioProvider);

    const playback = session.selectSentence("greeting");

    expect(session.getSnapshot()).toEqual({
      activeSentenceId: "greeting",
      status: "loading",
      statusLabel: "正在加载原型音频",
      statusDetail:
        "正在解析 Nushu TTS prototype audio / 女书 TTS 原型音频状态。"
    });

    const active = await playback;

    expect(active).toEqual({
      activeSentenceId: "greeting",
      status: "playing",
      statusLabel: "正在播放 mock 原型音频",
      statusDetail:
        "Nushu TTS prototype audio / 女书 TTS 原型音频；当前为占位播放状态，不代表真实模型效果。"
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

  it("keeps the selected sentence visible when prototype audio is missing", async () => {
    const provider: AudioProvider = {
      async getSentenceAudio(sentenceId) {
        return {
          sentenceId,
          status: "missing",
          statusLabel: "provider 报告原型音频缺失",
          statusDetail: prototypeAudioDetail
        };
      }
    };
    const session = createPlaybackSession(provider);

    const active = await session.selectSentence("promise");

    expect(active).toEqual({
      activeSentenceId: "promise",
      status: "missing",
      statusLabel: "provider 报告原型音频缺失",
      statusDetail: prototypeAudioDetail
    });
    expect(session.isSentenceActive("promise")).toBe(true);
  });

  it("does not let a stale audio response replace a newer selected sentence", async () => {
    let resolveGreeting:
      | ((value: Awaited<ReturnType<AudioProvider["getSentenceAudio"]>>) => void)
      | undefined;
    const provider: AudioProvider = {
      async getSentenceAudio(sentenceId) {
        if (sentenceId === "greeting") {
          return new Promise((resolve) => {
            resolveGreeting = resolve;
          });
        }

        return {
          sentenceId,
          status: "ready",
          statusLabel: "正在播放第二句原型音频",
          statusDetail: prototypeAudioDetail
        };
      }
    };
    const session = createPlaybackSession(provider);

    const stalePlayback = session.selectSentence("greeting");
    const active = await session.selectSentence("memory");
    resolveGreeting?.({
      sentenceId: "greeting",
      status: "ready",
      statusLabel: "过期的第一句原型音频",
      statusDetail: prototypeAudioDetail
    });
    await stalePlayback;

    expect(active.activeSentenceId).toBe("memory");
    expect(session.getSnapshot()).toEqual({
      activeSentenceId: "memory",
      status: "playing",
      statusLabel: "正在播放第二句原型音频",
      statusDetail: prototypeAudioDetail
    });
  });
});
