const fs = require("fs");
const path = require("path");
const ts = require("typescript");

require.extensions[".ts"] = function loadTypeScript(module, filename) {
  const source = fs.readFileSync(filename, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      jsx: ts.JsxEmit.React,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: filename,
  }).outputText;

  module._compile(output, filename);
};

const appRoot = path.resolve(__dirname, "..");
const {
  SESSION_ITEM_COUNT,
  buildSessionQueue,
  getEligibleLearningItems,
} = require(path.join(appRoot, "services", "sessionBuilder.ts"));
const {
  recordLearningAttempt,
} = require(path.join(appRoot, "services", "masteryEngine.ts"));

function fail(message) {
  console.error(`session-builder: ${message}`);
  process.exitCode = 1;
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function master(progress, itemId) {
  return recordLearningAttempt(
    recordLearningAttempt(progress, itemId, true, 1),
    itemId,
    true,
    1
  );
}

function hasAdjacentDuplicate(items) {
  return items.some((item, index) => index > 0 && item.id === items[index - 1].id);
}

const firstQueue = buildSessionQueue({}, 1);
assert(firstQueue.length === SESSION_ITEM_COUNT, "fresh queue has wrong length");
assert(!hasAdjacentDuplicate(firstQueue), "fresh queue has adjacent duplicates");
assert(
  firstQueue.every((item) => item.kind === "letter"),
  "fresh queue should start with lowercase letters only"
);

let progress = {};
progress = master(progress, "letter:a");
progress = master(progress, "letter:m");

const wordEligible = getEligibleLearningItems(progress);
assert(
  wordEligible.some((item) => item.id === "word:am"),
  "word:am should unlock after a and m are practiced"
);

progress = master(progress, "letter:s");
progress = master(progress, "letter:h");

const phonogramEligible = getEligibleLearningItems(progress);
assert(
  phonogramEligible.some((item) => item.id === "phonogram:sh"),
  "phonogram:sh should unlock after s and h are practiced"
);
assert(
  !phonogramEligible.some((item) => item.id === "phonogram:our"),
  "phonogram:our should stay in the later extension set"
);

progress = master(progress, "letter:o");
progress = master(progress, "letter:u");
progress = master(progress, "letter:r");
progress = master(progress, "phonogram:ou");

const extensionEligible = getEligibleLearningItems(progress);
assert(
  extensionEligible.some((item) => item.id === "phonogram:our"),
  "phonogram:our should unlock after ou and r are practiced"
);

const advancedQueue = buildSessionQueue(progress, 2);
assert(advancedQueue.length === SESSION_ITEM_COUNT, "advanced queue has wrong length");
assert(!hasAdjacentDuplicate(advancedQueue), "advanced queue has adjacent duplicates");

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log("session-builder: progression rules validated");
