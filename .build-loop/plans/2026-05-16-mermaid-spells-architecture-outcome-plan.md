# Mermaid Spells Architecture And Outcome Plan

## Bottom Line

✅ Build toward a modular Montessori learning game by first correcting the child experience and data model, then adding mastery, phonograms, voice, and image assets in separate milestones. The current app is viable as a prototype, but `App.tsx` is carrying routing, session logic, pedagogy, feedback, and UI rendering at once; that should be split before voice and phonograms are added.

## Target Outcome

✅ The target product is a private underwater literacy game for Montessori preschool and early elementary children, ages 4-7. The child starts with lowercase cursive sounds, traces and says those sounds, practices phonograms such as `sh`, `ch`, `th`, `qu`, `ai`, `ee`, and `oa`, then uses mastered sounds to build first words.

✅ The child-facing experience should show no score, no streak, no timer, no public progress, and no pass/fail pronunciation grade. Mastery exists for the learning engine and parent view only.

✅ Imagegen should improve the art direction through child-friendly backgrounds, mermaid references, object cards, and sea-creature assets. It should not generate instructional cursive glyphs.

✅ Voice should be an optional practice layer with a `NoopVoicePracticeEngine` default and later native/cloud adapters. It should validate participation and likely sound match before attempting pronunciation scoring.

## Architecture Assessment

### What Works

✅ The repo is already an Expo/React Native app with a small, understandable surface: `app/App.tsx`, `app/constants/letterData.ts`, `app/stores/useAppStore.ts`, child setup, parent gate, and visual components.

✅ The existing component set gives the app a real visual identity: `Mermaid`, `Bubbles`, and `SeaCreatures` already support the underwater narrative.

✅ The current app passes TypeScript with `npx tsc --noEmit` from `app/`, so the next work can proceed from a clean compile baseline.

✅ The current dependencies in `app/package.json` are restrained: Expo, React Native, Reanimated, Gesture Handler, SVG, AsyncStorage, Haptics, and Zustand. That supports the goal of keeping the first implementation simple.

### Gaps To Close

✅ `app/App.tsx` owns too many concerns: app routing, font loading, child session state, scoring, level progression, option generation, feedback copy, and styles.

✅ `app/constants/letterData.ts` only models single letters. It cannot cleanly represent phonograms, prerequisite letters, word-building items, or voice targets.

✅ `app/stores/useAppStore.ts` persists only child name, age, and onboarding status. It does not track mastery, sessions, learning items, or sensory preferences.

✅ `app/hooks/useSoundEngine.ts` is a no-op seam, which is acceptable now but not enough for phoneme playback or sound-sensitive toggles.

⚠️ `docs/ARCHITECTURE.md` describes Skia, Expo Speech, React Native Sound, and SQLite, but those packages are not present in `app/package.json`. Treat the docs as intended future architecture, not current implementation.

⚠️ The child UI currently shows score/stars/streak/progress and completion totals in `App.tsx`, which conflicts with the design principle of invisible progress.

⚠️ The design scanner found raw color-token warnings but no must-fix violations. Token cleanup should be planned, but it does not block the learning architecture.

## Recommended System Shape

```text
App shell
  App.tsx
  screens/ParentGate.tsx
  screens/ChildSetup.tsx
  screens/GameScreen.tsx

Learning domain
  constants/learningItems.ts
  constants/letterData.ts
  constants/phonogramData.ts
  constants/wordData.ts
  services/masteryEngine.ts
  services/sessionBuilder.ts

Sensory domain
  hooks/useSoundEngine.ts
  services/voice/VoicePracticeEngine.ts
  services/voice/NoopVoicePracticeEngine.ts
  services/voice/ExpoSpeechRecognitionEngine.ts

Visual domain
  components/Mermaid.tsx
  components/Bubbles.tsx
  components/SeaCreatures.tsx
  components/SpellCard.tsx
  components/ObjectChoice.tsx
  assets/illustrations/

State
  stores/useAppStore.ts
```

MODULARITY EXCEPTION: keep persistence in AsyncStorage for the first mastery engine rather than moving immediately to SQLite. The data volume is small, AsyncStorage is already installed, and the product needs validated learning behavior before a database migration.

## Threat Model And Permission Notes

threat-model: child microphone input and learning progress are high-sensitivity child data. Default implementation must not persist raw audio, must not upload audio, and must keep microphone practice parent-gated and optional.

permission_tier: T1 for local AsyncStorage mastery state, because it uses an existing local dependency and stays on-device.

