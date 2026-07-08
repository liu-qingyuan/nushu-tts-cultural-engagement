import "./styles.css";
import {
  mockNushuAudioProvider,
  prototypeAudioDetail,
  type AudioProvider
} from "./experience/audioProvider";
import {
  defaultNushuStoryExperience,
  type NushuStoryExperience
} from "./experience/nushuStoryExperience";
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

  const main = document.createElement("main");
  main.className = "app-shell";
  main.setAttribute("aria-labelledby", "experience-title");

  const hero = document.createElement("section");
  hero.className = "hero";

  const content = document.createElement("div");
  content.className = "hero__content";
  appendTextElement(content, "p", "eyebrow", experience.entry.eyebrow);
  const title = appendTextElement(content, "h1", "", experience.entry.title);
  title.id = "experience-title";
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

  const visual = document.createElement("div");
  visual.className = "story-preview__visual";
  visual.setAttribute("aria-hidden", "true");
  ["女", "书", "听"].forEach((glyph) => {
    appendTextElement(visual, "span", "", glyph);
  });
  preview.append(visual);

  const previewBody = document.createElement("div");
  appendTextElement(previewBody, "p", "preview-kicker", experience.audience);
  appendTextElement(previewBody, "h2", "", experience.story.title);
  appendTextElement(
    previewBody,
    "p",
    "",
    "打开页面即可阅读默认女书故事。本切片聚焦结构化故事、翻译、文化说明和来源标注。"
  );
  preview.append(previewBody);

  hero.append(content, preview);
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
  appendTextElement(preHeader, "p", "eyebrow", "Pre-Experience Check");
  const preTitle = appendTextElement(preHeader, "h2", "", "体验前问题");
  preTitle.id = "pre-title";
  appendTextElement(
    preHeader,
    "p",
    "pre-panel__intro",
    "进入故事前，请用 1-5 分记录你当前对女书的了解程度、兴趣和继续探索意愿。"
  );
  preSection.append(preHeader);

  const preForm = document.createElement("form");
  preForm.className = "research-form";
  preForm.dataset.researchStatus = "empty";
  const preInputs: HTMLInputElement[] = [];

  const preRatingGroups = [
    {
      name: "preFamiliarity",
      key: "familiarity",
      label: "了解程度",
      hint: "你现在对女书文字和文化背景有多少了解？"
    },
    {
      name: "preInterest",
      key: "interest",
      label: "兴趣",
      hint: "你现在有多想继续了解女书故事和声音体验？"
    },
    {
      name: "preParticipationIntent",
      key: "participationIntent",
      label: "继续探索意愿",
      hint: "你现在有多愿意参与后续研究访谈或文化行动？"
    }
  ] as const;

  const postRatingGroups = [
    {
      name: "postFamiliarity",
      key: "familiarity",
      label: "体验后了解程度",
      hint: "故事、翻译和文化说明是否帮助你理解女书语境？"
    },
    {
      name: "postInterest",
      key: "interest",
      label: "体验后兴趣",
      hint: "这段体验是否提升了你继续了解女书和 TTS 的兴趣？"
    },
    {
      name: "postParticipationIntent",
      key: "participationIntent",
      label: "体验后继续探索意愿",
      hint: "体验后你是否更愿意参与后续研究或文化行动？"
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

      appendTextElement(fieldset, "legend", "", group.label);
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

        const input = document.createElement("input");
        input.type = "radio";
        input.name = group.name;
        input.value = String(value);
        input.required = true;
        input.setAttribute("aria-label", `${group.label} ${value} 分`);
        inputs.push(input);

        const optionText = appendTextElement(option, "span", "", String(value));
        option.append(input, optionText);
        options.append(option);
      }

      fieldset.append(options);
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
  appendTextElement(storyHeader, "p", "eyebrow", "Default Nushu Story");
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
    prototypeAudioDetail
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
          : "点击这句体验 mock 原型音频状态。";
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
      "点击这句体验 mock 原型音频状态。"
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
  appendTextElement(feedbackHeader, "p", "eyebrow", "Post-Experience Feedback");
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
