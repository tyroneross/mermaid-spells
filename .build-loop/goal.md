# Goal: Mermaid Spells Architecture And Outcome Plan

## Outcome

Build Mermaid Spells into a Montessori-aligned, private preschool literacy game for ages 4-7 where children progress from lowercase cursive sounds to tracing, phonograms, and first words without visible scores, timers, or grading.

## Success Criteria

1. Functionality: children can practice lowercase cursive letters now, then phonograms and first words through a shared learning-item model.
2. Intent fidelity: child-facing flows preserve private, low-stakes, sound-first Montessori practice.
3. Architecture: game UI, learning progression, mastery state, sensory feedback, voice practice, and asset data have separate boundaries.
4. Privacy: voice features are optional, parent-gated, bounded, and store no raw audio by default.
5. Validation: each milestone has a TypeScript check plus at least one deterministic behavior check.
6. Simplicity: keep AsyncStorage and existing Expo/React Native surfaces until the data or voice spike proves a stronger dependency is needed.

## Non-Goals

- Do not build a teacher dashboard or school accountability tool.
- Do not use image generation for cursive glyphs.
- Do not make cloud pronunciation scoring the default child experience.
- Do not add visible score, streak, grade, leaderboard, timer, or failure states to the child flow.
