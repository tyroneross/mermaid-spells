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
const { getLearningItem } = require(path.join(appRoot, "constants", "learningItems.ts"));
const {
  getVoiceContextualStrings,
  validateTranscriptForItem,
} = require(path.join(appRoot, "services", "voiceValidation.ts"));

function fail(message) {
  console.error(`voice-targets: ${message}`);
  process.exitCode = 1;
}

function item(id) {
  const found = getLearningItem(id);
  if (!found) fail(`${id} was not found`);
  return found;
}

function expectMatch(id, transcript) {
  const result = validateTranscriptForItem(item(id), transcript);
  if (!result.matched) {
    fail(`${id} should match "${transcript}"`);
  }
}

function expectMiss(id, transcript) {
  const result = validateTranscriptForItem(item(id), transcript);
  if (result.matched) {
    fail(`${id} should not match "${transcript}"`);
  }
}

expectMatch("letter:s", "sss");
expectMatch("letter:c", "cat");
expectMatch("phonogram:sh", "ship");
expectMatch("phonogram:th", "thin");
expectMatch("phonogram:ai", "rain");
expectMatch("word:sat", "sat");
expectMatch("word:am", "I am");

expectMiss("phonogram:sh", "banana");
expectMiss("word:mat", "sat");

for (const id of ["letter:s", "phonogram:sh"]) {
  const contexts = getVoiceContextualStrings(item(id));
  if (contexts.length < 2) {
    fail(`${id} has too few voice context strings`);
  }
}

if (getVoiceContextualStrings(item("word:sat")).length < 1) {
  fail("word:sat has no voice context strings");
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log("voice-targets: transcript scoring validated");
