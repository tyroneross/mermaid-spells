---
date: 2026-05-16
mode: balanced
task_type: feature
confidence: medium-high
---

# Research Packet: Montessori Cursive, Phonograms, Voice, and Imagegen

## Bottom Line

Mermaid Spells should evolve into a Montessori-aligned mastery game with four strands: lowercase cursive sound-symbol work, tactile tracing, phonogram/digraph practice, and first-word building. Voice validation should be optional and adapter-based, with on-device/local behavior first and no saved child audio by default. Imagegen is useful for child-friendly bitmap art, backgrounds, and object cards, but not for generating the cursive glyphs themselves.

## Repo Findings

- The app is an Expo/React Native mobile app under `app/`, with the playable flow in `app/App.tsx`.
- The current content model only covers single lowercase letters in `app/constants/letterData.ts`.
- The current game queue uses `MONTESSORI_ORDER`, split into three levels by fixed slices.
- The docs already call for private, no-score, no-timer practice, but the implementation still shows score, stars, streak, progress bar, and round counter in the child UI.
- `app/hooks/useSoundEngine.ts` is currently a no-op hook; it is the natural seam for real sounds and phoneme playback.
- `app/assets/` contains only app icon assets. Mermaid and sea creatures are SVG components, so imagegen would be a new bitmap-art lane rather than an edit of existing source assets.
- The TypeScript check passed with `npx tsc --noEmit` from `app/`.

## External Research Findings

### Montessori Letter Representation

- Nienhuis Montessori's AMI-approved US cursive sandpaper letters are lowercase and are designed to guide the hand in the writing direction. The boards use pink for consonants and blue for vowels.
- Montessori Album's sandpaper-letter lesson says the adult traces the letter path, says the sound rather than the letter name, and has the child trace while saying the sound.
- Nienhuis double sandpaper letters are lowercase US cursive on green boards and are described as a hand-guided writing material for double letters.
- Montessori Album describes double sandpaper letters as introducing digraphs; it says the term "digraph" does not need to be taught to the child.

### Phonics / Reading Sequence

- The National Reading Panel distinguishes phonemic awareness from phonics and reports that explicit phonemic-awareness instruction improves reading and spelling outcomes.
- The same NICHD summary notes that phonics is necessary but not sufficient; it must be integrated with phonemic awareness, fluency, and comprehension.
- Structured Literacy materials from the International Dyslexia Association emphasize integration across oral and written language domains, including phonology.

### Voice Technology

- Expo Speech is text-to-speech only; it does not provide speech recognition.
- `expo-speech-recognition` offers an Expo-friendly speech-recognition bridge over iOS `SFSpeechRecognizer`, Android `SpeechRecognizer`, and Web SpeechRecognition, but it requires config-plugin/native-build handling.
- `@react-native-voice/voice` also requires custom native code and cannot run in Expo Go.
- Azure Pronunciation Assessment can provide phoneme-level scoring for scripted speech, but it is cloud-based and should not be the default for a preschool app unless parent opt-in and privacy handling are explicit.

## Recommended Product Shape

### 1. Keep Lowercase Cursive First

Use lowercase cursive for all initial lessons. Do not introduce uppercase or print until after the child can reliably recognize and trace a core lowercase set.

Implementation implication:
- Replace generic Kalam rendering as the source of truth with a validated cursive font or path assets.
- Preserve all glyph rendering as deterministic app assets, not imagegen outputs.
- Use sounds, not letter names, in child-facing prompts.

### 2. Add A Montessori-Aligned Progression

Recommended progression:

1. Sound game: child hears/chooses initial sounds with objects.
2. Single cursive letters: lowercase only, trace and say sound.
3. First phonetic words: build/read simple CVC words using known letters.
4. Phonograms: introduce joined lowercase double letters as one sound on green "spell cards."
5. Initial phonogram words: ship, chat, thin/this, quack, rain, bee, moon, boat, car, horn, etc.
6. Later bridge: print/uppercase and more complex words.

Important correction:
- The user-requested `our` should be later than the first phonogram set. Standard Montessori double sandpaper sets usually include `ou`, not `our`; `our` is a trigraph/word-family pattern and should come after `ou` and simple phonogram words.

Suggested first phonogram order:

