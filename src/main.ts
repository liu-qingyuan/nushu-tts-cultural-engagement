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
  preview.id = "experience-preview";
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
  appendTextElement(previewBody, "h2", "", "默认故事入口占位");
  appendTextElement(
    previewBody,
    "p",
    "",
    "这里将在后续切片承载女书文本、转写、翻译和音频体验。当前版本只固定用户可见旅程，不提前绑定内容源或模型服务。"
  );
  preview.append(previewBody);

  hero.append(content, preview);
  main.append(hero);
  container.append(main);
}

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Missing #app root element");
}

renderExperience(app);
