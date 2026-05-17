export type MasteryBox = 1 | 2 | 3 | 4;

export interface LearningProgress {
  box: MasteryBox;
  attempts: number;
  successes: number;
  lastSeenSession: number;
  introducedAtSession: number;
}

export type LearningProgressMap = Record<string, LearningProgress>;

export function createNewProgress(sessionNumber: number): LearningProgress {
  return {
    box: 1,
    attempts: 0,
    successes: 0,
    lastSeenSession: sessionNumber,
    introducedAtSession: sessionNumber,
  };
}

export function recordLearningAttempt(
  progress: LearningProgressMap,
  itemId: string,
  matched: boolean,
  sessionNumber: number
): LearningProgressMap {
  const existing = progress[itemId] ?? createNewProgress(sessionNumber);
  const nextBox = matched
    ? Math.min(4, existing.box + 1)
    : 1;

  return {
    ...progress,
    [itemId]: {
      ...existing,
      box: nextBox as MasteryBox,
      attempts: existing.attempts + 1,
      successes: existing.successes + (matched ? 1 : 0),
      lastSeenSession: sessionNumber,
    },
  };
}

export function isReadyForPrerequisite(progress?: LearningProgress): boolean {
  return (progress?.box ?? 0) >= 3;
}
