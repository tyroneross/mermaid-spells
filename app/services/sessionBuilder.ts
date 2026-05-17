import {
  firstLetterItems,
  learningItems,
  shuffleItems,
  type LearningItem,
} from "../constants/learningItems";
import {
  type LearningProgressMap,
  isReadyForPrerequisite,
} from "./masteryEngine";

export const SESSION_ITEM_COUNT = 15;
const FIRST_SESSION_LETTER_COUNT = 6;
const LETTER_LOOKAHEAD = 4;

function masteredLetterCount(progress: LearningProgressMap): number {
  return firstLetterItems.filter((item) => isReadyForPrerequisite(progress[item.id])).length;
}

function unlockedLetterItems(progress: LearningProgressMap): LearningItem[] {
  const count = Math.min(
    firstLetterItems.length,
    Math.max(FIRST_SESSION_LETTER_COUNT, masteredLetterCount(progress) + LETTER_LOOKAHEAD)
  );
  return firstLetterItems.slice(0, count);
}

function hasPrerequisites(item: LearningItem, progress: LearningProgressMap): boolean {
  return item.prerequisites.every((id) => isReadyForPrerequisite(progress[id]));
}

export function getEligibleLearningItems(progress: LearningProgressMap): LearningItem[] {
  const letters = unlockedLetterItems(progress);
  const advanced = learningItems.filter((item) => {
    if (item.kind === "letter") return false;
    return hasPrerequisites(item, progress);
  });

  return [...letters, ...advanced];
}

function itemWeight(item: LearningItem, progress: LearningProgressMap, sessionNumber: number): number {
  const itemProgress = progress[item.id];
  if (!itemProgress) return item.kind === "letter" ? 3 : 2;

  if (itemProgress.box === 1) return 3;
  if (itemProgress.box === 2) return 2;
  if (itemProgress.box === 3) return 1;

  return sessionNumber - itemProgress.lastSeenSession >= 3 ? 1 : 0;
}

function weightedPool(
  items: LearningItem[],
  progress: LearningProgressMap,
  sessionNumber: number
): LearningItem[] {
  return items.flatMap((item) =>
    Array.from({ length: itemWeight(item, progress, sessionNumber) }, () => item)
  );
}

export function buildSessionQueue(
  progress: LearningProgressMap,
  sessionNumber: number,
  count: number = SESSION_ITEM_COUNT
): LearningItem[] {
  const eligibleItems = getEligibleLearningItems(progress);
  const basePool = weightedPool(eligibleItems, progress, sessionNumber);
  const pool = basePool.length > 0 ? basePool : eligibleItems;
  const queue: LearningItem[] = [];

  while (queue.length < count && pool.length > 0) {
    const lastId = queue[queue.length - 1]?.id;
    const candidates = pool.filter((item) => item.id !== lastId);
    const source = candidates.length > 0 ? candidates : pool;
    const next = shuffleItems(source)[0];
    queue.push(next);

    const removeIndex = pool.findIndex((item) => item.id === next.id);
    if (removeIndex >= 0) {
      pool.splice(removeIndex, 1);
    }
  }

  if (queue.length >= count) {
    return queue;
  }

  const refill = shuffleItems(eligibleItems);
  while (queue.length < count && refill.length > 0) {
    const lastId = queue[queue.length - 1]?.id;
    const next =
      refill.find((item) => item.id !== lastId) ??
      refill[0];
    queue.push(next);
  }

  return queue;
}
