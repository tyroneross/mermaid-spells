import type { LearningItem } from "../constants/learningItems";

export interface VoiceValidationResult {
  matched: boolean;
  transcript: string;
  acceptedText: string | null;
  targetLabel: string;
}

const SOUND_VARIANTS: Record<string, string[]> = {
  "/a/": ["a", "ah", "apple"],
  "/b/": ["b", "buh", "ball"],
  "/ch/": ["ch", "chair", "chat"],
  "/d/": ["d", "duh", "dog"],
  "/e/": ["e", "eh", "elephant"],
  "/ee/": ["e", "ee", "bee", "seed"],
  "/f/": ["f", "fff", "fish"],
  "/g/": ["g", "guh", "goat"],
  "/h/": ["h", "huh", "hat"],
  "/i/": ["i", "ih", "igloo"],
  "/ie/": ["i", "eye", "pie", "tie"],
  "/j/": ["j", "juh", "jellyfish"],
  "/k/": ["k", "kuh", "cat", "kite"],
  "/ks/": ["x", "ks", "fox"],
  "/kw/": ["kw", "qu", "queen", "quail"],
  "/l/": ["l", "lll", "lion"],
  "/m/": ["m", "mmm", "moon"],
  "/n/": ["n", "nnn", "nest"],
  "/o/": ["o", "ah", "octopus"],
  "/oa/": ["o", "oh", "oa", "boat", "goat"],
  "/oo/": ["oo", "moon", "pool"],
  "/or/": ["or", "ore", "horn"],
  "/our/": ["our", "hour", "four", "pour"],
  "/ou/": ["ou", "ow", "cloud", "out"],
  "/oy/": ["oy", "oi", "toy", "oyster"],
  "/p/": ["p", "puh", "pig"],
  "/r/": ["r", "rrr", "rainbow"],
  "/s/": ["s", "sss", "sun"],
  "/sh/": ["sh", "shh", "ship", "shell"],
  "/t/": ["t", "tuh", "tree"],
  "/th/": ["th", "thumb", "thin"],
  "/u/": ["u", "uh", "umbrella"],
  "/ue/": ["ue", "you", "blue", "glue"],
  "/v/": ["v", "vvv", "violin"],
  "/w/": ["w", "wuh", "whale"],
  "/y/": ["y", "yuh", "yarn"],
  "/z/": ["z", "zzz", "zebra"],
};

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

export function normalizeVoiceText(text: string): string {
  return text
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function compact(text: string): string {
  return normalizeVoiceText(text).replace(/\s+/g, "");
}

export function getVoiceTargetTexts(item: LearningItem): string[] {
  const labelTargets = SOUND_VARIANTS[item.soundLabel] ?? [];
  const soundText = item.soundLabel.replace(/\//g, "");

  return unique([
    item.display,
    soundText,
    ...item.exampleWords,
    ...labelTargets,
  ]).map(normalizeVoiceText);
}

export function getVoiceContextualStrings(item: LearningItem): string[] {
  return unique([
    item.display,
    item.soundLabel.replace(/\//g, ""),
    ...item.exampleWords,
    ...getVoiceTargetTexts(item),
  ]);
}

export function validateTranscriptForItem(
  item: LearningItem,
  transcript: string
): VoiceValidationResult {
  const normalizedTranscript = normalizeVoiceText(transcript);
  const compactTranscript = compact(transcript);
  const transcriptWords = normalizedTranscript.split(/\s+/).filter(Boolean);
  const targets = getVoiceTargetTexts(item).filter(Boolean);

  const acceptedText =
    targets.find((target) => normalizedTranscript === target) ??
    targets.find((target) => compactTranscript === compact(target)) ??
    targets.find((target) => transcriptWords.includes(target)) ??
    targets.find((target) => target.length > 2 && normalizedTranscript.includes(target)) ??
    null;

  return {
    matched: acceptedText !== null,
    transcript,
    acceptedText,
    targetLabel: item.soundLabel,
  };
}
