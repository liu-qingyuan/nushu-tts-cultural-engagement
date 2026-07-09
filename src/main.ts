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
  createParticipationActionController,
  isStoryShareEntryForStory
} from "./experience/participationActions";
import {
  createMemoryFeedbackSubmitter,
  type FeedbackRecord,
  type FeedbackSubmitter
} from "./experience/feedbackSubmission";
import { createPlaybackSession } from "./experience/playbackSession";
import {
  createResearchFlowSession,
  type ResearchFlowPhase,
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
  let currentPage: "home" | "flow" = "home";
  type JourneyTarget = "home" | ResearchFlowPhase;

  const main = document.createElement("main");
  main.className = "app-shell";
  main.setAttribute("aria-labelledby", "experience-title");

  const hero = document.createElement("section");
  hero.className = "hero";
  hero.setAttribute("aria-hidden", "false");
  hero.tabIndex = -1;

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
    ["Home", "#"]
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
  appendTextElement(
    content,
    "p",
    "hero__subtitle",
    "听见女书故事 · 纸本档案 + 声音仪式感"
  );
  appendTextElement(content, "p", "hero__summary", experience.entry.summary);

  const actions = document.createElement("div");
  actions.className = "hero__actions";
  actions.setAttribute("aria-label", "默认研究体验入口");
  const action = document.createElement("button");
  action.className = "primary-action";
  action.type = "button";
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

  const journeyNav = document.createElement("nav");
  journeyNav.className = "journey-nav";
  journeyNav.setAttribute("aria-label", "阶段导航");
  journeyNav.hidden = true;
  journeyNav.setAttribute("aria-hidden", "true");
  const journeyNavLinks = new Map<JourneyTarget, HTMLAnchorElement>();
  const journeyTargets: Array<{
    target: JourneyTarget;
    label: string;
    href: string;
  }> = [
    { target: "home", label: "Home", href: "#" },
    {
      target: "pre-experience",
      label: "Before Reading",
      href: "#pre-experience"
    },
    {
      target: "story-experience",
      label: "Story",
      href: "#experience-preview"
    },
    {
      target: "post-experience",
      label: "Feedback",
      href: "#feedback"
    },
    { target: "complete", label: "Complete", href: "#complete" }
  ];
  journeyTargets.forEach(({ target, label, href }) => {
    const link = document.createElement("a");
    link.href = href;
    link.textContent = label;
    link.dataset.journeyTarget = target;
    journeyNavLinks.set(target, link);
    journeyNav.append(link);
  });
  main.append(journeyNav);

  const journeyStatus = appendTextElement(
    main,
    "p",
    "journey-status",
    "研究阶段：体验前问题"
  );
  journeyStatus.setAttribute("role", "status");
  journeyStatus.setAttribute("aria-live", "polite");
  journeyStatus.hidden = true;
  journeyStatus.setAttribute("aria-hidden", "true");

  const preSection = document.createElement("section");
  preSection.className = "pre-panel";
  preSection.id = "pre-experience";
  preSection.setAttribute("aria-labelledby", "pre-title");
  preSection.tabIndex = -1;

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
      label: "理解程度",
      english: "Understanding",
      hint: "故事、翻译和文化说明是否帮助你理解女书语境？",
      lowLabel: "Not at all",
      highLabel: "Very well"
    },
    {
      name: "postInterest",
      key: "interest",
      label: "兴趣程度",
      english: "Interest",
      hint: "这段体验是否提升了你继续了解女书和 TTS 的兴趣？",
      lowLabel: "Not interested",
      highLabel: "Very interested"
    },
    {
      name: "postParticipationIntent",
      key: "participationIntent",
      label: "未来参与意愿",
      english: "Join later",
      hint: "体验后你是否更愿意参与后续研究或文化行动？",
      lowLabel: "Not likely",
      highLabel: "Very likely"
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
    "还需完成 3 项体验前问题后即可进入故事。"
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
  storySection.tabIndex = -1;

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

  const readerDesk = document.createElement("div");
  readerDesk.className = "reader-desk";

  const sentenceRail = document.createElement("aside");
  sentenceRail.className = "reader-desk__rail";
  sentenceRail.setAttribute("aria-label", "故事句子索引");
  appendTextElement(
    sentenceRail,
    "p",
    "reader-desk__rail-title",
    `故事 · 共 ${experience.story.sentences.length} 句`
  );

  const sentenceList = document.createElement("ol");
  sentenceList.className = "sentence-list";
  sentenceRail.append(sentenceList);

  const activeSentence =
    experience.story.sentences[0] ?? {
      id: "empty",
      nushuText: "𛅰𛅱",
      zhText: "暂无故事句子。",
      enText: "No story sentence is available.",
      culturalNote: "故事内容准备后会显示在这里。"
    };
  let selectedSentenceId = activeSentence.id;

  const activeSheet = document.createElement("article");
  activeSheet.className = "reader-desk__sheet";
  activeSheet.setAttribute("aria-label", "当前点读句");

  const activeCount = appendTextElement(
    activeSheet,
    "p",
    "reader-desk__count",
    ""
  );
  const activeNushu = appendTextElement(
    activeSheet,
    "p",
    "reader-desk__nushu",
    ""
  );
  activeNushu.lang = "zh-Nshu";
  appendTextElement(activeSheet, "span", "reader-desk__seal", "女书");
  const activeDivider = document.createElement("div");
  activeDivider.className = "reader-desk__divider";
  activeSheet.append(activeDivider);
  const activeZh = appendTextElement(activeSheet, "p", "reader-desk__zh", "");
  const activeEn = appendTextElement(activeSheet, "p", "reader-desk__en", "");
  const activeNote = document.createElement("div");
  activeNote.className = "reader-desk__note";
  appendTextElement(activeNote, "p", "reader-desk__note-title", "文化小注");
  const activeNoteText = appendTextElement(activeNote, "p", "", "");
  activeSheet.append(activeNote);

  const activeAudio = document.createElement("div");
  activeAudio.className = "reader-desk__audio";
  activeAudio.dataset.playbackStatus = "idle";
  const activeAudioStatus = appendTextElement(
    activeAudio,
    "p",
    "reader-desk__audio-status",
    "点读待命"
  );
  activeAudioStatus.setAttribute("role", "status");
  activeAudioStatus.setAttribute("aria-live", "polite");
  const activeAudioWave = document.createElement("div");
  activeAudioWave.className = "reader-desk__wave";
  activeAudioWave.setAttribute("aria-hidden", "true");
  for (let index = 0; index < 28; index += 1) {
    const bar = document.createElement("span");
    bar.className = `reader-desk__wave-bar reader-desk__wave-bar--${
      index % 7
    }`;
    activeAudioWave.append(bar);
  }
  activeAudio.append(activeAudioWave);
  const activeAudioDetail = appendTextElement(
    activeAudio,
    "p",
    "reader-desk__audio-detail",
    "点击这句听女书点读声音。"
  );
  activeSheet.append(activeAudio);

  const activeAside = document.createElement("aside");
  activeAside.className = "reader-desk__aside";
  activeAside.setAttribute("aria-label", "翻译与声音状态");
  appendTextElement(activeAside, "p", "reader-desk__aside-title", "中文译文");
  const asideZh = appendTextElement(
    activeAside,
    "p",
    "reader-desk__aside-zh",
    ""
  );
  appendTextElement(
    activeAside,
    "p",
    "reader-desk__aside-title",
    "English Translation"
  );
  const asideEn = appendTextElement(
    activeAside,
    "p",
    "reader-desk__aside-en",
    ""
  );
  appendTextElement(activeAside, "p", "reader-desk__aside-title", "音频状态");
  const asideStatus = appendTextElement(
    activeAside,
    "p",
    "reader-desk__aside-status",
    ""
  );
  const asideDetail = appendTextElement(
    activeAside,
    "p",
    "reader-desk__aside-detail",
    ""
  );

  const sentenceButtons: HTMLButtonElement[] = [];

  function refreshSentenceButtons() {
    const snapshot = playbackSession.getSnapshot();
    const selectedSentence =
      experience.story.sentences.find(
        (sentence) => sentence.id === selectedSentenceId
      ) ?? activeSentence;
    const selectedIndex = Math.max(
      0,
      experience.story.sentences.findIndex(
        (sentence) => sentence.id === selectedSentence.id
      )
    );
    const selectedIsActive =
      snapshot.activeSentenceId === selectedSentence.id &&
      snapshot.status !== "idle";
    const selectedStatus = selectedIsActive ? snapshot.status : "idle";
    const selectedStatusLabel = selectedIsActive
      ? snapshot.statusLabel
      : "点读待命";
    const selectedStatusDetail = selectedIsActive
      ? snapshot.statusDetail
      : "点击这句听女书点读声音。";

    activeCount.textContent = `第 ${selectedIndex + 1} 句 / 共 ${
      experience.story.sentences.length
    } 句`;
    activeNushu.textContent = selectedSentence.nushuText;
    activeZh.textContent = selectedSentence.zhText;
    activeEn.textContent = selectedSentence.enText;
    activeNoteText.textContent = selectedSentence.culturalNote;
    activeAudio.dataset.playbackStatus = selectedStatus;
    activeAudioStatus.textContent = selectedStatusLabel;
    activeAudioDetail.textContent = selectedStatusDetail;
    asideZh.textContent = selectedSentence.zhText;
    asideEn.textContent = selectedSentence.enText;
    asideStatus.textContent = selectedStatusLabel;
    asideDetail.textContent = selectedStatusDetail;

    sentenceButtons.forEach((button) => {
      const sentenceId = button.dataset.sentenceId ?? "";
      const isActive = playbackSession.isSentenceActive(sentenceId);
      const isSelected = selectedSentenceId === sentenceId;
      const statusElement = button.querySelector<HTMLElement>(
        ".sentence__audio-status"
      );
      const detailElement = button.querySelector<HTMLElement>(
        ".sentence__audio-detail"
      );

      button.classList.toggle("sentence--active", isActive);
      button.classList.toggle("sentence--selected", isSelected);
      button.setAttribute("aria-pressed", String(isActive));
      button.setAttribute("aria-current", isSelected ? "true" : "false");
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

  experience.story.sentences.forEach((sentence, index) => {
    const item = document.createElement("li");
    item.className = "sentence-list__item";

    const button = document.createElement("button");
    button.className = "sentence";
    button.type = "button";
    button.dataset.sentenceId = sentence.id;
    button.dataset.playbackStatus = "idle";
    button.setAttribute("aria-label", `点读第 ${index + 1} 句：${sentence.zhText}`);
    button.setAttribute("aria-pressed", "false");

    appendTextElement(
      button,
      "span",
      "sentence__index",
      String(index + 1).padStart(2, "0")
    );
    const nushuText = appendTextElement(
      button,
      "span",
      "sentence__nushu",
      sentence.nushuText
    );
    nushuText.lang = "zh-Nshu";
    appendTextElement(button, "span", "sentence__zh", sentence.zhText);
    appendTextElement(
      button,
      "span",
      "sentence__en sentence__rail-extra",
      sentence.enText
    );
    appendTextElement(
      button,
      "span",
      "sentence__note sentence__rail-extra",
      sentence.culturalNote
    );
    appendTextElement(button, "span", "sentence__audio-status", "点读待命");
    appendTextElement(
      button,
      "span",
      "sentence__audio-detail",
      "点击这句听女书点读声音。"
    );

    button.addEventListener("click", async () => {
      selectedSentenceId = sentence.id;
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
  readerDesk.append(sentenceRail, activeSheet, activeAside);
  storySection.append(readerDesk);

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
  feedbackSection.id = "feedback";
  feedbackSection.setAttribute("aria-labelledby", "feedback-title");
  feedbackSection.tabIndex = -1;

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
    "After listening"
  );
  feedbackTitle.id = "feedback-title";
  appendTextElement(feedbackHeader, "p", "feedback-panel__subtitle", "听过之后");
  appendTextElement(
    feedbackHeader,
    "p",
    "feedback-panel__intro",
    "每一次聆听，都会在心里留下痕迹。请用 1-5 分记录体验后的理解、兴趣和继续探索意愿；开放评论可选，会与评分一起形成轻量研究记录。"
  );

  const feedbackLayout = document.createElement("div");
  feedbackLayout.className = "feedback-panel__layout";

  const form = document.createElement("form");
  form.className = "feedback-form";
  form.dataset.feedbackStatus = "empty";

  const feedbackContext = document.createElement("div");
  feedbackContext.className = "feedback-form__context";
  appendTextElement(feedbackContext, "p", "", "Your reflection");
  appendTextElement(feedbackContext, "p", "", "你的感受");
  appendTextElement(
    feedbackContext,
    "p",
    "",
    "Record what shifted after listening."
  );
  appendTextElement(
    feedbackContext,
    "p",
    "",
    "记录听过之后的理解、兴趣和继续探索意愿。"
  );
  form.append(feedbackContext);

  const ratingInputs: HTMLInputElement[] = [];
  appendRatingGroups(form, postRatingGroups, ratingInputs);

  const commentLabel = appendTextElement(
    form,
    "label",
    "open-comment",
    "What changed for you?  什么改变了你？"
  );
  const comment = document.createElement("textarea");
  comment.name = "openComment";
  comment.rows = 4;
  comment.maxLength = 400;
  comment.placeholder = "Share a thought, a feeling, or a new perspective...";
  commentLabel.append(comment);
  const commentCounter = appendTextElement(
    commentLabel,
    "span",
    "open-comment__counter",
    "0 / 400"
  );

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
  submit.textContent = "Submit reflection  提交反思";
  form.append(submit);

  const feedbackSummary = document.createElement("aside");
  feedbackSummary.className = "feedback-summary";
  feedbackSummary.setAttribute("aria-label", "体验后反馈状态摘要");
  appendTextElement(feedbackSummary, "p", "feedback-summary__step", "4 / 5 · Reflection");
  appendTextElement(feedbackSummary, "h3", "", "What shifted after listening");
  appendTextElement(feedbackSummary, "p", "feedback-summary__zh", "听过之后，哪些变化");
  appendTextElement(
    feedbackSummary,
    "p",
    "feedback-summary__copy",
    "The record below compares your before-reading note with your after-listening response. It is a session record, not a formal research conclusion."
  );

  const feedbackCompare = document.createElement("dl");
  feedbackCompare.className = "feedback-compare";
  [
    ["Emotional connection", "情感共鸣"],
    ["Cultural understanding", "文化理解"],
    ["Inspiration to act", "行动启发"]
  ].forEach(([label, zh]) => {
    const item = document.createElement("div");
    item.className = "feedback-compare__item";
    const term = appendTextElement(item, "dt", "", label);
    appendTextElement(term, "span", "", zh);
    const detail = document.createElement("dd");
    appendTextElement(detail, "span", "feedback-compare__before", "Before 听之前");
    appendTextElement(detail, "span", "feedback-compare__arrow", "→");
    appendTextElement(detail, "span", "feedback-compare__after", "After 听之后");
    item.append(detail);
    feedbackCompare.append(item);
  });
  feedbackSummary.append(feedbackCompare);

  feedbackLayout.append(form, feedbackSummary);
  feedbackSection.append(feedbackHeader, feedbackLayout);

  function setFlowSectionHidden(section: HTMLElement, isHidden: boolean) {
    section.hidden = isHidden;
    section.setAttribute("aria-hidden", String(isHidden));
    section.toggleAttribute("inert", isHidden);
  }

  function setHomeHidden(isHidden: boolean) {
    hero.hidden = isHidden;
    hero.setAttribute("aria-hidden", String(isHidden));
    hero.toggleAttribute("inert", isHidden);
    journeyNav.hidden = !isHidden;
    journeyNav.setAttribute("aria-hidden", String(!isHidden));
    journeyStatus.hidden = !isHidden;
    journeyStatus.setAttribute("aria-hidden", String(!isHidden));
  }

  function getJourneySection(target: ResearchFlowPhase) {
    return {
      "pre-experience": preSection,
      "story-experience": storySection,
      "post-experience": feedbackSection,
      complete: completeSection
    }[target];
  }

  function canNavigateTo(target: JourneyTarget) {
    if (target === "home") {
      return true;
    }

    return researchFlow.getSnapshot().phase === target;
  }

  function getBlockedNavigationStatus(target: JourneyTarget) {
    if (target === "pre-experience") {
      return researchFlow.getSnapshot().phase === "pre-experience"
        ? "可以进入阅读前问题。"
        : "已保留现有研究记录，不能回到体验前问题。";
    }

    return "请按当前研究阶段继续，不能绕过必要评分门禁。";
  }

  function refreshJourneyNavigation() {
    const snapshot = researchFlow.getSnapshot();
    const currentTarget: JourneyTarget =
      currentPage === "home" ? "home" : snapshot.phase;

    journeyNavLinks.forEach((link, target) => {
      const isCurrent = target === currentTarget;
      const isAllowed = canNavigateTo(target);

      link.setAttribute("aria-current", isCurrent ? "page" : "false");
      link.setAttribute("aria-disabled", String(!isAllowed));
      link.tabIndex = isAllowed ? 0 : -1;
    });
  }

  function focusStage(section: HTMLElement) {
    section.focus({ preventScroll: true });
    scrollStageIntoView(section);
  }

  function goToCurrentFlowPage() {
    currentPage = "flow";
    setHomeHidden(true);
    refreshFlowSections();
    focusStage(getJourneySection(researchFlow.getSnapshot().phase));
  }

  function goHome() {
    currentPage = "home";
    setHomeHidden(false);
    refreshFlowSections();
    refreshJourneyNavigation();
    focusStage(hero);
  }

  function requestNavigation(target: JourneyTarget) {
    if (!canNavigateTo(target)) {
      journeyStatus.textContent = getBlockedNavigationStatus(target);
      return;
    }

    if (target === "home") {
      goHome();
      return;
    }

    currentPage = "flow";
    setHomeHidden(true);
    refreshFlowSections();
    focusStage(getJourneySection(target));
  }

  function refreshFlowSections() {
    const snapshot = researchFlow.getSnapshot();
    journeyStatus.textContent = {
      "pre-experience": "研究阶段：体验前问题",
      "story-experience": "研究阶段：默认女书故事体验",
      "post-experience": "研究阶段：体验后反馈",
      complete: "研究阶段：流程已完成"
    }[snapshot.phase];
    const flowSections: Array<[HTMLElement, boolean]> = [
      [preSection, snapshot.phase !== "pre-experience"],
      [storySection, snapshot.phase !== "story-experience"],
      [feedbackSection, snapshot.phase !== "post-experience"],
      [completeSection, snapshot.phase !== "complete"]
    ];

    flowSections.forEach(([section, isHidden]) => {
      setFlowSectionHidden(section, currentPage === "home" || isHidden);
    });
    refreshJourneyNavigation();
  }

  function scrollStageIntoView(section: HTMLElement) {
    section.scrollIntoView?.({ block: "start" });
  }

  function refreshPreState() {
    const preInput = readScaleInput(preForm, preRatingGroups);
    const snapshot = researchFlow.updatePreExperience(preInput);
    const completedRatings = preRatingGroups.filter(
      (group) => typeof preInput[group.key] === "number"
    ).length;
    const missingRatings = preRatingGroups.length - completedRatings;

    preSubmit.disabled = !snapshot.canAdvance;
    preSubmit.classList.toggle("primary-action--ready", snapshot.canAdvance);
    preForm.dataset.researchStatus = snapshot.canAdvance ? "ready" : "empty";
    preStatus.textContent = snapshot.canAdvance
      ? "可以进入默认女书故事体验。"
      : `还需完成 ${missingRatings} 项体验前问题后即可进入故事。`;
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

    if (form.dataset.feedbackStatus === "failed") {
      const snapshot = researchFlow.updatePostExperience(
        readScaleInput(form, postRatingGroups)
      );
      submit.disabled = !snapshot.canAdvance;
      status.textContent = snapshot.canAdvance
        ? "反馈已修改，可以再次提交。"
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
  comment.addEventListener("input", () => {
    commentCounter.textContent = `${comment.value.length} / 400`;
  });
  journeyNavLinks.forEach((link, target) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      requestNavigation(target);
    });
  });
  action.addEventListener("click", goToCurrentFlowPage);

  preForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = readScaleInput(preForm, preRatingGroups);

    if (!hasCompleteScaleInput(input)) {
      refreshPreState();
      return;
    }

    researchFlow.submitPreExperience(input);
    refreshFlowSections();
    focusStage(storySection);
  });

  storyComplete.addEventListener("click", () => {
    researchFlow.markStoryComplete();
    refreshFlowSections();
    refreshFeedbackState();
    focusStage(feedbackSection);
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
      focusStage(completeSection);
    } catch {
      form.dataset.feedbackStatus = "failed";
      submit.disabled = false;
      status.textContent = "反馈暂时无法记录，请修改后重试或稍后再提交。";
    }
  });

  main.append(feedbackSection);

  const completeSection = document.createElement("section");
  completeSection.className = "completion-panel";
  completeSection.id = "complete";
  completeSection.setAttribute("aria-labelledby", "completion-title");
  completeSection.tabIndex = -1;
  appendTextElement(completeSection, "p", "eyebrow", "5 of 5 · Exhibition complete");
  const completionTitle = appendTextElement(
    completeSection,
    "h2",
    "",
    "Carry the story forward"
  );
  completionTitle.id = "completion-title";
  appendTextElement(completeSection, "p", "completion-panel__subtitle", "把这个故事带给更多人");
  appendTextElement(
    completeSection,
    "p",
    "completion-panel__summary",
    "你的阅读和反思已保存为本次会话的一条轻量研究记录。它说明一次体验已经完成，但不代表正式研究结论。"
  );

  const participationSection = document.createElement("section");
  participationSection.className = "participation-actions";
  participationSection.setAttribute("aria-labelledby", "participation-title");

  const participationTitle = appendTextElement(
    participationSection,
    "h3",
    "",
    "继续参与"
  );
  participationTitle.id = "participation-title";

  const participationGrid = document.createElement("div");
  participationGrid.className = "participation-actions__grid";

  const participationStatus = appendTextElement(
    participationSection,
    "p",
    "participation-actions__status",
    "Your reading and reflection are saved for this session."
  );
  participationStatus.setAttribute("role", "status");
  participationStatus.setAttribute("aria-live", "polite");

  function appendActionCopy(parent: HTMLElement, title: string, copy: string) {
    const body = document.createElement("span");
    body.className = "participation-action__body";
    appendTextElement(body, "span", "participation-action__title", title);
    appendTextElement(body, "span", "participation-action__copy", copy);
    parent.append(body);
  }

  const saveStory = document.createElement("button");
  saveStory.className = "participation-action participation-action--save";
  saveStory.type = "button";
  appendTextElement(saveStory, "span", "participation-action__icon", "⇩");
  appendActionCopy(
    saveStory,
    "Save reading card",
    "保存你的阅读卡，留存你的思考与感悟。"
  );
  appendTextElement(saveStory, "span", "participation-action__arrow", "→");
  let storySaved = participationActionController.isStorySaved();

  function refreshSavedStoryState() {
    const title = saveStory.querySelector<HTMLElement>(
      ".participation-action__title"
    );
    if (title) {
      title.textContent = storySaved
        ? participationActions.save.savedLabel
        : "Save reading card";
    }
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
  shareStory.className = "participation-action participation-action--share";
  shareStory.type = "button";
  appendTextElement(shareStory, "span", "participation-action__icon", "↗");
  appendActionCopy(
    shareStory,
    "Share this experience",
    "分享女书的故事，让更多人了解这份文化遗产。"
  );
  appendTextElement(shareStory, "span", "participation-action__arrow", "→");

  const shareLink = document.createElement("input");
  shareLink.className = "participation-actions__share-link";
  shareLink.name = "storyShareLink";
  shareLink.type = "text";
  shareLink.readOnly = true;
  shareLink.hidden = true;
  shareLink.value = participationActions.share.url;
  shareLink.setAttribute("aria-label", "可复制的故事分享链接");

  shareStory.addEventListener("click", async () => {
    const result = await participationActionController.shareStory();
    participationStatus.textContent = result.status;

    if (result.shouldSelectShareLink) {
      shareLink.hidden = false;
      shareLink.focus();
      shareLink.select();
    }
  });
  participationGrid.append(shareStory);

  const learnMore = document.createElement("a");
  learnMore.className = "participation-action participation-action--learn";
  learnMore.href = participationActions.learnMore.href;
  learnMore.target = "_blank";
  learnMore.rel = "noopener noreferrer";
  appendTextElement(learnMore, "span", "participation-action__icon", "□");
  appendActionCopy(
    learnMore,
    "Learn more about Nushu",
    "探索更多文章、研究与资源，深入了解女书文化。"
  );
  appendTextElement(learnMore, "span", "participation-action__arrow", "→");
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
  completeSection.append(participationSection);
  const privacyNote = document.createElement("p");
  privacyNote.className = "completion-panel__privacy";
  privacyNote.textContent =
    "We respect your privacy. No personal data is collected. 本项目致力于文化保护与学术研究。";
  completeSection.append(privacyNote);
  main.append(completeSection);

  if (
    isStoryShareEntryForStory(
      experience.story.id,
      globalThis.location?.href ?? ""
    )
  ) {
    researchFlow.enterSharedStory();
    currentPage = "flow";
    setHomeHidden(true);
  }

  refreshFlowSections();
  container.append(main);

  if (
    isStoryShareEntryForStory(
      experience.story.id,
      globalThis.location?.href ?? ""
    )
  ) {
    focusStage(storySection);
  }
}

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Missing #app root element");
}

renderExperience(app);
