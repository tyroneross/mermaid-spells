const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const files = [
  path.join(root, "constants", "letterData.ts"),
  path.join(root, "constants", "phonogramData.ts"),
  path.join(root, "constants", "wordData.ts"),
];

const source = Object.fromEntries(files.map((file) => [file, fs.readFileSync(file, "utf8")]));
const allSource = Object.values(source).join("\n");

function fail(message) {
  console.error(`learning-data: ${message}`);
  process.exitCode = 1;
}

function matchAll(text, pattern) {
  return [...text.matchAll(pattern)];
}

const letterOrderMatch = source[files[0]].match(/MONTESSORI_ORDER\s*=\s*\[([\s\S]*?)\];/);
if (!letterOrderMatch) {
  fail("MONTESSORI_ORDER was not found");
}

const letters = letterOrderMatch
  ? matchAll(letterOrderMatch[1], /"([a-z])"/g).map((match) => match[1])
  : [];
const knownIds = new Set(letters.map((letter) => `letter:${letter}`));
const explicitIds = matchAll(allSource, /id:\s*"([^"]+)"/g).map((match) => match[1]);

for (const id of explicitIds) {
  if (knownIds.has(id)) {
    fail(`duplicate id ${id}`);
  }
  knownIds.add(id);
}

if (knownIds.size !== letters.length + explicitIds.length) {
  fail("duplicate ids found");
}

const objectBlocks = matchAll(
  `${source[files[1]]}\n${source[files[2]]}`,
  /\{\s*id:\s*"([^"]+)"([\s\S]*?)\n\s*\}/g
);

const requiredFields = [
  "kind",
  "display",
  "soundLabel",
  "spokenPrompt",
  "exampleWords",
  "prerequisites",
  "stage",
  "assetKey",
];

for (const [, id, body] of objectBlocks) {
  for (const field of requiredFields) {
    if (!new RegExp(`${field}:`).test(body)) {
      fail(`${id} is missing ${field}`);
    }
  }

  const prerequisites = matchAll(body, /"((?:letter|phonogram|word):[^"]+)"/g)
    .map((match) => match[1])
    .filter((value) => value !== id);

  for (const prerequisite of prerequisites) {
    if (!knownIds.has(prerequisite)) {
      fail(`${id} references unknown prerequisite ${prerequisite}`);
    }
  }

  if (id === "phonogram:our" && /stage:\s*"phonogram-[1234]"/.test(body)) {
    fail("phonogram:our must stay in the later extension stage");
  }
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log(`learning-data: ${knownIds.size} ids validated`);
