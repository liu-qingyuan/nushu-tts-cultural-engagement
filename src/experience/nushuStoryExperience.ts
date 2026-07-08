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
  audience: "面向研究参与者的公开网页原型",
  entry: {
    eyebrow: "Nushu TTS Cultural Engagement",
    title: "听见一段女书故事",
    summary:
      "第一版原型先建立体验外壳：参与者会从默认故事入口进入，后续切片再逐步接入故事文本、音频体验和体验后反馈。",
    primaryActionLabel: "开始默认体验",
    studyPromise:
      "本阶段不收集账号、不连接后端，也不预设普通 TTS baseline 或真实模型。"
  },
  story: getDefaultStory()
};

export function getVisibleJourneyEntry(
  experience: NushuStoryExperience = defaultNushuStoryExperience
): ResearchJourneyEntry {
  return experience.entry;
}