permission_tier: T3 for any native speech-recognition dependency such as `expo-speech-recognition`, because it changes native permissions and requires a dev build.

permission_tier: T4 for any cloud pronunciation API such as Azure Pronunciation Assessment, because it sends child audio or derived speech data off-device.

External-call budget ceiling: no cloud calls in Milestones 1-5. If a later cloud pronunciation spike is approved, cap each child attempt at one bounded upload, 10 second timeout, no background recording, and no retained raw audio.

## Milestone Plan

### Milestone 1: Outcome-Aligned Child UI

Goal: remove contradiction between product principles and the current child flow.

Owned files:
- `app/App.tsx`
- optionally new `app/screens/GameScreen.tsx`
- optionally new `app/components/SpellCard.tsx`

Work:
- Remove child-visible score, streak, progress bar, round counter, level-score copy, and performance totals.
- Replace completion copy with narrative copy such as "The mermaid learned new spells today."
- Keep internal attempt tracking available for mastery, but do not render it in the child experience.
- Keep the parent gate separate from the child flow.

Validation:
- `npx tsc --noEmit` from `app/`.
- `rg -n "score|streak|stars earned|out of|roundCounter|progress" app/App.tsx app/screens app/components` and confirm any remaining matches are not child-visible scoring.
- Manual smoke: app still routes loading -> parent gate -> child setup -> game.

### Milestone 2: Learning Item Data Model

Goal: create a single data contract for letters, phonograms, and first words.

Owned files:
- `app/constants/letterData.ts`
- new `app/constants/learningItems.ts`
- new `app/constants/phonogramData.ts`
- new `app/constants/wordData.ts`

Work:
- Define `LearningItem` with `id`, `kind`, `display`, `soundLabel`, `spokenPrompt`, `exampleWords`, `prerequisites`, `stage`, and `assetKey`.
- Move single-letter data into the new shape while preserving current gameplay.
- Add phonograms in the recommended order: `sh`, `ch`, `th`, `qu`, `ai`, `ee`, `oa`, `ar`, `or`, `er`, `au`, `oo`, `ue`, `ie`, `oy`, `ou`, with `our` marked as later extension.
- Add first word items only where prerequisite letters or phonograms exist.

Validation:
- `npx tsc --noEmit` from `app/`.
- Add a small deterministic assertion script or test that every item has a sound label, no duplicate id, and no unmet prerequisite.
- Confirm `our` is not included in the first phonogram stage.

### Milestone 3: Mastery And Session Builder

Goal: replace fixed level slices with invisible session-based progression.

Owned files:
- `app/stores/useAppStore.ts`
- new `app/services/masteryEngine.ts`
- new `app/services/sessionBuilder.ts`
- `app/App.tsx` or `app/screens/GameScreen.tsx`

Work:
- Store `LearningProgress` by item id: box, attempts, successes, lastSessionSeen, and introducedAtSession.
- Generate 5-7 minute sessions from mastery state, not fixed `LEVELS` slices.
- Interleave new, learning, familiar, and review items; never show the same item back-to-back.
- Keep the child experience simple: one spell at a time, no box/level labels.

Validation:
- `npx tsc --noEmit` from `app/`.
- Deterministic tests for queue length, no adjacent duplicate items, prerequisite gating, and box movement.
- Manual smoke with a reset store.

### Milestone 4: Phonogram Reef

Goal: add the Montessori phonogram layer without overwhelming first-time readers.

Owned files:
- `app/constants/phonogramData.ts`
- `app/constants/wordData.ts`
- `app/screens/GameScreen.tsx`
- `app/components/SpellCard.tsx`

Work:
- Add green phonogram cards for joined lowercase pairs.
- Use child-facing wording like "This spell says /sh/" rather than "digraph."
- Add object-card choices for phonogram example words.
- Gate phonograms behind prerequisite single-letter mastery.

Validation:
- `npx tsc --noEmit` from `app/`.
- Assertion: no phonogram enters the queue before prerequisite items reach the configured mastery threshold.
- Manual smoke for at least one consonant digraph and one vowel team.

### Milestone 5: Voice Practice Adapter

Goal: create the voice architecture safely before choosing a native/cloud engine.

Owned files:
- new `app/services/voice/VoicePracticeEngine.ts`
- new `app/services/voice/NoopVoicePracticeEngine.ts`
- `app/screens/GameScreen.tsx`
- `app/stores/useAppStore.ts`

Work:
- Add `VoicePracticeEngine` with `start`, `stop`, `cancel`, and result states: `idle`, `listening`, `heard`, `tryAgain`, `unavailable`.
- Ship `NoopVoicePracticeEngine` first so the UI and state flow exist without native dependency risk.
- Add parent-controlled voice setting and child-safe copy.
- Store only derived events such as `voiceAttempted: true`, not audio.

