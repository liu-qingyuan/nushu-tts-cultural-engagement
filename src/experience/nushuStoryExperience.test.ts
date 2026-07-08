// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import {
  defaultNushuStoryExperience,
  getVisibleJourneyEntry
} from "./nushuStoryExperience";
import { getDefaultStory } from "./storyContent";
import { mockNushuAudioProvider } from "./audioProvider";
import type { FeedbackRecord, FeedbackSubmitter } from "./feedbackSubmission";

function waitForPrototypeAudio() {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

function waitForFeedbackSubmission() {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

describe("default Nushu story experience", () => {
  it("exposes a user-visible research journey entry", () => {
    const entry = getVisibleJourneyEntry();

    expect(entry.title).toContain("女书故事");
    expect(entry.primaryActionLabel).toBe("开始默认体验");
    expect(entry.studyPromise).toContain("不连接后端");
  });

  it("keeps the top-level module focused on the visible journey", () => {
    expect(defaultNushuStoryExperience).toEqual({
      name: expect.any(String),
      audience: expect.any(String),
      entry: expect.objectContaining({
        title: expect.any(String),
        primaryActionLabel: expect.any(String)
      }),
      story: expect.objectContaining({
        title: expect.any(String),
        sentences: expect.any(Array)
      })
    });
  });

  it("loads a default structured story for the visible reading journey", () => {
    const story = getDefaultStory();

    expect(story.title).toContain("三朝书");
    expect(story.culturalContext).toContain("女书");
    expect(story.sourceNote).toContain("改写");
    expect(story.sentences).toHaveLength(3);
    expect(story.sentences[0]).toEqual({
      id: "greeting",
      nushuText: expect.any(String),
      zhText: expect.stringContaining("姐妹"),
      enText: expect.stringContaining("sister"),
      culturalNote: expect.stringContaining("三朝书")
    });
  });

  it("renders the default story text, translations, cultural notes, and source note", async () => {
    document.body.innerHTML = '<div id="app"></div>';

    const { renderExperience } = await import("../main");
    const app = document.querySelector<HTMLElement>("#app");

    expect(app).not.toBeNull();
    renderExperience(app as HTMLElement);

    expect(app?.textContent).toContain("三朝书里的问候");
    expect(app?.textContent).toContain("远方的姐妹");
    expect(app?.textContent).toContain("Distant sister");
    expect(app?.textContent).toContain("承载祝福");
    expect(app?.textContent).toContain("并非未经改动的原始文献");
  });

  it("lets users click a sentence to see synchronized prototype audio state", async () => {
    document.body.innerHTML = '<div id="app"></div>';

    const { renderExperience } = await import("../main");
    const app = document.querySelector<HTMLElement>("#app");
    renderExperience(app as HTMLElement);

    const greeting = Array.from(app?.querySelectorAll("button") ?? []).find(
      (button) => button.textContent?.includes("远方的姐妹")
    );

    expect(app?.textContent).toContain(
      "Nushu TTS prototype audio / 女书 TTS 原型音频"
    );
    expect(greeting).toBeDefined();

    greeting?.click();
    await waitForPrototypeAudio();

    expect(greeting?.getAttribute("aria-pressed")).toBe("true");
    expect(greeting?.textContent).toContain("正在播放 mock 原型音频");
    expect(greeting?.textContent).toContain("Distant sister");
    expect(greeting?.textContent).toContain("不代表真实模型效果");
  });

  it("keeps sentence playback mutually exclusive in the rendered story", async () => {
    document.body.innerHTML = '<div id="app"></div>';

    const { renderExperience } = await import("../main");
    const app = document.querySelector<HTMLElement>("#app");
    renderExperience(app as HTMLElement);
    const buttons = Array.from(app?.querySelectorAll("button") ?? []);
    const greeting = buttons.find((button) =>
      button.textContent?.includes("远方的姐妹")
    );
    const memory = buttons.find((button) =>
      button.textContent?.includes("我们把旧日的歌写下")
    );

    greeting?.click();
    await waitForPrototypeAudio();
    memory?.click();
    await waitForPrototypeAudio();

    expect(greeting?.getAttribute("aria-pressed")).toBe("false");
    expect(greeting?.textContent).not.toContain("正在播放 mock 原型音频");
    expect(memory?.getAttribute("aria-pressed")).toBe("true");
    expect(memory?.textContent).toContain("正在播放 mock 原型音频");
  });

  it("shows a clear user-visible state when prototype audio is missing", async () => {
    document.body.innerHTML = '<div id="app"></div>';

    const { renderExperience } = await import("../main");
    const app = document.querySelector<HTMLElement>("#app");
    renderExperience(app as HTMLElement);
    const promise = Array.from(app?.querySelectorAll("button") ?? []).find(
      (button) => button.textContent?.includes("等到春水再涨时")
    );

    promise?.click();
    await waitForPrototypeAudio();

    expect(promise?.getAttribute("aria-pressed")).toBe("true");
    expect(promise?.textContent).toContain("原型音频暂缺");
    expect(promise?.textContent).toContain("Nushu TTS prototype audio");
  });

  it("submits post-experience feedback as a structured research record", async () => {
    document.body.innerHTML = '<div id="app"></div>';
    const submittedRecords: FeedbackRecord[] = [];
    const feedbackSubmitter: FeedbackSubmitter = {
      async submitFeedback(record) {
        submittedRecords.push(record);
        return {
          recordId: `test-feedback-${submittedRecords.length}`,
          submittedAt: record.submittedAt
        };
      }
    };

    const { renderExperience } = await import("../main");
    const app = document.querySelector<HTMLElement>("#app");
    renderExperience(
      app as HTMLElement,
      defaultNushuStoryExperience,
      mockNushuAudioProvider,
      feedbackSubmitter
    );

    const interest = app?.querySelector<HTMLInputElement>(
      'input[name="interestLift"][value="5"]'
    );
    const understanding = app?.querySelector<HTMLInputElement>(
      'input[name="understandingSupport"][value="4"]'
    );
    const participation = app?.querySelector<HTMLInputElement>(
      'input[name="participationIntent"][value="5"]'
    );
    const comment = app?.querySelector<HTMLTextAreaElement>(
      'textarea[name="openComment"]'
    );
    const submit = app?.querySelector<HTMLButtonElement>(
      'button[type="submit"]'
    );

    interest?.click();
    understanding?.click();
    participation?.click();
    if (comment) {
      comment.value = "I understand why Nushu voice matters after the story.";
      comment.dispatchEvent(new Event("input", { bubbles: true }));
    }
    submit?.click();
    await waitForFeedbackSubmission();

    expect(submittedRecords).toHaveLength(1);
    expect(submittedRecords[0]).toMatchObject({
      storyId: "sisters-letter",
      ratings: {
        interestLift: 5,
        understandingSupport: 4,
        participationIntent: 5
      },
      openComment:
        "I understand why Nushu voice matters after the story.",
      stage: "post-story"
    });
    expect(submittedRecords[0]?.submittedAt).toEqual(expect.any(String));
    expect(app?.textContent).toContain("反馈已记录");
    expect(app?.textContent).toContain("test-feedback-1");

    if (comment) {
      comment.value = "Updated comment after reading the success state.";
      comment.dispatchEvent(new Event("input", { bubbles: true }));
    }

    expect(submit?.disabled).toBe(false);
    expect(app?.textContent).toContain("已修改反馈，可再次提交更新记录");
  });
});
