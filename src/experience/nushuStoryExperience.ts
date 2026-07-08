import { getDefaultStory, type NushuStory } from "./storyContent";

export interface ResearchJourneyEntry {
  eyebrow: string;
  title: string;
  summary: string;
  primaryActionLabel: string;
  studyPromise: string;
}

export interface NushuStoryExperience {
  name: string;
  audience: string;
  entry: ResearchJourneyEntry;
  story: NushuStory;
}

export const defaultNushuStoryExperience: NushuStoryExperience = {
  name: "女书故事体验",
  audience: "面向普通读者和研究参与者的中英双语阅读体验",
  entry: {
    eyebrow: "女书文化阅读 / Nushu Reading",
    title: "听见一段女书故事",
    summary:
      "从一段改写自三朝书传统的短篇开始，先看女书原文，再逐句点读，并用中文说明和英文辅助翻译理解故事语境。",
    primaryActionLabel: "开始阅读体验",
    studyPromise:
      "本阶段不收集账号、不连接后端；页面中的声音提示用于帮助理解逐句点读流程。"
  },
  story: getDefaultStory()
};

export function getVisibleJourneyEntry(
  experience: NushuStoryExperience = defaultNushuStoryExperience
): ResearchJourneyEntry {
  return experience.entry;
}