1. `sh`, `ch`, `th`, `qu` - high-salience consonant digraphs / common early patterns.
2. `ai`, `ee`, `oa` - stable vowel teams with clear object-word support.
3. `ar`, `or`, `er` - r-controlled vowel patterns.
4. `au`, `oo`, `ue`, `ie`, `oy`, `ou` - more ambiguity or later word availability.
5. `our` - late extension, taught as a word-family pattern rather than a basic double-letter phonogram.

### 3. Make Mastery Invisible To The Child

The app should track mastery, but the child should not see a score, streak, progress bar, level score, or comparison. Replace those with:

- Mermaid mood/state.
- A calm "next spell" rhythm.
- A natural stopping point after roughly 5-7 minutes.
- Parent-visible progress only behind a parent gate.

### 4. Use Imagegen For Art, Not Glyphs

Good imagegen uses:
- Underwater backgrounds for age 4-7: warm, clear, non-scary, high contrast, not visually busy.
- Object cards for phonogram words: ship, shell, chair, cheese, thorn, queen/quail, rain, bee, moon, boat, car.
- Mermaid pose references and diverse customization concepts.
- Sea-creature unlock art as non-performance participation rewards.

Avoid imagegen for:
- Cursive letters and phonograms.
- Any image with text labels.
- Fine educational diagrams where incorrect shapes would teach the wrong form.

Asset direction:
- Store generated bitmap assets under `app/assets/illustrations/`.
- Use React Native `Image` before adding a new image package.
- Keep SVG components for scalable mermaid/creature animation if they remain easier to animate.

### 5. Treat Voice As Optional Practice, Not Grading

Voice should feel like "let the mermaid hear the sound," not "pass/fail pronunciation." Child speech and short phonemes are noisy recognition targets, so the first build should validate participation and likely target match, not produce adult-style pronunciation scores.

Recommended voice architecture:

```text
VoicePracticeEngine
  start(target)
  stop()
  cancel()
  onResult(result)

Adapters
  NoopVoicePracticeEngine
  ExpoSpeechRecognitionEngine
  CloudPronunciationEngine
```

Recommended first implementation:
- Add the interface and a `NoopVoicePracticeEngine`.
- Add optional voice prompt UI behind a parent-controlled setting.
- Add one native spike using `expo-speech-recognition` in a dev build.
- Use expected contextual strings for target sounds and words.
- Store only derived attempt events, not raw audio.
- Treat recognition as "heard / not heard / try again together," never "wrong pronunciation."

Cloud option:
- Azure Pronunciation Assessment is the best fit for phoneme-level scoring if the product later needs true pronunciation analytics.
- It should be parent-opt-in only, with no default cloud upload, because this is a 4-7 year old child app.

## Proposed Build Plan

### Pass 1: Pedagogy/Data Model

Files:
- `app/constants/letterData.ts`
- new `app/constants/learningItems.ts`
- new `app/constants/phonogramData.ts`

Work:
- Split learning items into `letter`, `phonogram`, and `word`.
- Add prerequisite fields and intro stages.
- Add word/object data for first CVC and phonogram words.
- Align letter order with either current `MONTESSORI_ORDER` or documented wave order; do not keep both conflicting.

Validation:
- TypeScript passes.
- Unit-style assertions verify that every phonogram has a sound, example words, and prerequisites.

### Pass 2: Private Child UI

Files:
- `app/App.tsx`
- possibly new `app/components/SpellCard.tsx`

Work:
- Remove visible score/streak/progress from the child screen.
- Replace level-complete score copy with narrative completion copy.
- Keep mastery state internal.

Validation:
- Static scan confirms no score/streak/progress text in child flow.
- Manual smoke confirms game still advances.

### Pass 3: Mastery Engine

Files:
- `app/stores/useAppStore.ts`
- new `app/services/masteryEngine.ts`

Work:
- Add session-based mastery state using AsyncStorage first.
- Generate 5-7 minute queues from mastery state.
- Interleave new, learning, familiar, and review items.

Validation:
- Deterministic queue tests with fixed mastery fixtures.

### Pass 4: Phonogram Reef

Files:
- `app/constants/phonogramData.ts`
- `app/App.tsx` or a new game-screen module

Work:
- Add green phonogram cards after prerequisites.
- Teach the sound, not the word "digraph."
- Add first phonogram words only after the child knows the component letters.

Validation:
- No phonogram appears before prerequisites.
- `our` appears only in later extension mode.

### Pass 5: Voice Spike

