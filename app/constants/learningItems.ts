import { MONTESSORI_ORDER, letterData } from "./letterData";
import { phonogramItems } from "./phonogramData";
import { firstWordItems } from "./wordData";

export type LearningItemKind = "letter" | "phonogram" | "word";

export type LearningStage =
  | "letter"
  | "phonogram-1"
  | "phonogram-2"
  | "phonogram-3"
  | "phonogram-4"
  | "word-1"
  | "word-phonogram"
  | "extension";

export interface LearningItem {
  id: string;
  kind: LearningItemKind;
  display: string;
  soundLabel: string;
  spokenPrompt: string;
  exampleWords: string[];
  prerequisites: string[];
  stage: LearningStage;
  assetKey: string;
}

export const letterItems: LearningItem[] = MONTESSORI_ORDER.map((letter) => {
  const data = letterData[letter];
  return {
    id: `letter:${letter}`,
    kind: "letter",
    display: letter,
    soundLabel: data.phonetic,
    spokenPrompt: `This spell says ${data.phonetic}`,
    exampleWords: [data.word],
    prerequisites: [],
    stage: "letter",
    assetKey: data.word,
  };
});

export const learningItems: LearningItem[] = [
  ...letterItems,
  ...phonogramItems,
  ...firstWordItems,
];

export const learningItemsById: Record<string, LearningItem> =
  Object.fromEntries(learningItems.map((item) => [item.id, item]));

export const firstLetterItems = letterItems;

export function getLearningItem(id: string): LearningItem | undefined {
  return learningItemsById[id];
}

export function getDistractorItems(
  correctId: string,
  count: number,
  pool: LearningItem[] = firstLetterItems
): LearningItem[] {
  return shuffleItems(pool.filter((item) => item.id !== correctId)).slice(0, count);
}

export function shuffleItems<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
