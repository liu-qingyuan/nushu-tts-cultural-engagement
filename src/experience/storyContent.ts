export interface NushuStorySentence {
  id: string;
  nushuText: string;
  zhText: string;
  enText: string;
  culturalNote: string;
}

export interface NushuStory {
  id: string;
  title: string;
  subtitle: string;
  culturalContext: string;
  sourceNote: string;
  sentences: NushuStorySentence[];
}

export interface StoryContentProvider {
  getDefaultStory(): NushuStory;
}

const defaultStory: NushuStory = {
  id: "sisters-letter",
  title: "三朝书里的问候",
  subtitle: "A greeting carried in a Third-Day Book",
  culturalContext:
    "女书常由女性在亲友之间传写，用歌、信和故事保存情感、经验与互助关系。本原型先用一段基于女书三朝书传统改写的短篇，帮助普通用户理解文字、声音和文化语境之间的关系。",
  sourceNote:
    "内容为基于公开女书文化介绍与三朝书传统的体验性改写，并非未经改动的原始文献。正式研究前需要补充具体文本来源和授权说明。",
  sentences: [
    {
      id: "greeting",
      nushuText: "𛅰𛅱𛅲 𛅳𛅴",
      zhText: "远方的姐妹，愿你在新家平安。",
      enText: "Distant sister, may you be safe in your new home.",
      culturalNote:
        "三朝书常在女性出嫁后由亲友赠送，承载祝福、思念和生活劝勉。"
    },
    {
      id: "memory",
      nushuText: "𛅵𛅶𛅷 𛅸𛅹",
      zhText: "我们把旧日的歌写下，也把心里的话留下。",
      enText: "We write down old songs and leave the words kept in our hearts.",
      culturalNote:
        "女书不仅是文字，也是一种以歌唱、书写和传阅连接女性经验的文化实践。"
    },
    {
      id: "promise",
      nushuText: "𛅺𛅻𛅼 𛅽𛅾",
      zhText: "等到春水再涨时，请把回信托人带来。",
      enText: "When spring waters rise again, send your reply with someone you trust.",
      culturalNote:
        "故事中的往返书信突出了女书在亲友网络中的情感沟通功能。"
    }
  ]
};

export const localStoryContentProvider: StoryContentProvider = {
  getDefaultStory() {
    return defaultStory;
  }
};

export function getDefaultStory(
  provider: StoryContentProvider = localStoryContentProvider
): NushuStory {
  return provider.getDefaultStory();
}
