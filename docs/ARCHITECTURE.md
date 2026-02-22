# Architecture

## Tech Stack

| Component | Choice | Rationale |
|-----------|--------|-----------|
| **Framework** | Expo (React Native) | Managed builds, OTA updates via EAS, web expansion possible, solo-dev friendly |
| **Animation** | React Native Skia + Skottie | GPU-accelerated rendering for underwater effects. Skottie is 63% faster than Lottie on low-end Android. |
| **Gestures** | Gesture Handler v2.28+ | UI thread touch recognition = zero lag. Critical for fluid letter tracing. |
| **Motion** | Reanimated 4 | 60+ fps gesture-driven animations running on the UI thread |
| **Audio** | Expo Speech + React Native Sound | Offline TTS for letter pronunciation + preloaded sound effects. No API keys. |
| **Haptics** | Expo Haptics | Built-in cross-platform haptic feedback. Light/Medium/Strong intensity. |
| **Database** | Expo SQLite | Zero setup, offline-first, perfect scope for children's progress data (<50MB ever) |
| **State** | Zustand | Minimal boilerplate, fast iteration, persists to SQLite cleanly |
| **Build/Deploy** | EAS (Expo Application Services) | Cloud builds for iOS + Android, OTA updates, TestFlight/Play Store submission |

## Why Expo Over Alternatives

### vs. Bare React Native
Bare RN requires managing Xcode and Android Studio builds manually. For a solo developer, this friction multiplied across two platforms slows iteration dramatically. Expo's managed workflow handles native builds in the cloud.

### vs. Flutter
Flutter requires learning Dart and a fundamentally different component model. While Flutter has excellent animation performance, the marginal improvement over Skia-powered React Native doesn't justify the learning curve and ecosystem switch for a solo developer already proficient in React.

### vs. Native (Swift/Kotlin)
Building natively would require two separate codebases. The app's core interactions (touch tracing, animations, sound) are well-served by React Native + Skia. Native development is only justified if we hit performance walls — unlikely for this app's scope.

## System Architecture

```
┌─────────────────────────────────────┐
│           Mermaid Spells App        │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────┐  ┌──────────────────┐ │
│  │ Game UI  │  │ Tracing Canvas   │ │
│  │ (React)  │  │ (Skia)           │ │
│  └────┬─────┘  └────────┬─────────┘ │
│       │                 │           │
│  ┌────┴─────────────────┴─────────┐ │
│  │      Zustand Store             │ │
│  │  - current session state       │ │
│  │  - letter queue                │ │
│  │  - feedback state              │ │
│  └──────────────┬─────────────────┘ │
│                 │                   │
│  ┌──────────────┴─────────────────┐ │
│  │    Learning Engine             │ │
│  │  - Spaced repetition (4-box)  │ │
│  │  - Difficulty progression     │ │
│  │  - Session builder            │ │
│  └──────────────┬─────────────────┘ │
│                 │                   │
│  ┌──────────────┴─────────────────┐ │
│  │    Expo SQLite                 │ │
│  │  - Child profiles             │ │
│  │  - Letter progress per child  │ │
│  │  - Session history            │ │
│  └────────────────────────────────┘ │
│                                     │
│  ┌────────────────────────────────┐ │
│  │  Sensory Layer                 │ │
│  │  - Expo Haptics               │ │
│  │  - Expo Speech (TTS)          │ │
│  │  - React Native Sound (SFX)   │ │
│  │  - Reanimated (animations)    │ │
│  └────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## Data Model

```sql
-- Child profiles (multiple kids per device)
CREATE TABLE children (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  avatarId TEXT,          -- which mermaid customization
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Per-letter mastery tracking
CREATE TABLE letter_progress (
  id TEXT PRIMARY KEY,
  child_id TEXT NOT NULL,
  letter TEXT NOT NULL,        -- 'a' through 'z'
  box INTEGER DEFAULT 1,      -- spaced repetition box (1-4)
  correct_count INTEGER DEFAULT 0,
  attempt_count INTEGER DEFAULT 0,
  last_session INTEGER DEFAULT 0,  -- session number last seen
  FOREIGN KEY(child_id) REFERENCES children(id),
  UNIQUE(child_id, letter)
);

-- Session log (for algorithm, not displayed to child)
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  child_id TEXT NOT NULL,
  session_number INTEGER NOT NULL,
  letters_shown INTEGER DEFAULT 0,
  letters_correct INTEGER DEFAULT 0,
  duration_ms INTEGER,
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(child_id) REFERENCES children(id)
);
```

## Offline-First

The app requires zero internet connectivity. All assets (letter data, sounds, mermaid animations) are bundled. Progress is stored locally in SQLite. No backend, no accounts, no cloud sync (unless added in future phases).

## Performance Targets

| Metric | Target | Why |
|--------|--------|-----|
| Touch response | <16ms (60 fps) | Young children expect instant response |
| Celebration animation | 2-3 seconds | Long enough to feel rewarding, short enough to maintain pace |
| App startup | <2 seconds | 4-year-old patience threshold |
| Memory usage | <100MB idle | Runs well on hand-me-down devices |
| Battery drain | <5% per 30 min | Parents won't tolerate battery-hungry kids apps |

## Project Setup Commands

```bash
# Create Expo project
npx create-expo-app MermaidSpells
cd MermaidSpells

# Core dependencies
npx expo install expo-sqlite expo-haptics expo-speech
npx expo install @shopify/react-native-skia
npm install react-native-gesture-handler react-native-reanimated
npm install zustand
npm install react-native-sound

# Development
npx expo start

# Build for testing
eas build --platform ios --profile preview
eas build --platform android --profile preview
```
