import { describe, expect, it } from "vitest";
import {
  createParticipationActionController,
  createStoryShareUrl,
  isStoryShareEntryForStory,
  savedStoriesStorageKey
} from "./participationActions";

function createMemoryStorage(): Storage {
  const records = new Map<string, string>();

  return {
    get length() {
      return records.size;
    },
    clear() {
      records.clear();
    },
    getItem(key) {
      return records.get(key) ?? null;
    },
    key(index) {
      return Array.from(records.keys())[index] ?? null;
    },
    removeItem(key) {
      records.delete(key);
    },
    setItem(key, value) {
      records.set(key, value);
    }
  };
}

describe("participation actions", () => {
  it("creates page-aware story share links without anchoring into hidden page sections", () => {
    expect(
      createStoryShareUrl(
        "sisters-letter",
        "https://example.test/nushu?utm=friend#experience-preview"
      )
    ).toBe(
      "https://example.test/nushu?utm=friend&story=sisters-letter&page=story-experience"
    );

    expect(createStoryShareUrl("sisters letter", "not a url")).toBe(
      "?story=sisters%20letter&page=story-experience"
    );

    expect(
      isStoryShareEntryForStory(
        "sisters-letter",
        "https://example.test/nushu?story=sisters-letter&page=story-experience"
      )
    ).toBe(true);
    expect(
      isStoryShareEntryForStory(
        "sisters-letter",
        "https://example.test/nushu?story=other&page=story-experience"
      )
    ).toBe(false);
  });

  it("maps the current story to save, share, and learn-more trigger results", async () => {
    const storage = createMemoryStorage();
    const controller = createParticipationActionController(
      {
        id: "sisters-letter",
        title: "三朝书里的问候"
      },
      {
        currentHref: "https://example.test/nushu",
        navigator: {} as Navigator,
        storage
      }
    );

    expect(controller.isStorySaved()).toBe(false);
    expect(controller.actions.save.label).toBe("保存这段故事");
    expect(controller.actions.learnMore.label).toBe("了解更多女书资料");

    const saveResult = controller.saveStory();

    expect(saveResult.status).toContain("已保存《三朝书里的问候》");
    expect(controller.isStorySaved()).toBe(true);
    expect(storage.getItem(savedStoriesStorageKey)).toContain(
      "sisters-letter"
    );

    const learnMoreResult = controller.openLearnMore();
    expect(learnMoreResult.status).toContain("正在打开女书资料页面");

    const shareResult = await controller.shareStory();

    expect(shareResult).toEqual({
      status:
        "分享链接已准备，可复制给朋友：https://example.test/nushu?story=sisters-letter&page=story-experience",
      shouldSelectShareLink: true
    });
  });

  it("reports visible outcomes for clipboard and system share paths", async () => {
    const clipboardWrites: string[] = [];
    const sharedPayloads: ShareData[] = [];
    const story = {
      id: "sisters-letter",
      title: "三朝书里的问候"
    };

    const clipboardController = createParticipationActionController(story, {
      currentHref: "https://example.test/nushu",
      navigator: {
        clipboard: {
          writeText: async (value: string) => {
            clipboardWrites.push(value);
          }
        }
      } as Navigator,
      storage: createMemoryStorage()
    });

    await expect(clipboardController.shareStory()).resolves.toEqual({
      status: "分享链接已复制，可发给朋友继续阅读。"
    });
    expect(clipboardWrites).toEqual([
      "https://example.test/nushu?story=sisters-letter&page=story-experience"
    ]);

    const systemShareController = createParticipationActionController(story, {
      currentHref: "https://example.test/nushu",
      navigator: {
        share: async (payload: ShareData) => {
          sharedPayloads.push(payload);
        }
      } as Navigator,
      storage: createMemoryStorage()
    });

    await expect(systemShareController.shareStory()).resolves.toEqual({
      status: "已打开系统分享面板。"
    });
    expect(sharedPayloads[0]).toMatchObject({
      title: "三朝书里的问候",
      url: "https://example.test/nushu?story=sisters-letter&page=story-experience"
    });
  });
});
