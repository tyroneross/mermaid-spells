// Montessori phonetic groups — letters ordered so children can form
// real words early (e.g. "sat", "mat", "am" from Group 1)
export const MONTESSORI_ORDER = [
  // Group 1: First words (sat, mat, am)
  "s", "m", "a", "t",
  // Group 2: More words (cat, rip, crisp)
  "c", "r", "i", "p",
  // Group 3
  "b", "f", "o", "g",
  // Group 4
  "d", "h", "e", "l",
  // Group 5
  "j", "k", "n", "u",
  // Group 6: Remaining
  "q", "v", "w", "x", "y", "z",
];

export const letterData: Record<
  string,
  { word: string; emoji: string; phonetic: string }
> = {
  a: { word: "apple", emoji: "\u{1F34E}", phonetic: "/a/" },
  b: { word: "ball", emoji: "\u26BD", phonetic: "/b/" },
  c: { word: "cat", emoji: "\u{1F431}", phonetic: "/k/" },
  d: { word: "dog", emoji: "\u{1F436}", phonetic: "/d/" },
  e: { word: "elephant", emoji: "\u{1F418}", phonetic: "/e/" },
  f: { word: "fish", emoji: "\u{1F41F}", phonetic: "/f/" },
  g: { word: "goat", emoji: "\u{1F410}", phonetic: "/g/" },
  h: { word: "hat", emoji: "\u{1F3A9}", phonetic: "/h/" },
  i: { word: "igloo", emoji: "\u{1F3E0}", phonetic: "/i/" },
  j: { word: "jellyfish", emoji: "\u{1FABC}", phonetic: "/j/" },
  k: { word: "kite", emoji: "\u{1FA81}", phonetic: "/k/" },
  l: { word: "lion", emoji: "\u{1F981}", phonetic: "/l/" },
  m: { word: "moon", emoji: "\u{1F319}", phonetic: "/m/" },
  n: { word: "nest", emoji: "\u{1FABA}", phonetic: "/n/" },
  o: { word: "octopus", emoji: "\u{1F419}", phonetic: "/o/" },
  p: { word: "pig", emoji: "\u{1F437}", phonetic: "/p/" },
  q: { word: "queen", emoji: "\u{1F451}", phonetic: "/kw/" },
  r: { word: "rainbow", emoji: "\u{1F308}", phonetic: "/r/" },
  s: { word: "sun", emoji: "\u2600\uFE0F", phonetic: "/s/" },
  t: { word: "tree", emoji: "\u{1F333}", phonetic: "/t/" },
  u: { word: "umbrella", emoji: "\u2602\uFE0F", phonetic: "/u/" },
  v: { word: "violin", emoji: "\u{1F3BB}", phonetic: "/v/" },
  w: { word: "whale", emoji: "\u{1F433}", phonetic: "/w/" },
  x: { word: "fox", emoji: "\u{1F98A}", phonetic: "/ks/" },
  y: { word: "yarn", emoji: "\u{1F9F6}", phonetic: "/y/" },
  z: { word: "zebra", emoji: "\u{1F993}", phonetic: "/z/" },
};

// Tail gradient colors per level
export const TAIL_COLORS: [string, string, string][] = [
  ["#26D0CE", "#1CB5E0", "#0E7490"], // Teal
  ["#F6D365", "#FDA085", "#D97706"], // Gold
  ["#7B68EE", "#6A5ACD", "#483D8B"], // Purple (original)
];
