# Architecture Decision Records

## ADR-001: Expo over Bare React Native

**Status**: Accepted
**Date**: 2026-02-22

**Context**: Need to build a cross-platform mobile app (iOS + Android) as a solo developer. The app requires rich animations, haptic feedback, audio, and offline storage.

**Decision**: Use Expo with managed workflow.

**Rationale**:
- Managed builds eliminate need for local Xcode/Android Studio setup
- EAS Build handles cloud builds for both platforms
- EAS Update enables OTA updates without app store review
- All required native modules (SQLite, Haptics, Speech) have Expo equivalents
- Future web expansion possible via Expo Web
- If we hit Expo limitations, we can eject to bare workflow

**Consequences**: Locked into Expo's supported native modules. Custom native modules require config plugins or ejecting.

---

## ADR-002: React Native Skia over Lottie

**Status**: Accepted
**Date**: 2026-02-22

**Context**: The app needs smooth underwater animations (bubbles, mermaid movement, celebration effects) and a high-performance drawing canvas for letter tracing.

**Decision**: Use @shopify/react-native-skia with Skottie for pre-built animations and raw Skia canvas for letter tracing.

**Rationale**:
- Skia provides a unified GPU-accelerated rendering pipeline
- Skottie renders Lottie-format animations 63% faster than react-native-lottie on low-end Android
- Skia Canvas enables custom drawing paths for letter tracing (Lottie cannot do this)
- Single dependency instead of separate animation + drawing libraries

**Consequences**: Heavier initial dependency. Learning curve for Skia's drawing API. But eliminates need for separate tracing library.

---

## ADR-003: Expo SQLite over WatermelonDB

**Status**: Accepted
**Date**: 2026-02-22

**Context**: Need persistent storage for child profiles, letter progress (26 letters x N children), and session history.

**Decision**: Use Expo SQLite.

**Rationale**:
- Data scope is tiny: ~26 rows per child for letter progress, ~100 sessions per child
- WatermelonDB is designed for large datasets with reactive batch updates — massive overkill
- Expo SQLite has zero setup complexity (built into Expo)
- No need for reactive database queries — data changes on user interaction only
- If we need sync later, SQLite data is trivially exportable

**Consequences**: No reactive queries (must manually refresh state after writes). Acceptable for this app's data access patterns.

---

## ADR-004: 100% Offline-First, No Backend

**Status**: Accepted
**Date**: 2026-02-22

**Context**: The app is for 4-5 year olds. It should work anywhere (restaurants, cars, planes, areas with no wifi).

**Decision**: No backend server. All data stored locally. All assets bundled with the app.

**Rationale**:
- Children's apps must work offline reliably
- Progress data is private to the device (privacy-first design)
- No user accounts needed (child profiles are local)
- No ongoing server costs for a solo developer
- Letter data, sounds, and animations are small enough to bundle (~20-50MB)

**Consequences**: No cross-device sync. No cloud backup. If device is lost/reset, progress is lost. Acceptable tradeoff for simplicity and privacy. Cloud sync can be added in future as opt-in feature.

---

## ADR-005: Zustand over Redux

**Status**: Accepted
**Date**: 2026-02-22

**Context**: Need state management for current session state (active letter, feedback animation, options displayed) and synchronization with SQLite persistence layer.

**Decision**: Use Zustand.

**Rationale**:
- Minimal boilerplate: one file vs Redux's actions/reducers/selectors pattern
- Excellent TypeScript support prevents runtime errors
- Easy persistence: middleware can sync to SQLite on state changes
- Only re-renders components that access changed state
- Solo developer advantage: fast to write, easy to understand months later

**Consequences**: Less structured than Redux for large teams. Acceptable for solo development. If team grows, could migrate to Redux Toolkit.

---

## ADR-006: Session-Based Spaced Repetition over Calendar-Based

**Status**: Accepted
**Date**: 2026-02-22

**Context**: Standard spaced repetition (SM-2, FSRS) calculates review intervals in days. But 4-5 year olds don't use apps on predictable schedules.

**Decision**: Use a modified 4-box Leitner system with session-based intervals instead of calendar-based intervals.

**Rationale**:
- A child might play 3 times on Saturday and not again until Wednesday
- Calendar-based: "review in 2 days" fails if child doesn't open app
- Session-based: "review after 3 sessions" works regardless of real-time gaps
- Simpler to implement and debug
- Research supports spacing works across intervals — exact timing is less important than the spacing itself

**Consequences**: Sub-optimal compared to FSRS for adult learners. But more robust for unpredictable usage patterns of young children. Can upgrade algorithm later if data suggests it.

---

## ADR-007: No Visible Scoring

**Status**: Accepted
**Date**: 2026-02-22

**Context**: Most educational apps display scores, progress bars, and performance metrics to the user.

**Decision**: Hide all scoring and progress metrics from the child's interface.

**Rationale**:
- Target user has performance anxiety (freezes when evaluated)
- Visible scores create extrinsic motivation that undermines intrinsic motivation
- ADHD children respond better to social rewards (mermaid's joy) than numerical scores
- Progress data is still collected for the spaced repetition algorithm — it's just invisible
- Parent dashboard (Phase 3) provides progress visibility to adults through a separate interface

**Consequences**: Some parents may initially wonder "how do I know if it's working?" Addressed by: (1) parent dashboard in Phase 3, (2) observing child's enthusiasm to play, (3) noticing cursive letter recognition in daily life.

---

## ADR-008: Mermaid Character Design — Black Representation

**Status**: Accepted
**Date**: 2026-02-22

**Context**: The original prototype features a Black mermaid with an afro hairstyle, gold hair beads, brown skin tones, and African-inspired accessories.

**Decision**: Maintain Black mermaid as the primary character. Add customization options for diverse representation in Phase 2.

**Rationale**:
- Built for the developer's daughter — authenticity matters
- Black children are underrepresented in educational app characters
- Research shows children engage more with characters that look like them
- Phase 2 customization allows other children to personalize (hairstyles, skin tones, tail colors)

**Consequences**: Primary marketing may need to show customization options to signal inclusivity. Default character intentionally centers Black representation.
