// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from "vitest";
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

function selectRating(
  app: HTMLElement | null,
  name: string,
  value: number
) {
  app
    ?.querySelector<HTMLInputElement>(`input[name="${name}"][value="${value}"]`)
    ?.click();
}

function enterStoryExperience(app: HTMLElement | null) {
  selectRating(app, "preFamiliarity", 2);
  selectRating(app, "preInterest", 4);
  selectRating(app, "preParticipationIntent", 3);
  const startStory = Array.from(app?.querySelectorAll("button") ?? []).find(
    (button) => button.textContent === "进入故事体验"
  );
  startStory?.click();
}

function completeStoryExperience(app: HTMLElement | null) {
  const completeStory = Array.from(app?.querySelectorAll("button") ?? []).find(
    (button) => button.textContent === "完成故事体验，进入反馈"
  );
  completeStory?.click();
}

function findButtonByText(app: HTMLElement | null, text: string) {
  return Array.from(app?.querySelectorAll("button") ?? []).find((button) =>
    button.textContent?.includes(text)
  );
}

describe("default Nushu story experience", () => {
  beforeEach(() => {
    globalThis.localStorage?.clear();
  });

  it("exposes a user-visible research journey entry", () => {
    const entry = getVisibleJourneyEntry();

    expect(entry.title).toContain("女书故事");
    expect(entry.summary).toContain("逐句点读");
    expect(entry.primaryActionLabel).toBe("开始阅读体验");
    expect(entry.studyPromise).toContain("不连接后端");
    expect(entry.studyPromise).not.toMatch(/原型|mock|prototype|真实模型/i);
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

    const storySection = app?.querySelector<HTMLElement>("#experience-preview");
    expect(storySection?.hidden).toBe(true);
    expect(app?.textContent).toContain("体验前问题");

    enterStoryExperience(app);

    expect(storySection?.hidden).toBe(false);
    expect(app?.textContent).toContain("研究阶段：默认女书故事体验");
    expect(app?.textContent).toContain("三朝书里的问候");
    expect(app?.textContent).toContain("远方的姐妹");
    expect(app?.textContent).toContain("Distant sister");
    expect(app?.textContent).toContain("承载祝福");
    expect(app?.textContent).toContain("并非未经改动的原始文献");
  });

  it("puts bilingual Nushu reading and sentence listening in the first screen", async () => {
    document.body.innerHTML = '<div id="app"></div>';

    const { renderExperience } = await import("../main");
    const app = document.querySelector<HTMLElement>("#app");
    renderExperience(app as HTMLElement);

    const preview = app?.querySelector<HTMLElement>(".story-preview");

    expect(preview?.textContent).toContain("𛅰𛅱𛅲");
    expect(preview?.textContent).toContain("远方的姐妹");
    expect(preview?.textContent).toContain("Distant sister");
    expect(preview?.textContent).toContain("三朝书常在女性出嫁后");
    expect(preview?.textContent).toContain("逐句点读 / Tap to listen");
    expect(app?.textContent).not.toContain("普通 TTS baseline");
    expect(app?.textContent).not.toMatch(/baseline/i);
    expect(app?.textContent).not.toMatch(/原型|mock|prototype|真实模型/i);
  });

  it("lets users click a sentence to see synchronized reading audio state", async () => {
    document.body.innerHTML = '<div id="app"></div>';

    const { renderExperience } = await import("../main");
    const app = document.querySelector<HTMLElement>("#app");
    renderExperience(app as HTMLElement);
    enterStoryExperience(app);

    const greeting = Array.from(app?.querySelectorAll("button") ?? []).find(
      (button) => button.textContent?.includes("远方的姐妹")
    );

    expect(app?.textContent).toContain("女书声音提示");
    expect(greeting).toBeDefined();

    greeting?.click();
    await waitForPrototypeAudio();

    expect(greeting?.getAttribute("aria-pressed")).toBe("true");
    expect(greeting?.textContent).toContain("正在播放示意声音");
    expect(greeting?.textContent).toContain("Distant sister");
    expect(greeting?.textContent).toContain("后续会替换为正式点读音频");
  });

  it("keeps sentence playback mutually exclusive in the rendered story", async () => {
    document.body.innerHTML = '<div id="app"></div>';

    const { renderExperience } = await import("../main");
    const app = document.querySelector<HTMLElement>("#app");
    renderExperience(app as HTMLElement);
    enterStoryExperience(app);
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
    expect(greeting?.textContent).not.toContain("正在播放示意声音");
    expect(memory?.getAttribute("aria-pressed")).toBe("true");
    expect(memory?.textContent).toContain("正在播放示意声音");
  });

  it("shows a clear user-visible state when sentence audio is missing", async () => {
    document.body.innerHTML = '<div id="app"></div>';

    const { renderExperience } = await import("../main");
    const app = document.querySelector<HTMLElement>("#app");
    renderExperience(app as HTMLElement);
    enterStoryExperience(app);
    const promise = Array.from(app?.querySelectorAll("button") ?? []).find(
      (button) => button.textContent?.includes("等到春水再涨时")
    );

    promise?.click();
    await waitForPrototypeAudio();

    expect(promise?.getAttribute("aria-pressed")).toBe("true");
    expect(promise?.textContent).toContain("这句声音暂未准备好");
    expect(promise?.textContent).toContain("女书声音提示");
  });

  it("renders participation actions with visible save, share, and learn-more outcomes", async () => {
    document.body.innerHTML = '<div id="app"></div>';

    const { renderExperience } = await import("../main");
    const app = document.querySelector<HTMLElement>("#app");
    renderExperience(app as HTMLElement);
    enterStoryExperience(app);

    const save = findButtonByText(app, "保存这段故事");
    const share = findButtonByText(app, "分享给朋友");
    const learnMore = app?.querySelector<HTMLAnchorElement>(
      'a[href="https://courier.unesco.org/en/articles/nushu-tears-sunshine"]'
    );

    expect(app?.textContent).toContain("继续参与");
    expect(save).toBeDefined();
    expect(share).toBeDefined();
    expect(learnMore?.textContent).toContain("了解更多女书资料");

    save?.click();
    expect(save?.textContent).toContain("已保存这段故事");
    expect(app?.textContent).toContain("已保存《三朝书里的问候》");

    learnMore?.dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true })
    );
    expect(app?.textContent).toContain("正在打开女书资料页面");

    share?.click();
    await waitForPrototypeAudio();

    const shareLink = app?.querySelector<HTMLInputElement>(
      'input[name="storyShareLink"]'
    );

    expect(app?.textContent).toContain("分享链接已准备");
    expect(shareLink?.value).toContain("story=sisters-letter");
    expect(shareLink?.value).toContain("#experience-preview");
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

    enterStoryExperience(app);
    completeStoryExperience(app);
    expect(app?.textContent).toContain("研究阶段：体验后反馈");

    const comment = app?.querySelector<HTMLTextAreaElement>(
      'textarea[name="openComment"]'
    );
    const submit = app?.querySelector<HTMLButtonElement>(
      ".feedback-submit"
    );

    selectRating(app, "postFamiliarity", 4);
    selectRating(app, "postInterest", 5);
    selectRating(app, "postParticipationIntent", 5);
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
        familiarity: 4,
        interest: 5,
        participationIntent: 5
      },
      openComment:
        "I understand why Nushu voice matters after the story.",
      stage: "post-experience"
    });
    expect(submittedRecords[0]?.submittedAt).toEqual(expect.any(String));
    expect(app?.textContent).toContain("研究阶段：流程已完成");
    expect(app?.textContent).toContain("流程已完成");
  });
});
