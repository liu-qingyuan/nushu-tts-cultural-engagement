import "./styles.css";
import {
  defaultNushuStoryExperience,
  type NushuStoryExperience
} from "./experience/nushuStoryExperience";

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
  experience: NushuStoryExperience = defaultNushuStoryExperience
) {
  container.replaceChildren();

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
  action.href = "#experience-preview";
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
  storySection.append(storyHeader);

  const sentenceList = document.createElement("ol");
  sentenceList.className = "sentence-list";
  experience.story.sentences.forEach((sentence) => {
    const item = document.createElement("li");
    item.className = "sentence";

    const nushuText = appendTextElement(
      item,
      "p",
      "sentence__nushu",
      sentence.nushuText
    );
    nushuText.lang = "zh-Nshu";
    appendTextElement(item, "p", "sentence__zh", sentence.zhText);
    appendTextElement(item, "p", "sentence__en", sentence.enText);
    appendTextElement(item, "p", "sentence__note", sentence.culturalNote);
    sentenceList.append(item);
  });
  storySection.append(sentenceList);

  const sourceNote = appendTextElement(
    storySection,
    "p",
    "source-note",
    experience.story.sourceNote
  );
  sourceNote.setAttribute("aria-label", "来源和改写标注");
  main.append(storySection);
  container.append(main);
}

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Missing #app root element");
}

renderExperience(app);
