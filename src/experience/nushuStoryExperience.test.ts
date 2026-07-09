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

function startReadingExperience(app: HTMLElement | null) {
  if (app?.querySelector<HTMLElement>(".hero")?.hidden === false) {
    findButtonByText(app, "开始阅读体验")?.click();
  }
}

function enterStoryExperience(app: HTMLElement | null) {
  startReadingExperience(app);
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

function getJourneySections(app: HTMLElement | null) {
  return {
    home: app?.querySelector<HTMLElement>(".hero"),
    preSection: app?.querySelector<HTMLElement>("#pre-experience"),
    storySection: app?.querySelector<HTMLElement>("#experience-preview"),
    feedbackSection: app?.querySelector<HTMLElement>(".feedback-panel"),
    completionSection: app?.querySelector<HTMLElement>(".completion-panel")
  };
}

describe("default Nushu story experience", () => {
  beforeEach(() => {
    globalThis.localStorage?.clear();
    window.history.replaceState(null, "", "/");
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

  it("opens on a standalone home entry page before exposing the research flow", async () => {
    document.body.innerHTML = '<div id="app"></div>';

    const { renderExperience } = await import("../main");
    const app = document.querySelector<HTMLElement>("#app");
    renderExperience(app as HTMLElement);

    const {
      home,
      preSection,
      storySection,
      feedbackSection,
      completionSection
    } = getJourneySections(app);
    const journeyStatus = app?.querySelector<HTMLElement>(".journey-status");

    expect(home?.hidden).toBe(false);
    expect(home?.getAttribute("aria-hidden")).toBe("false");
    expect(preSection?.hidden).toBe(true);
    expect(storySection?.hidden).toBe(true);
    expect(feedbackSection?.hidden).toBe(true);
    expect(completionSection?.hidden).toBe(true);
    expect(preSection?.getAttribute("aria-hidden")).toBe("true");
    expect(storySection?.getAttribute("aria-hidden")).toBe("true");
    expect(feedbackSection?.getAttribute("aria-hidden")).toBe("true");
    expect(completionSection?.getAttribute("aria-hidden")).toBe("true");
    expect(journeyStatus?.hidden).toBe(true);
    expect(app?.textContent).toContain("湖南江永 · 女书声音体验");
    expect(app?.textContent).toContain("纸本档案");

    startReadingExperience(app);

    expect(home?.hidden).toBe(true);
    expect(home?.getAttribute("aria-hidden")).toBe("true");
    expect(preSection?.hidden).toBe(false);
    expect(preSection?.getAttribute("aria-hidden")).toBe("false");
    expect(journeyStatus?.hidden).toBe(false);
    expect(app?.textContent).toContain("进入故事前，先记录你的起点");
  });

  it("keeps the before-reading note locked until all three starting scores are recorded", async () => {
    document.body.innerHTML = '<div id="app"></div>';

    const { renderExperience } = await import("../main");
    const app = document.querySelector<HTMLElement>("#app");
    renderExperience(app as HTMLElement);

    const startStory = Array.from(app?.querySelectorAll("button") ?? []).find(
      (button) => button.textContent === "进入故事体验"
    );
    const storySection = app?.querySelector<HTMLElement>("#experience-preview");

    startReadingExperience(app);

    expect(startStory?.disabled).toBe(true);
    expect(app?.textContent).toContain("还需完成 3 项体验前问题后即可进入故事");
    expect(app?.textContent).toContain("这不是测试，没有对错");
    expect(app?.textContent).toContain("女书字样（一局部）");

    selectRating(app, "preFamiliarity", 2);
    selectRating(app, "preInterest", 4);

    expect(startStory?.disabled).toBe(true);
    expect(app?.textContent).toContain("还需完成 1 项体验前问题后即可进入故事");

    selectRating(app, "preParticipationIntent", 3);

    expect(startStory?.disabled).toBe(false);
    expect(app?.textContent).toContain("可以进入默认女书故事体验");

    startStory?.click();

    expect(storySection?.hidden).toBe(false);
    expect(app?.textContent).toContain("研究阶段：默认女书故事体验");
  });

  it("shows only the story page after the before-reading record is submitted", async () => {
    document.body.innerHTML = '<div id="app"></div>';

    const { renderExperience } = await import("../main");
    const app = document.querySelector<HTMLElement>("#app");
    renderExperience(app as HTMLElement);

    const {
      home,
      preSection,
      storySection,
      feedbackSection,
      completionSection
    } = getJourneySections(app);
    const journeyStatus = app?.querySelector<HTMLElement>(".journey-status");

    enterStoryExperience(app);

    expect(home?.hidden).toBe(true);
    expect(home?.getAttribute("aria-hidden")).toBe("true");
    expect(preSection?.hidden).toBe(true);
    expect(preSection?.getAttribute("aria-hidden")).toBe("true");
    expect(storySection?.hidden).toBe(false);
    expect(storySection?.getAttribute("aria-hidden")).toBe("false");
    expect(feedbackSection?.hidden).toBe(true);
    expect(feedbackSection?.getAttribute("aria-hidden")).toBe("true");
    expect(completionSection?.hidden).toBe(true);
    expect(completionSection?.getAttribute("aria-hidden")).toBe("true");
    expect(journeyStatus?.hidden).toBe(false);
    expect(journeyStatus?.textContent).toBe("研究阶段：默认女书故事体验");
  });

  it("keeps inactive journey stages hidden from assistive technology", async () => {
    document.body.innerHTML = '<div id="app"></div>';

    const { renderExperience } = await import("../main");
    const app = document.querySelector<HTMLElement>("#app");
    renderExperience(app as HTMLElement);

    const preSection = app?.querySelector<HTMLElement>("#pre-experience");
    const storySection = app?.querySelector<HTMLElement>("#experience-preview");
    const feedbackSection = app?.querySelector<HTMLElement>(".feedback-panel");
    const completionSection = app?.querySelector<HTMLElement>(".completion-panel");

    expect(preSection?.getAttribute("aria-hidden")).toBe("true");
    expect(storySection?.getAttribute("aria-hidden")).toBe("true");
    expect(feedbackSection?.getAttribute("aria-hidden")).toBe("true");
    expect(completionSection?.getAttribute("aria-hidden")).toBe("true");

    startReadingExperience(app);

    expect(preSection?.getAttribute("aria-hidden")).toBe("false");
    expect(storySection?.getAttribute("aria-hidden")).toBe("true");
    expect(feedbackSection?.getAttribute("aria-hidden")).toBe("true");
    expect(completionSection?.getAttribute("aria-hidden")).toBe("true");

    enterStoryExperience(app);

    expect(preSection?.getAttribute("aria-hidden")).toBe("true");
    expect(storySection?.getAttribute("aria-hidden")).toBe("false");
    expect(feedbackSection?.getAttribute("aria-hidden")).toBe("true");
    expect(completionSection?.getAttribute("aria-hidden")).toBe("true");
  });

  it("shows the feedback page as the only current stage after the story is complete", async () => {
    document.body.innerHTML = '<div id="app"></div>';

    const { renderExperience } = await import("../main");
    const app = document.querySelector<HTMLElement>("#app");
    renderExperience(app as HTMLElement);
    enterStoryExperience(app);
    completeStoryExperience(app);

    const storySection = app?.querySelector<HTMLElement>("#experience-preview");
    const feedbackSection = app?.querySelector<HTMLElement>(".feedback-panel");
    const completionSection = app?.querySelector<HTMLElement>(".completion-panel");

    expect(storySection?.hidden).toBe(true);
    expect(storySection?.getAttribute("aria-hidden")).toBe("true");
    expect(feedbackSection?.hidden).toBe(false);
    expect(feedbackSection?.getAttribute("aria-hidden")).toBe("false");
    expect(completionSection?.hidden).toBe(true);
    expect(completionSection?.getAttribute("aria-hidden")).toBe("true");
    expect(findButtonByText(app, "Return to story")).toBeUndefined();
    expect(app?.textContent).toContain("研究阶段：体验后反馈");
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

    expect(app?.textContent).toContain("不能作为正式研究中的模型效果证据");
    expect(greeting).toBeDefined();

    greeting?.click();
    await waitForPrototypeAudio();

    expect(greeting?.getAttribute("aria-pressed")).toBe("true");
    expect(greeting?.textContent).toContain("正在播放示意声音");
    expect(greeting?.textContent).toContain("Distant sister");
    expect(greeting?.textContent).toContain("后续会替换为正式点读音频");
  });

  it("updates the active reading desk text when users choose another sentence", async () => {
    document.body.innerHTML = '<div id="app"></div>';

    const { renderExperience } = await import("../main");
    const app = document.querySelector<HTMLElement>("#app");
    renderExperience(app as HTMLElement);
    enterStoryExperience(app);

    const activeDesk = app?.querySelector<HTMLElement>(
      '[aria-label="当前点读句"]'
    );
    const memory = Array.from(app?.querySelectorAll("button") ?? []).find(
      (button) => button.textContent?.includes("我们把旧日的歌写下")
    );

    expect(activeDesk?.textContent).toContain("远方的姐妹");
    expect(activeDesk?.textContent).toContain("Distant sister");
    expect(activeDesk?.textContent).toContain("承载祝福");

    memory?.click();
    await waitForPrototypeAudio();

    expect(activeDesk?.textContent).toContain("我们把旧日的歌写下");
    expect(activeDesk?.textContent).toContain("We write down old songs");
    expect(activeDesk?.textContent).toContain("文化实践");
    expect(activeDesk?.textContent).toContain("正在播放示意声音");
    expect(activeDesk?.textContent).not.toContain("远方的姐妹");
    expect(memory?.getAttribute("aria-current")).toBe("true");
    expect(memory?.getAttribute("aria-pressed")).toBe("true");
    expect(memory?.textContent).toContain("02");
    expect(
      activeDesk?.querySelector<HTMLElement>(
        '.reader-desk__audio[data-playback-status="playing"]'
      )?.textContent
    ).toContain("正在播放示意声音");
    expect(activeDesk?.querySelectorAll(".reader-desk__wave span")).toHaveLength(
      28
    );
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
    completeStoryExperience(app);

    expect(app?.textContent).toContain("研究阶段：体验后反馈");
    expect(app?.querySelector<HTMLElement>(".completion-panel")?.hidden).toBe(
      true
    );

    selectRating(app, "postFamiliarity", 4);
    selectRating(app, "postInterest", 5);
    selectRating(app, "postParticipationIntent", 3);
    findButtonByText(app, "Submit reflection")?.click();
    await waitForFeedbackSubmission();

    const save = findButtonByText(app, "Save reading card");
    const share = findButtonByText(app, "Share this experience");
    const learnMore = app?.querySelector<HTMLAnchorElement>(
      'a[href="https://courier.unesco.org/en/articles/nushu-tears-sunshine"]'
    );
    const home = app?.querySelector<HTMLElement>(".hero");
    const preSection = app?.querySelector<HTMLElement>("#pre-experience");
    const storySection = app?.querySelector<HTMLElement>("#experience-preview");
    const feedbackSection = app?.querySelector<HTMLElement>(".feedback-panel");
    const completionSection = app?.querySelector<HTMLElement>(".completion-panel");

    expect(app?.textContent).toContain("研究阶段：流程已完成");
    expect(app?.textContent).toContain("Carry the story forward");
    expect(home?.hidden).toBe(true);
    expect(preSection?.hidden).toBe(true);
    expect(storySection?.hidden).toBe(true);
    expect(feedbackSection?.hidden).toBe(true);
    expect(completionSection?.hidden).toBe(false);
    expect(completionSection?.getAttribute("aria-hidden")).toBe("false");
    expect(app?.textContent).toContain("你的阅读和反思已保存为本次会话的一条轻量研究记录");
    expect(save).toBeDefined();
    expect(share).toBeDefined();
    expect(learnMore?.textContent).toContain("Learn more about Nushu");

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
    expect(shareLink?.value).toContain("page=story-experience");
    expect(shareLink?.value).not.toContain("#experience-preview");
  });

  it("opens shared story links directly in the story stage without showing the home page above it", async () => {
    window.history.replaceState(
      null,
      "",
      "/nushu?story=sisters-letter&page=story-experience"
    );
    document.body.innerHTML = '<div id="app"></div>';

    const { renderExperience } = await import("../main");
    const app = document.querySelector<HTMLElement>("#app");
    renderExperience(app as HTMLElement);

    const home = app?.querySelector<HTMLElement>(".hero");
    const preSection = app?.querySelector<HTMLElement>("#pre-experience");
    const storySection = app?.querySelector<HTMLElement>("#experience-preview");
    const feedbackSection = app?.querySelector<HTMLElement>(".feedback-panel");
    const completionSection = app?.querySelector<HTMLElement>(".completion-panel");

    expect(home?.hidden).toBe(true);
    expect(home?.getAttribute("aria-hidden")).toBe("true");
    expect(preSection?.hidden).toBe(true);
    expect(storySection?.hidden).toBe(false);
    expect(storySection?.getAttribute("aria-hidden")).toBe("false");
    expect(feedbackSection?.hidden).toBe(true);
    expect(completionSection?.hidden).toBe(true);
    expect(app?.textContent).toContain("研究阶段：默认女书故事体验");
    expect(app?.textContent).toContain("三朝书里的问候");
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

    expect(submit?.disabled).toBe(true);
    selectRating(app, "postFamiliarity", 4);
    selectRating(app, "postInterest", 5);
    selectRating(app, "postParticipationIntent", 5);
    if (comment) {
      comment.value = "I understand why Nushu voice matters after the story.";
      comment.dispatchEvent(new Event("input", { bubbles: true }));
    }
    expect(submit?.disabled).toBe(false);
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
    expect(app?.textContent).toContain("Carry the story forward");
    expect(app?.textContent).toContain("不代表正式研究结论");
  });

  it("keeps feedback editable after a failed submit and then completes on retry", async () => {
    document.body.innerHTML = '<div id="app"></div>';
    let attempts = 0;
    const feedbackSubmitter: FeedbackSubmitter = {
      async submitFeedback(record) {
        attempts += 1;

        if (attempts === 1) {
          throw new Error("temporary failure");
        }

        return {
          recordId: `retry-feedback-${attempts}`,
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
    selectRating(app, "postFamiliarity", 4);
    selectRating(app, "postInterest", 4);
    selectRating(app, "postParticipationIntent", 4);
    const comment = app?.querySelector<HTMLTextAreaElement>(
      'textarea[name="openComment"]'
    );
    const submit = app?.querySelector<HTMLButtonElement>(".feedback-submit");

    submit?.click();
    await waitForFeedbackSubmission();

    expect(app?.textContent).toContain("反馈暂时无法记录");
    expect(app?.textContent).toContain("请修改后重试");

    if (comment) {
      comment.value = "Retry after clarifying my reflection.";
      comment.dispatchEvent(new Event("input", { bubbles: true }));
    }

    expect(app?.textContent).toContain("反馈已修改，可以再次提交");

    submit?.click();
    await waitForFeedbackSubmission();

    expect(attempts).toBe(2);
    expect(app?.textContent).toContain("研究阶段：流程已完成");
    expect(app?.textContent).toContain("Carry the story forward");
  });
});
