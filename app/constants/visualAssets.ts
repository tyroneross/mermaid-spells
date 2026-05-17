import { letterData } from "./letterData";
import type { LearningItem } from "./learningItems";

export const OBJECT_EMOJI_BY_ASSET: Record<string, string> = {
  am: "\u{1F642}",
  apple: "\u{1F34E}",
  ball: "\u26BD",
  bee: "\u{1F41D}",
  blue: "\u{1F535}",
  boat: "\u26F5",
  car: "\u{1F697}",
  cat: "\u{1F431}",
  chair: "\u{1FA91}",
  chat: "\u{1F431}",
  cloud: "\u2601\uFE0F",
  dog: "\u{1F436}",
  elephant: "\u{1F418}",
  fern: "\u{1FAB4}",
  fish: "\u{1F41F}",
  four: "4\uFE0F\u20E3",
  fox: "\u{1F98A}",
  goat: "\u{1F410}",
  hat: "\u{1F3A9}",
  horn: "\u{1F4EF}",
  igloo: "\u{1F3E0}",
  jellyfish: "\u{1FABC}",
  kite: "\u{1FA81}",
  lion: "\u{1F981}",
  mat: "\u{1F7EB}",
  moon: "\u{1F319}",
  nest: "\u{1FABA}",
  octopus: "\u{1F419}",
  pie: "\u{1F967}",
  pig: "\u{1F437}",
  quail: "\u{1F426}",
  queen: "\u{1F451}",
  rain: "\u{1F327}\uFE0F",
  rainbow: "\u{1F308}",
  sat: "\u{1F9D2}",
  shell: "\u{1F41A}",
  ship: "\u{1F6A2}",
  sun: "\u2600\uFE0F",
  thumb: "\u{1F44D}",
  toy: "\u{1F9F8}",
  tree: "\u{1F333}",
  umbrella: "\u2602\uFE0F",
  violin: "\u{1F3BB}",
  whale: "\u{1F433}",
  yarn: "\u{1F9F6}",
  zebra: "\u{1F993}",
};

export function getLearningItemEmoji(item: LearningItem): string {
  if (item.kind === "letter") {
    return letterData[item.display]?.emoji ?? "\u{1F4A7}";
  }

  return OBJECT_EMOJI_BY_ASSET[item.assetKey] ?? "\u{1F4A7}";
}
