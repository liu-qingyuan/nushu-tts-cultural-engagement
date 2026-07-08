import { describe, expect, it } from "vitest";
import {
  mockNushuAudioProvider,
  realTtsAudioAdapterContract,
  validateStoryAudioContract
} from "./audioProvider";
import { getDefaultStory } from "./storyContent";

describe("Nushu audio provider contract", () => {
  it("resolves every default story sentence to playable audio or an explicit error state", async () => {
    const report = await validateStoryAudioContract(
      getDefaultStory(),
      mockNushuAudioProvider
    );

    expect(report.valid).toBe(true);
    expect(report.issues).toEqual([]);
    expect(report.states).toEqual([
      expect.objectContaining({
        sentenceId: "greeting",
        status: "ready",
        source: expect.objectContaining({
          kind: "mock-prototype",
          description: expect.stringContaining("示意")
        })
      }),
      expect.objectContaining({
        sentenceId: "memory",
        status: "ready",
        source: expect.objectContaining({
          kind: "mock-prototype"
        })
      }),
      expect.objectContaining({
        sentenceId: "promise",
        status: "missing",
        errorMode: "not-recorded"
      })
    ]);
  });

  it("makes the mock audio evidence boundary explicit", async () => {
    const audio = await mockNushuAudioProvider.getSentenceAudio("greeting");

    expect(audio.evidenceNotice).toContain("mock 音频不能作为正式用户研究");
    expect(mockNushuAudioProvider.experienceNotice).toContain(
      "不能作为正式研究中的模型效果证据"
    );
  });

  it("fails unknown sentence ids with a contract error mode instead of inventing audio", async () => {
    const audio = await mockNushuAudioProvider.getSentenceAudio("unknown");

    expect(audio).toEqual(
      expect.objectContaining({
        sentenceId: "unknown",
        status: "failed",
        errorMode: "unknown-sentence"
      })
    );
    expect(audio.source).toBeUndefined();
  });

  it("documents the future real TTS adapter inputs, outputs, and error modes", () => {
    expect(realTtsAudioAdapterContract.requiredInput).toEqual([
      "sentenceId",
      "nushuText",
      "zhText",
      "voiceProfile",
      "locale"
    ]);
    expect(realTtsAudioAdapterContract.requiredOutput).toContain("source");
    expect(realTtsAudioAdapterContract.optionalOutput).toEqual([
      "timing",
      "metadata"
    ]);
    expect(realTtsAudioAdapterContract.errorModes).toEqual([
      "not-recorded",
      "generation-pending",
      "provider-error",
      "invalid-source",
      "unknown-sentence"
    ]);
  });
});
