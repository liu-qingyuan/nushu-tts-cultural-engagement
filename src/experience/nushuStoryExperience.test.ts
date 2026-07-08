import { describe, expect, it } from "vitest";
import {
  defaultNushuStoryExperience,
  getVisibleJourneyEntry
} from "./nushuStoryExperience";

describe("default Nushu story experience", () => {
  it("exposes a user-visible research journey entry", () => {
    const entry = getVisibleJourneyEntry();

    expect(entry.title).toContain("女书故事");
    expect(entry.primaryActionLabel).toBe("开始默认体验");
    expect(entry.studyPromise).toContain("不连接后端");
  });

  it("keeps the top-level module focused on the visible journey", () => {
    expect(defaultNushuStoryExperience).toEqual({
      name: expect.any(String),
      audience: expect.any(String),
      entry: expect.objectContaining({
        title: expect.any(String),
        primaryActionLabel: expect.any(String)
      })
    });
  });
});
