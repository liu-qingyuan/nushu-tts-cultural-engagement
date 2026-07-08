import { describe, expect, it } from "vitest";
import {
  createParticipationActionController,
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
        "分享链接已准备，可复制给朋友：https://example.test/nushu?story=sisters-letter#experience-preview",
      shouldSelectShareLink: true
    });
  });
});
