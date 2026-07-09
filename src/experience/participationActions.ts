import type { NushuStory } from "./storyContent";

export const savedStoriesStorageKey = "nushu.savedStories";

export interface ParticipationActions {
  save: {
    label: string;
    savedLabel: string;
    status: string;
  };
  share: {
    label: string;
    copiedStatus: string;
    fallbackStatus: string;
    title: string;
    text: string;
    url: string;
  };
  learnMore: {
    label: string;
    description: string;
    href: string;
  };
}

export interface ParticipationActionEnvironment {
  currentHref: string;
  navigator?: Navigator;
  storage?: Storage;
}

export interface ParticipationActionController {
  actions: ParticipationActions;
  isStorySaved(): boolean;
  saveStory(): ParticipationActionResult;
  shareStory(): Promise<ParticipationActionResult>;
  openLearnMore(): ParticipationActionResult;
}

export interface ParticipationActionResult {
  status: string;
  shouldSelectShareLink?: boolean;
}

export const sharedStoryPageValue = "story-experience";

export function createStoryShareUrl(storyId: string, currentHref: string) {
  try {
    const url = new URL(currentHref);
    url.searchParams.set("story", storyId);
    url.searchParams.set("page", sharedStoryPageValue);
    url.hash = "";
    return url.toString();
  } catch {
    return `?story=${encodeURIComponent(storyId)}&page=${sharedStoryPageValue}`;
  }
}

export function isStoryShareEntryForStory(storyId: string, currentHref: string) {
  try {
    const url = new URL(currentHref, "https://nushu.local");
    return (
      url.searchParams.get("story") === storyId &&
      url.searchParams.get("page") === sharedStoryPageValue
    );
  } catch {
    return false;
  }
}

export function getParticipationActions(
  story: Pick<NushuStory, "id" | "title">,
  currentHref = globalThis.location?.href ?? ""
): ParticipationActions {
  const shareUrl = createStoryShareUrl(story.id, currentHref);

  return {
    save: {
      label: "保存这段故事",
      savedLabel: "已保存这段故事",
      status: `已保存《${story.title}》，可稍后回到本机继续阅读。`
    },
    share: {
      label: "分享给朋友",
      copiedStatus: "分享链接已复制，可发给朋友继续阅读。",
      fallbackStatus: `分享链接已准备，可复制给朋友：${shareUrl}`,
      title: story.title,
      text: `我正在体验女书故事《${story.title}》，也邀请你一起了解女书文化。`,
      url: shareUrl
    },
    learnMore: {
      label: "了解更多女书资料",
      description: "从女书的历史、传承与当代保护继续了解。",
      href: "https://courier.unesco.org/en/articles/nushu-tears-sunshine"
    }
  };
}

function readSavedStoryIds(storage: Storage | undefined) {
  try {
    const serialized = storage?.getItem(savedStoriesStorageKey);
    const parsed: unknown = serialized ? JSON.parse(serialized) : [];

    return Array.isArray(parsed)
      ? parsed.filter((storyId): storyId is string => typeof storyId === "string")
      : [];
  } catch {
    return [];
  }
}

function persistSavedStoryId(
  storyId: string,
  storage: Storage | undefined
) {
  try {
    const savedStoryIds = new Set(readSavedStoryIds(storage));
    savedStoryIds.add(storyId);
    storage?.setItem(
      savedStoriesStorageKey,
      JSON.stringify(Array.from(savedStoryIds))
    );
  } catch {
    // Browser persistence is optional; the controller still returns visible state.
  }
}

function getBrowserParticipationEnvironment(): ParticipationActionEnvironment {
  return {
    currentHref: globalThis.location?.href ?? "",
    navigator: globalThis.navigator,
    storage: globalThis.localStorage
  };
}

export function createParticipationActionController(
  story: Pick<NushuStory, "id" | "title">,
  environment: ParticipationActionEnvironment = getBrowserParticipationEnvironment()
): ParticipationActionController {
  const actions = getParticipationActions(story, environment.currentHref);

  return {
    actions,
    isStorySaved() {
      return readSavedStoryIds(environment.storage).includes(story.id);
    },
    saveStory() {
      persistSavedStoryId(story.id, environment.storage);

      return {
        status: actions.save.status
      };
    },
    async shareStory() {
      try {
        if (typeof environment.navigator?.share === "function") {
          await environment.navigator.share({
            title: actions.share.title,
            text: actions.share.text,
            url: actions.share.url
          });

          return {
            status: "已打开系统分享面板。"
          };
        }

        if (
          typeof environment.navigator?.clipboard?.writeText === "function"
        ) {
          await environment.navigator.clipboard.writeText(actions.share.url);

          return {
            status: actions.share.copiedStatus
          };
        }
      } catch {
        // Fall back to the visible link below.
      }

      return {
        status: actions.share.fallbackStatus,
        shouldSelectShareLink: true
      };
    },
    openLearnMore() {
      return {
        status: "正在打开女书资料页面。"
      };
    }
  };
}