Validation:
- `npx tsc --noEmit` from `app/`.
- Voice disabled path works with no permission prompt.
- Voice enabled/noop path shows "the mermaid is listening" and returns safely.

### Milestone 6: Native Voice Spike

Goal: test whether device speech recognition can handle short child phonemes well enough.

Owned files:
- `app/package.json`
- `app/app.json`
- new `app/services/voice/ExpoSpeechRecognitionEngine.ts`
- possible native permission files generated by Expo prebuild/dev build

Work:
- Evaluate `expo-speech-recognition` in a dev build only.
- Use contextual target words as recognition hints where possible.
- Score softly as "heard the sound" or "let's say it together," not correct/incorrect.
- Record false positive and false negative examples during testing.

Validation:
- Native build compiles.
- Permission prompts are parent-facing and bounded.
- Short-phoneme test matrix covers at least `sh`, `ch`, `th`, `ee`, `oo`, `ar`.
- Keep or reject the adapter based on observed reliability, not library promise.

### Milestone 7: Imagegen Asset Pack

Goal: improve age-appropriate visual richness without making educational content less accurate.

Owned files:
- `app/assets/illustrations/`
- `app/components/ObjectChoice.tsx`
- `app/constants/wordData.ts`

Work:
- Generate a small set first: one underwater background, one mermaid reference, and object cards for `ship`, `chair`, `thumb`, `queen`, `rain`, `bee`, `moon`, `boat`, `car`, and `horn`.
- Keep all generated images text-free.
- Use React Native `Image` before adding any new image library.
- Preserve deterministic font/path rendering for all cursive letters and phonograms.

Validation:
- Visual review on iPhone-sized and tablet-sized screens.
- Asset-key check: every object card referenced by data exists.
- No generated asset is required to identify the cursive glyph.

### Milestone 8: Architecture Cleanup And Docs Sync

Goal: make code, docs, and dependency reality agree.

Owned files:
- `docs/ARCHITECTURE.md`
- `docs/FEATURES.md`
- `docs/RESEARCH.md`
- `app/package.json` only if dependencies were actually added

Work:
- Update docs to distinguish current implementation from intended future architecture.
- Remove or qualify uninstalled claims about Skia, SQLite, Expo Speech, and React Native Sound until those dependencies are added.
- Add the actual learning-item and voice-adapter architecture.
- Document imagegen rules: art only, no instructional glyphs.

Validation:
- `npx tsc --noEmit` from `app/`.
- `rg -n "Skia|SQLite|Expo Speech|React Native Sound|score|stars|timer|phonogram|voice" docs app` and verify claims match code state.

## Dependency Order

1. Milestone 1 can happen immediately.
2. Milestone 2 should happen before mastery, phonograms, voice targets, or object-card assets.
3. Milestone 3 depends on Milestone 2.
4. Milestone 4 depends on Milestones 2 and 3.
5. Milestone 5 can start after Milestone 2, but should not validate real speech until Milestone 6.
6. Milestone 6 depends on parent approval for a native speech dependency.
7. Milestone 7 can start after Milestone 2 defines stable `assetKey` values.
8. Milestone 8 should run after each milestone and again at the end.

## Recommended First Build

✅ Start with Milestones 1 and 2 together. They are the highest leverage and lowest external-risk path: remove child-visible scoring, split `GameScreen`, introduce `LearningItem`, and preserve current letter gameplay through the new data contract.

Why first:
- It fixes the biggest product contradiction.
- It creates the foundation for phonograms, mastery, voice targets, and image assets.
- It avoids adding a new dependency before the app has the right internal boundaries.

## Review Gates

- Functionality: current letter matching still works.
- Intent fidelity: no child-visible score, streak, progress bar, grade, timer, or performance comparison.
- Architecture: `App.tsx` no longer owns full game flow after the screen split.
- Data integrity: every learning item is typed and has stable ids.
- Privacy: no microphone permission or cloud call before the voice milestone.
- Design: scanner has `mustFix: 0`; warning-only raw color findings can be queued.

## Known Open Questions

❓ Which instructional cursive source should become the deterministic glyph authority: a validated font, hand-authored SVG paths, or traced path data?

❓ Should the first production persistence remain AsyncStorage or move to SQLite when parent progress and multi-child support become real?

❓ Should voice be iOS-first, cross-platform native, or cloud-assisted after the noop adapter spike?