Files:
- new `app/services/voice/VoicePracticeEngine.ts`
- new `app/services/voice/NoopVoicePracticeEngine.ts`
- optional `app/services/voice/ExpoSpeechRecognitionEngine.ts`
- `app/app.json`

Work:
- Add adapter interface and child-safe UI state.
- Add dev-build-only `expo-speech-recognition` spike if accepted.
- Keep microphone prompt parent-controlled and bounded.

Validation:
- Permission copy exists.
- Voice disabled path works with no native module.
- No raw audio persistence by default.

### Pass 6: Imagegen Asset Pack

Files:
- `app/assets/illustrations/`
- `app/components/`

Work:
- Generate 3-5 concept backgrounds and 10-15 first object cards.
- Keep assets text-free.
- Use deterministic code/font for all letters.

Validation:
- Visual review on mobile viewport.
- Asset names map to learning items.
- No image is required to understand a letter shape.

## Imagegen Prompt Set

Use these as first prompts, not final production constraints.

### Background

```text
Use case: illustration-story
Asset type: mobile game background, 4-7 year old Montessori literacy app
Primary request: A bright, calm underwater learning cove for a mermaid letter game.
Scene/backdrop: shallow turquoise water, soft coral, sand, gentle light rays, a few clear open areas for UI cards.
Style: warm children's book illustration, soft edges, high contrast, friendly, not busy.
Constraints: no text, no letters, no scary creatures, no dark deep ocean mood, no watermark.
```

### Object Cards

```text
Use case: scientific-educational
Asset type: square object card for preschool phonics game
Primary request: A single clear object representing the word "ship" for the /sh/ sound.
Scene/backdrop: simple light underwater-themed card background, object centered, generous padding.
Style: polished children's book illustration, readable silhouette, friendly colors.
Constraints: no text, no letters, no extra objects, no complex scene, no watermark.
```

### Mermaid Reference

```text
Use case: illustration-story
Asset type: character reference for mobile game
Primary request: A friendly Black mermaid companion for a preschool literacy game, joyful and calm.
Subject: child-friendly mermaid, warm brown skin, textured afro puffs or braids, gold beads, teal/purple tail, gentle smile.
Style: premium children's book illustration, expressive but simple enough for mobile animation reference.
Constraints: no text, no letters, no crown unless requested, no hyperrealism, no adult styling, no watermark.
```

## Risks / Unknowns

- Child speech recognition for isolated phonemes can be unreliable; validate with real target devices and child-like recordings before making it a core mechanic.
- Current docs cite some secondary sources; before marketing pedagogy claims, replace weak citations with primary or institution-level sources.
- The app currently uses AsyncStorage, while docs mention SQLite. Use AsyncStorage for the first mastery engine unless progress data grows beyond the simple profile/items model.
- A true Montessori cursive font/path source needs selection and validation. Kalam is friendly, but it is not necessarily the right instructional cursive.

## Confidence

- Repo context coverage: high
- Montessori representation coverage: medium-high
- Voice feasibility coverage: medium
- Imagegen feasibility coverage: high
- Overall: medium-high

## Sources

- Nienhuis Montessori, Sandpaper Letters: US Cursive: https://www.nienhuis.com/us/product/sandpaper-letters-us-cursive/500_0054B4/
- Nienhuis Montessori, Double Sandpaper Letters: US Cursive: https://www.nienhuis.com/us/en/double-sandpaper-letters-us-cursive-nienhuis-montessori-usa/product/4963/
- Montessori Album, Sandpaper Letters: https://www.montessorialbum.com/montessori/index.php/Sandpaper_Letters
- Montessori Album, Double Sandpaper Letters: https://www.montessorialbum.com/montessori/index.php/Double_Sandpaper_Letters
- NICHD, National Reading Panel findings: https://www.nichd.nih.gov/publications/pubs/nrp/Pages/findings.aspx
- International Dyslexia Association, Structured Literacy: https://dyslexialibrary.org/structured-literacy-education-infographic/
- Expo Speech docs: https://docs.expo.dev/versions/latest/sdk/speech/
- Expo Audio docs: https://docs.expo.dev/versions/latest/sdk/audio/
- Expo permissions guide: https://docs.expo.dev/guides/permissions/
- expo-speech-recognition docs: https://github.com/jamsch/expo-speech-recognition
- react-native-voice docs: https://github.com/react-native-voice/voice
- Azure Pronunciation Assessment docs: https://learn.microsoft.com/en-us/azure/ai-services/Speech-Service/how-to-pronunciation-assessment
