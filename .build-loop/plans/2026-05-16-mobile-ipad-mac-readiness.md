# Mermaid Spells Mobile, iPad, And Mac Readiness

## Bottom Line

The app is now viable for phone and iPad portrait builds after enabling tablet support, fixing Expo dependency readiness, and removing static decorative viewport assumptions. It is not yet a native Mac app; the fastest Apple-native path is iPad-first plus Mac Catalyst after an iOS prebuild, while a full React Native macOS target is a larger port.

## Current State

- Expo SDK 54 app with React Native 0.81.
- iOS tablet support is enabled in `app/app.json`.
- Project passes `expo-doctor`, TypeScript, and learning/session/voice validators.
- Main game surfaces are centered and width-constrained, which keeps the preschool task area usable on phones and iPads.
- Setup and parent-gate screens now constrain content width on tablets.
- Bubbles and sea-creature decorations now use live window dimensions instead of one-time startup dimensions.

## Mobile Optimization Status

Pass:

- Core game controls are large enough for young children.
- Match choices wrap instead of overflowing narrow phones.
- Main cards use max widths, keeping line length controlled on larger screens.
- Voice practice is optional and child-facing validation does not drive mastery yet.

Needs Device Verification:

- iPhone SE / small Android portrait.
- iPhone Pro Max / large Android portrait.
- iPad 11-inch portrait.
- iPad split-view narrow width if multitasking is allowed.
- Physical iOS device for speech recognition, since simulator support is limited.

## iPad Requirements

Implemented:

- `ios.supportsTablet: true`.
- Tablet-width constraints for setup and parent gate.
- Responsive decorative animation dimensions.

Recommended Next:

- Add iPad screenshots and App Store metadata.
- Decide whether to support iPad multitasking. If yes, keep `requireFullScreen` unset/false and test split view. If no, set `ios.requireFullScreen: true`.
- Consider a tablet composition pass later: larger mermaid, more vertical breathing room, and optional side-by-side voice panel only after the core game is stable.

## Mac Native Options

Option A: iPad app on Apple silicon Macs.

- Lowest engineering cost.
- Depends on App Store availability choices and iPad compatibility.
- Best for quick distribution if desktop-specific UX is not required.

Option B: Mac Catalyst from the iPad/iOS app.

- Best near-term "native Mac" path for this codebase.
- Requires generating/opening the iOS native project, enabling Mac Catalyst in Xcode, creating the signing/provisioning setup, and checking every native module.
- Risk areas: `expo-speech-recognition`, `expo-haptics`, `react-native-reanimated`, and any iOS-only permission behavior.

Option C: React Native macOS target.

- More native desktop architecture.
- Larger port: add `react-native-macos`, create `macos/`, configure Metro to resolve `react-native-macos`, and verify Expo module support.
- Higher risk because Expo module support on React Native macOS is still not as turnkey as iOS/Android.

Recommendation:

Ship iPhone/iPad first, then test Mac Catalyst as the first native-Mac spike. Move to React Native macOS only if Catalyst cannot support the voice/animation stack or if the app needs desktop-specific UI patterns.
