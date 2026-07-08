import "./styles.css";
import {
  mockNushuAudioProvider,
  type AudioProvider
} from "./experience/audioProvider";
import {
  defaultNushuStoryExperience,
  type NushuStoryExperience
} from "./experience/nushuStoryExperience";
import {
  createParticipationActionController
} from "./experience/participationActions";
import {
  createMemoryFeedbackSubmitter,
  type FeedbackRecord,
  type FeedbackSubmitter
} from "./experience/feedbackSubmission";
import { createPlaybackSession } from "./experience/playbackSession";
import {
  createResearchFlowSession,
  type ResearchScaleInput
} from "./experience/researchFlow";

function appendTextElement(
  parent: HTMLElement,
  tagName: keyof HTMLElementTagNameMap,
  className: string,
  text: string
) {
  const element = document.createElement(tagName);
  if (className) {
    element.className = className;
  }
  element.textContent = text;
  parent.append(element);
  return element;
}

export function renderExperience(
  container: HTMLElement,
  experience: NushuStoryExperience = defaultNushuStoryExperience,
  audioProvider: AudioProvider = mockNushuAudioProvider,
  feedbackSubmitter: FeedbackSubmitter = createMemoryFeedbackSubmitter()
) {
  container.replaceChildren();
  const playbackSession = createPlaybackSession(audioProvider);
  const researchFlow = createResearchFlowSession();
  const participationActionController = createParticipationActionController(
    experience.story
  );
  const { actions: participationActions } = participationActionController;

  const main = document.createElement("main");
  main.className = "app-shell";
  main.setAttribute("aria-labelledby", "experience-title");

  const hero = document.createElement("section");
  hero.className = "hero";

  const heroTopbar = document.createElement("div");
  heroTopbar.className = "hero__topbar";
  const brand = document.createElement("a");
  brand.className = "brand-mark";
  brand.href = "#";
  brand.setAttribute("aria-label", "Nushu TTS 首页");
  appendTextElement(brand, "span", "brand-mark__seal", "女书");
  appendTextElement(brand, "span", "brand-mark__name", "Nushu TTS");
  heroTopbar.append(brand);

  const nav = document.createElement("nav");
  nav.className = "hero-nav";
  nav.setAttribute("aria-label", "体验导航");
  [
    ["Home", "#"],
    ["Before Reading", "#pre-experience"]
  ].forEach(([label, href], index) => {
    const navLink = document.createElement("a");
    navLink.href = href;
    navLink.textContent = label;
    if (index === 0) {
      navLink.setAttribute("aria-current", "page");
    }
    nav.append(navLink);
  });
  heroTopbar.append(nav);

  const utility = document.createElement("div");
  utility.className = "hero-utility";
  appendTextElement(utility, "span", "", "简体中文");
  heroTopbar.append(utility);

  const content = document.createElement("div");
  content.className = "hero__content";
  appendTextElement(content, "p", "eyebrow hero__eyebrow", "湖南江永 · 女书声音体验");
  const title = appendTextElement(content, "h1", "", experience.entry.title);
  title.id = "experience-title";
  appendTextElement(content, "p", "hero__subtitle", "听见女书故事");
  appendTextElement(content, "p", "hero__summary", experience.entry.summary);

  const actions = document.createElement("div");
  actions.className = "hero__actions";
  actions.setAttribute("aria-label", "默认研究体验入口");
  const action = document.createElement("a");
  action.className = "primary-action";
  action.href = "#pre-experience";
  action.textContent = experience.entry.primaryActionLabel;
  actions.append(action);
  content.append(actions);
  appendTextElement(content, "p", "study-note", experience.entry.studyPromise);

  const preview = document.createElement("div");
  preview.className = "story-preview";
  preview.setAttribute("aria-label", experience.name);
  const openingSentence = experience.story.sentences[0];
  const storyNushuText = experience.story.sentences
    .map((sentence) => sentence.nushuText)
    .join(" ");

  const visual = document.createElement("div");
  visual.className = "story-preview__visual";
  appendTextElement(visual, "span", "story-preview__annotation", "句读 / 轻声 / 换韵");
  const previewScript = appendTextElement(
    visual,
    "span",
    "story-preview__script",
    storyNushuText || openingSentence?.nushuText || "女书"
  );
  previewScript.lang = "zh-Nshu";
  appendTextElement(
    visual,
    "span",
    "story-preview__listen-label",
    "逐句点读 / Tap to listen"
  );
  appendTextElement(
    visual,
    "span",
    "story-preview__listen-status",
    "点读状态会与当前句子同步"
  );
  preview.append(visual);

  const previewBody = document.createElement("div");
  previewBody.className = "story-preview__body";
  appendTextElement(previewBody, "p", "preview-kicker", experience.audience);
  appendTextElement(previewBody, "h2", "", experience.story.title);
  appendTextElement(
    previewBody,
    "p",
    "story-preview__translation",
    openingSentence?.zhText ?? "阅读一段女书故事。"
  );
  appendTextElement(
    previewBody,
    "p",
    "story-preview__english",
    openingSentence?.enText ?? "Read a Nushu story."
  );
  appendTextElement(
    previewBody,
    "p",
    "story-preview__note",
    openingSentence?.culturalNote ??
      "每句都配有普通读者可读的文化说明。"
  );
  preview.append(previewBody);

  hero.append(heroTopbar, content, preview);
  main.append(hero);

  const journeyStatus = appendTextElement(
    main,
    "p",
    "journey-status",
    "研究阶段：体验前问题"
  );
  journeyStatus.setAttribute("role", "status");
  journeyStatus.setAttribute("aria-live", "polite");

  const preSection = document.createElement("section");
  preSection.className = "pre-panel";
  preSection.id = "pre-experience";
  preSection.setAttribute("aria-labelledby", "pre-title");

  const preHeader = document.createElement("div");
  preHeader.className = "pre-panel__header";
  appendTextElement(preHeader, "p", "eyebrow", "阅读前记录 / Before Reading");
  const preTitle = appendTextElement(
    preHeader,
    "h2",
    "",
    "进入故事前，先记录你的起点"
  );
  preTitle.id = "pre-title";
  appendTextElement(
    preHeader,
    "p",
    "pre-panel__intro",
    "这不是测试，没有对错。从你的直觉出发，标记此刻的你，让接下来的旅程更贴近你。"
  );
  preSection.append(preHeader);

  const preArtifact = document.createElement("div");
  preArtifact.className = "pre-artifact";
  const artifactText = appendTextElement(
    preArtifact,
    "span",
    "pre-artifact__glyphs",
    storyNushuText || "𛅰𛅱𛅲"
  );
  artifactText.lang = "zh-Nshu";
  appendTextElement(preArtifact, "span", "pre-artifact__caption", "女书字样（一局部）");
  preSection.append(preArtifact);

  const preForm = document.createElement("form");
  preForm.className = "research-form";
  preForm.dataset.researchStatus = "empty";
  const preInputs: HTMLInputElement[] = [];

  const preRatingGroups = [
    {
      name: "preFamiliarity",
      key: "familiarity",
      label: "了解程度",
      english: "Familiarity",
      hint: "你现在对女书文字和文化背景有多少了解？",
      lowLabel: "完全不熟悉",
      highLabel: "非常熟悉"
    },
    {
      name: "preInterest",
      key: "interest",
      label: "兴趣",
      english: "Interest",
      hint: "你现在有多想继续了解女书故事和声音体验？",
      lowLabel: "不太感兴趣",
      highLabel: "非常感兴趣"
    },
    {
      name: "preParticipationIntent",
      key: "participationIntent",
      label: "继续探索意愿",
      english: "Participation intent",
      hint: "你现在有多愿意参与后续研究访谈或文化行动？",
      lowLabel: "只是看看",
      highLabel: "很想参与"
    }
  ] as const;

  const postRatingGroups = [
    {
      name: "postFamiliarity",
      key: "familiarity",
      label: "体验后了解程度",
      english: "Familiarity",
      hint: "故事、翻译和文化说明是否帮助你理解女书语境？",
      lowLabel: "帮助有限",
      highLabel: "非常清楚"
    },
    {
      name: "postInterest",
      key: "interest",
      label: "体验后兴趣",
      english: "Interest",
      hint: "这段体验是否提升了你继续了解女书和 TTS 的兴趣？",
      lowLabel: "没有变化",
      highLabel: "更想了解"
    },
    {
      name: "postParticipationIntent",
      key: "participationIntent",
      label: "体验后继续探索意愿",
      english: "Participation intent",
      hint: "体验后你是否更愿意参与后续研究或文化行动？",
      lowLabel: "暂不参与",
      highLabel: "愿意参与"
    }
  ] as const;

  function getSelectedRating(form: HTMLFormElement, name: string) {
    const selected = form.querySelector<HTMLInputElement>(
      `input[name="${name}"]:checked`
    );
    return selected ? Number(selected.value) : null;
  }

  function readScaleInput(
    form: HTMLFormElement,
    groups: typeof preRatingGroups | typeof postRatingGroups
  ): Partial<ResearchScaleInput> {
    return groups.reduce<Partial<ResearchScaleInput>>((input, group) => {
      const rating = getSelectedRating(form, group.name);

      if (rating !== null) {
        input[group.key] = rating;
      }

      return input;
    }, {});
  }

  function hasCompleteScaleInput(
    input: Partial<ResearchScaleInput>
  ): input is ResearchScaleInput {
    return (
      typeof input.familiarity === "number" &&
      typeof input.interest === "number" &&
      typeof input.participationIntent === "number"
    );
  }

  function appendRatingGroups(
    form: HTMLFormElement,
    groups: typeof preRatingGroups | typeof postRatingGroups,
    inputs: HTMLInputElement[]
  ) {
    groups.forEach((group) => {
      const fieldset = document.createElement("fieldset");
      fieldset.className = "rating-group";

      const legend = document.createElement("legend");
      legend.className = "rating-group__legend";
      appendTextElement(legend, "span", "rating-group__label", group.label);
      appendTextElement(legend, "span", "rating-group__english", group.english);
      fieldset.append(legend);
      const hintId = `${group.name}-hint`;
      const hint = appendTextElement(
        fieldset,
        "p",
        "rating-group__hint",
        group.hint
      );
      hint.id = hintId;

      const options = document.createElement("div");
      options.className = "rating-options";
      options.setAttribute("aria-describedby", hintId);

      for (let value = 1; value <= 5; value += 1) {
        const option = document.createElement("label");
        option.className = "rating-option";
        option.dataset.ratingValue = String(value);

        const input = document.createElement("input");
        input.type = "radio";
        input.name = group.name;
        input.value = String(value);
        input.required = true;
        input.setAttribute("aria-label", `${group.label} ${value} 分`);
        inputs.push(input);

        const optionText = appendTextElement(
          option,
          "span",
          "rating-option__value",
          String(value)
        );
        option.append(input, optionText);
        options.append(option);
      }

      fieldset.append(options);
      const endpoints = document.createElement("div");
      endpoints.className = "rating-group__endpoints";
      appendTextElement(endpoints, "span", "", group.lowLabel);
      appendTextElement(endpoints, "span", "", group.highLabel);
      fieldset.append(endpoints);
      form.append(fieldset);
    });
  }

  appendRatingGroups(preForm, preRatingGroups, preInputs);

  const preStatus = appendTextElement(
    preForm,
    "p",
    "research-form__status",
    "完成三项体验前问题后即可进入故事。"
  );
  preStatus.setAttribute("role", "status");
  preStatus.setAttribute("aria-live", "polite");

  const preSubmit = document.createElement("button");
  preSubmit.className = "primary-action";
  preSubmit.type = "submit";
  preSubmit.disabled = true;
  preSubmit.textContent = "进入故事体验";
  preForm.append(preSubmit);
  preSection.append(preForm);
  main.append(preSection);

  const storySection = document.createElement("section");
  storySection.className = "story-reader";
  storySection.id = "experience-preview";
  storySection.setAttribute("aria-labelledby", "story-title");

  const storyHeader = document.createElement("div");
  storyHeader.className = "story-reader__header";
  appendTextElement(storyHeader, "p", "eyebrow", "女书故事阅读 / Nushu Story Reader");
  const storyTitle = appendTextElement(
    storyHeader,
    "h2",
    "",
    experience.story.title
  );
  storyTitle.id = "story-title";
  appendTextElement(
    storyHeader,
    "p",
    "story-reader__subtitle",
    experience.story.subtitle
  );
  appendTextElement(
    storyHeader,
    "p",
    "story-reader__context",
    experience.story.culturalContext
  );
  appendTextElement(
    storyHeader,
    "p",
    "story-reader__audio-note",
    audioProvider.experienceNotice
  );
  storySection.append(storyHeader);

  const sentenceList = document.createElement("ol");
  sentenceList.className = "sentence-list";
  const sentenceButtons: HTMLButtonElement[] = [];

  function refreshSentenceButtons() {
    const snapshot = playbackSession.getSnapshot();

    sentenceButtons.forEach((button) => {
      const sentenceId = button.dataset.sentenceId ?? "";
      const isActive = playbackSession.isSentenceActive(sentenceId);
      const statusElement = button.querySelector<HTMLElement>(
        ".sentence__audio-status"
      );
      const detailElement = button.querySelector<HTMLElement>(
        ".sentence__audio-detail"
      );

      button.classList.toggle("sentence--active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
      button.dataset.playbackStatus = isActive ? snapshot.status : "idle";

      if (statusElement) {
        statusElement.textContent = isActive
          ? snapshot.statusLabel
          : "点读待命";
      }

      if (detailElement) {
        detailElement.textContent = isActive
          ? snapshot.statusDetail
          : "点击这句听女书点读声音。";
      }
    });
  }

  experience.story.sentences.forEach((sentence) => {
    const item = document.createElement("li");
    item.className = "sentence-list__item";

    const button = document.createElement("button");
    button.className = "sentence";
    button.type = "button";
    button.dataset.sentenceId = sentence.id;
    button.dataset.playbackStatus = "idle";
    button.setAttribute("aria-label", `点读：${sentence.zhText}`);
    button.setAttribute("aria-pressed", "false");

    const nushuText = appendTextElement(
      button,
      "span",
      "sentence__nushu",
      sentence.nushuText
    );
    nushuText.lang = "zh-Nshu";
    appendTextElement(button, "span", "sentence__zh", sentence.zhText);
    appendTextElement(button, "span", "sentence__en", sentence.enText);
    appendTextElement(button, "span", "sentence__note", sentence.culturalNote);
    appendTextElement(button, "span", "sentence__audio-status", "点读待命");
    appendTextElement(
      button,
      "span",
      "sentence__audio-detail",
      "点击这句听女书点读声音。"
    );

    button.addEventListener("click", async () => {
      const playback = playbackSession.selectSentence(sentence.id);
      refreshSentenceButtons();
      await playback;
      refreshSentenceButtons();
    });

    sentenceButtons.push(button);
    item.append(button);
    sentenceList.append(item);
  });
  refreshSentenceButtons();
  storySection.append(sentenceList);

  const sourceNote = appendTextElement(
    storySection,
    "p",
    "source-note",
    experience.story.sourceNote
  );
  sourceNote.setAttribute("aria-label", "来源和改写标注");

  const participationSection = document.createElement("section");
  participationSection.className = "participation-actions";
  participationSection.setAttribute("aria-labelledby", "participation-title");

  const participationHeader = document.createElement("div");
  participationHeader.className = "participation-actions__header";
  appendTextElement(
    participationHeader,
    "p",
    "eyebrow",
    "文化参与 / Cultural Engagement"
  );
  const participationTitle = appendTextElement(
    participationHeader,
    "h3",
    "",
    "继续参与"
  );
  participationTitle.id = "participation-title";
  appendTextElement(
    participationHeader,
    "p",
    "participation-actions__intro",
    "保存这段故事、分享给朋友，或继续阅读女书文化资料。"
  );
  participationSection.append(participationHeader);

  const participationGrid = document.createElement("div");
  participationGrid.className = "participation-actions__grid";

  const participationStatus = appendTextElement(
    participationSection,
    "p",
    "participation-actions__status",
    "选择一个参与行动后，这里会显示结果。"
  );
  participationStatus.setAttribute("role", "status");
  participationStatus.setAttribute("aria-live", "polite");

  const saveStory = document.createElement("button");
  saveStory.className = "participation-action";
  saveStory.type = "button";
  let storySaved = participationActionController.isStorySaved();

  function refreshSavedStoryState() {
    saveStory.textContent = storySaved
      ? participationActions.save.savedLabel
      : participationActions.save.label;
    saveStory.setAttribute("aria-pressed", String(storySaved));
  }

  saveStory.addEventListener("click", () => {
    storySaved = true;
    const result = participationActionController.saveStory();
    refreshSavedStoryState();
    participationStatus.textContent = result.status;
  });
  refreshSavedStoryState();
  participationGrid.append(saveStory);

  const shareStory = document.createElement("button");
  shareStory.className = "participation-action";
  shareStory.type = "button";
  shareStory.textContent = participationActions.share.label;

  const shareLink = document.createElement("input");
  shareLink.className = "participation-actions__share-link";
  shareLink.name = "storyShareLink";
  shareLink.type = "text";
  shareLink.readOnly = true;
  shareLink.value = participationActions.share.url;
  shareLink.setAttribute("aria-label", "可复制的故事分享链接");

  shareStory.addEventListener("click", async () => {
    const result = await participationActionController.shareStory();
    participationStatus.textContent = result.status;

    if (result.shouldSelectShareLink) {
      shareLink.focus();
      shareLink.select();
    }
  });
  participationGrid.append(shareStory);

  const learnMore = document.createElement("a");
  learnMore.className = "participation-action participation-action--link";
  learnMore.href = participationActions.learnMore.href;
  learnMore.target = "_blank";
  learnMore.rel = "noopener noreferrer";
  learnMore.textContent = participationActions.learnMore.label;
  learnMore.setAttribute(
    "aria-label",
    `${participationActions.learnMore.label}：${participationActions.learnMore.description}`
  );
  learnMore.addEventListener("click", () => {
    const result = participationActionController.openLearnMore();
    participationStatus.textContent = result.status;
  });
  participationGrid.append(learnMore);

  participationSection.append(participationGrid, shareLink);
  storySection.append(participationSection);

  const storyComplete = document.createElement("button");
  storyComplete.className = "stage-action";
  storyComplete.type = "button";
  storyComplete.textContent = "完成故事体验，进入反馈";
  storySection.append(storyComplete);
  main.append(storySection);

  const feedbackSection = document.createElement("section");
  feedbackSection.className = "feedback-panel";
  feedbackSection.setAttribute("aria-labelledby", "feedback-title");

  const feedbackHeader = document.createElement("div");
  feedbackHeader.className = "feedback-panel__header";
  appendTextElement(
    feedbackHeader,
    "p",
    "eyebrow",
    "阅读后反馈 / After Reading"
  );
  const feedbackTitle = appendTextElement(
    feedbackHeader,
    "h2",
    "",
    "体验后反馈"
  );
  feedbackTitle.id = "feedback-title";
  appendTextElement(
    feedbackHeader,
    "p",
    "feedback-panel__intro",
    "请用 1-5 分记录体验后对女书的了解程度、兴趣和继续探索意愿。开放评论可选，会与评分一起形成研究记录。"
  );
  feedbackSection.append(feedbackHeader);

  const form = document.createElement("form");
  form.className = "feedback-form";
  form.dataset.feedbackStatus = "empty";

  const ratingInputs: HTMLInputElement[] = [];
  appendRatingGroups(form, postRatingGroups, ratingInputs);

  const commentLabel = appendTextElement(
    form,
    "label",
    "open-comment",
    "开放评论（可选）"
  );
  const comment = document.createElement("textarea");
  comment.name = "openComment";
  comment.rows = 4;
  comment.placeholder = "可以写下你对故事、声音体验或参与研究的想法。";
  commentLabel.append(comment);

  const status = appendTextElement(
    form,
    "p",
    "feedback-form__status",
    "完成三项评分后即可提交。"
  );
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");

  const submit = document.createElement("button");
  submit.className = "feedback-submit";
  submit.type = "submit";
  submit.disabled = true;
  submit.textContent = "提交反馈";
  form.append(submit);

  function refreshFlowSections() {
    const snapshot = researchFlow.getSnapshot();
    journeyStatus.textContent = {
      "pre-experience": "研究阶段：体验前问题",
      "story-experience": "研究阶段：默认女书故事体验",
      "post-experience": "研究阶段：体验后反馈",
      complete: "研究阶段：流程已完成"
    }[snapshot.phase];
    preSection.hidden = snapshot.phase !== "pre-experience";
    storySection.hidden = snapshot.phase !== "story-experience";
    feedbackSection.hidden = snapshot.phase !== "post-experience";
    completeSection.hidden = snapshot.phase !== "complete";
  }

  function refreshPreState() {
    const snapshot = researchFlow.updatePreExperience(
      readScaleInput(preForm, preRatingGroups)
    );
    preSubmit.disabled = !snapshot.canAdvance;
    preForm.dataset.researchStatus = snapshot.canAdvance ? "ready" : "empty";
    preStatus.textContent = snapshot.canAdvance
      ? "可以进入默认女书故事体验。"
      : "完成三项体验前问题后即可进入故事。";
  }

  function refreshFeedbackState() {
    const snapshot = researchFlow.updatePostExperience(
      readScaleInput(form, postRatingGroups)
    );
    submit.disabled = !snapshot.canAdvance;

    if (!snapshot.canAdvance) {
      form.dataset.feedbackStatus = "empty";
      status.textContent = "完成三项评分后即可提交。";
      return;
    }

    form.dataset.feedbackStatus = "ready";
    status.textContent = "可以提交反馈。";
  }

  function refreshSubmittedFeedbackState() {
    if (form.dataset.feedbackStatus === "submitting") {
      submit.disabled = true;
      return;
    }

    if (form.dataset.feedbackStatus === "submitted") {
      const snapshot = researchFlow.updatePostExperience(
        readScaleInput(form, postRatingGroups)
      );
      submit.disabled = !snapshot.canAdvance;
      form.dataset.feedbackStatus = snapshot.canAdvance ? "ready" : "empty";
      status.textContent = snapshot.canAdvance
        ? "已修改反馈，可再次提交更新记录。"
        : "完成三项评分后即可提交。";
      return;
    }

    refreshFeedbackState();
  }

  preInputs.forEach((input) => {
    input.addEventListener("change", refreshPreState);
  });
  ratingInputs.forEach((input) => {
    input.addEventListener("change", refreshSubmittedFeedbackState);
  });
  comment.addEventListener("input", refreshSubmittedFeedbackState);

  preForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = readScaleInput(preForm, preRatingGroups);

    if (!hasCompleteScaleInput(input)) {
      refreshPreState();
      return;
    }

    researchFlow.submitPreExperience(input);
    refreshFlowSections();
  });

  storyComplete.addEventListener("click", () => {
    researchFlow.markStoryComplete();
    refreshFlowSections();
    refreshFeedbackState();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const postInput = readScaleInput(form, postRatingGroups);

    if (!hasCompleteScaleInput(postInput)) {
      refreshFeedbackState();
      return;
    }

    submit.disabled = true;
    form.dataset.feedbackStatus = "submitting";
    status.textContent = "正在记录反馈...";

    const record: FeedbackRecord = {
      storyId: experience.story.id,
      ratings: {
        familiarity: postInput.familiarity,
        interest: postInput.interest,
        participationIntent: postInput.participationIntent
      },
      openComment: comment.value.trim(),
      stage: "post-experience",
      submittedAt: new Date().toISOString()
    };

    try {
      const result = await feedbackSubmitter.submitFeedback(record);
      form.dataset.feedbackStatus = "submitted";
      status.textContent = `反馈已记录：${result.recordId}`;
      researchFlow.submitPostExperience({
        ...postInput,
        openComment: comment.value,
        feedbackRecordId: result.recordId
      });
      refreshFlowSections();
    } catch {
      form.dataset.feedbackStatus = "ready";
      submit.disabled = false;
      status.textContent = "反馈暂时无法记录，请稍后重试。";
    }
  });

  feedbackSection.append(form);
  main.append(feedbackSection);

  const completeSection = document.createElement("section");
  completeSection.className = "completion-panel";
  completeSection.setAttribute("aria-labelledby", "completion-title");
  appendTextElement(completeSection, "p", "eyebrow", "Research Record Ready");
  const completionTitle = appendTextElement(
    completeSection,
    "h2",
    "",
    "流程已完成"
  );
  completionTitle.id = "completion-title";
  appendTextElement(
    completeSection,
    "p",
    "completion-panel__summary",
    "体验前记录、故事完成状态和体验后反馈已经形成一条轻量研究记录，适合继续访谈或实验记录。"
  );
  main.append(completeSection);

  refreshFlowSections();
  container.append(main);
}

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Missing #app root element");
}

renderExperience(app);
