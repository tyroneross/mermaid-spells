# Mermaid Spells Native iOS + TestFlight Plan

## Bottom Line

Commit `478ebce` captures the current Mermaid Spells literacy game. The next step depends on what "native iOS" should mean:

1. **Fastest TestFlight path:** use the Expo/React Native iOS target already generated under `app/ios`.
2. **True Apple-native path:** promote `native/MermaidSpellsSwift` from a Swift Package/macOS runner into an archive-ready SwiftUI iOS app target.

Recommendation: use **SwiftUI native** if the goal is a durable Mac/iPad/iPhone Apple app. Use the Expo iOS target only if the near-term priority is getting the current game into TestFlight quickly for feedback.

## Current State

- Repo is clean after commit `478ebce`.
- Expo app is feature-complete enough for preview: Montessori progression, mermaid images, sounds, settings/progress, and voice-practice transcript scoring.
- `app/ios/MermaidSpells.xcodeproj` exists from Expo prebuild, but `app/.gitignore` ignores `/ios`, so it is currently an uncommitted/generated native target.
- Generated Expo iOS target has:
  - Bundle ID: `com.mermaidspells.app`
  - Marketing version: `1.0`
  - Build number: `1`
  - iOS deployment target: `15.1`
  - Microphone usage string present
  - Speech recognition usage string missing in the generated `Info.plist`, despite app config containing one
- Swift package exists at `native/MermaidSpellsSwift` and passes `swift build` and `swift test`.
- Swift package is not yet an App Store/TestFlight app because it lacks an iOS `.xcodeproj`/target, signing, assets catalog integration, device permissions, and archive/export configuration.
- Xcode is installed: Xcode 26.3, build `17C529`.
- Local App Store Connect API key files exist in private key folders, but the App Store Connect app record, team ID, issuer ID, and chosen key need to be confirmed before upload.
- `xcrun simctl` failed in the sandbox because CoreSimulatorService could not be reached. Simulator validation should be run through an approved GUI/simulator flow or escalated command path.

## Apple / Expo Distribution Facts Checked

- App Store Connect upload requires an App Store Connect role such as Account Holder, Admin, App Manager, or Developer.
- A build is associated to the App Store Connect app by bundle ID, version number, and build string.
- First build upload creates a beta version, then Apple processing must complete before it appears for TestFlight distribution.
- App Store Connect upload can be done with Xcode, Transporter, altool, or related API/JWT tooling.
- App Store Connect API keys are created under Users and Access > Integrations and team keys require Account Holder or Admin.
- EAS Submit can upload a signed iOS IPA to App Store Connect/TestFlight, but TestFlight is not production release.

Sources:

- https://developer.apple.com/help/app-store-connect/manage-builds/upload-builds/
- https://developer.apple.com/help/app-store-connect/get-started/app-store-connect-api
- https://developer.apple.com/documentation/xcode/preparing-your-app-for-distribution/
- https://docs.expo.dev/submit/introduction/

## Decision Gate

Choose one lane before implementation:

### Lane A: Expo Native iOS, Fastest TestFlight

Best when: immediate tester feedback matters more than pure Swift.

Work:

1. Regenerate iOS deterministically:
   - `cd app`
   - `npx expo prebuild --platform ios --clean`
2. Fix generated iOS config:
   - Confirm `NSSpeechRecognitionUsageDescription` lands in `Info.plist`.
   - Confirm `NSMicrophoneUsageDescription` copy is child/privacy appropriate.
   - Set `ios.buildNumber` in `app.json`.
   - Confirm bundle ID `com.mermaidspells.app`.
3. Decide whether to commit `app/ios`:
   - Commit it if local Xcode/TestFlight will be the deployment path.
   - Keep it generated if EAS Build is the deployment path.
4. Validate native runtime:
   - `npx expo run:ios` or Xcode simulator run.
   - Device smoke test for sound, animations, settings/progress, and microphone prompt.
5. Archive/upload:
   - EAS path: configure `eas.json`, run `eas build --platform ios`, then `eas submit --platform ios`.
   - Xcode path: archive with `xcodebuild`, export/upload through Xcode Organizer or App Store Connect upload command.

Risks:

- This is still React Native, not SwiftUI.
- Speech recognition behavior must be tested on real device, not only web/simulator.
- Generated iOS project can drift unless committed or regenerated predictably.

### Lane B: SwiftUI Native iOS, Best Long-Term Apple App

Best when: native iOS/iPad/macOS quality and Swift ownership matter most.

Work:

1. Convert package structure:
   - Split `MermaidSpellsNative` core into a reusable Swift library target.
   - Add an iOS app target that imports the shared library.
   - Keep macOS app target or Mac Catalyst path if desired.
2. Add project container:
   - Preferred: `native/MermaidSpellsApple/MermaidSpellsApple.xcodeproj`.
   - Alternative: XcodeGen `project.yml` if adding one lightweight local tool is acceptable.
3. Port production features currently richer in Expo:
   - Mermaid image assets and ocean visuals.
   - Sound playback.
   - Settings/progress panel.
   - Persistence for child profile, settings, session number, and mastery.
   - Real speech capture with `Speech` + `AVFoundation`.
   - Child/privacy-safe microphone and speech permission copy.
4. Add signing/deployment config:
   - Bundle ID: likely `com.mermaidspells.app`, unless App Store Connect already owns a different ID.
   - Team ID.
   - `MARKETING_VERSION = 1.0.0`.
   - Incrementing `CURRENT_PROJECT_VERSION`.
   - App icon, launch screen, privacy manifest, category, supported destinations.
5. Validate native build:
   - `swift test`
   - `xcodebuild -project ... -scheme ... -destination 'platform=iOS Simulator,name=<device>' test`
   - Device smoke: audio, haptics, speech permission, progress persistence.
6. Archive/upload:
   - `xcodebuild -project ... -scheme ... -destination 'generic/platform=iOS' archive ...`
   - Export/upload through Xcode Organizer, Transporter, or `xcodebuild -exportArchive` with App Store Connect signing.

Risks:

- More work than Expo path because current SwiftUI shell is a functional prototype, not parity.
- Real voice validation requires device-level speech testing and App Store privacy wording.
- TestFlight upload cannot proceed until App Store Connect app record and signing team are confirmed.

## Recommended Next Build-Loop

### Goal

Create an archive-ready native iOS app path and upload the first Mermaid Spells build to TestFlight.

### Scope for Next Pass

If SwiftUI native is chosen:

1. Create `native/MermaidSpellsApple` Xcode app target.
2. Reuse existing Swift models/services/views as shared source.
3. Add iOS app metadata, assets, permissions, and signing placeholders.
4. Build and run on simulator.
5. Add local archive/export scripts.
6. Confirm App Store Connect app record and signing.
7. Archive and upload to TestFlight.

If Expo native is chosen:

1. Regenerate `app/ios`.
2. Fix permission strings and build metadata.
3. Build iOS simulator/device target.
4. Configure EAS or Xcode archive path.
5. Upload signed IPA to App Store Connect/TestFlight.

### Acceptance Criteria

- iOS app target exists and is reproducible from committed source.
- Bundle ID and App Store Connect app record match.
- App icon, launch screen, privacy manifest, microphone/speech permission strings, and supported destinations are configured.
- The app runs on iPhone simulator and preferably one physical iPhone/iPad.
- Sound, settings/progress, and core literacy loop pass smoke testing.
- Voice permission flow is visible; live speech capture is either working or explicitly disabled for the first TestFlight.
- Archive succeeds for `generic/platform=iOS`.
- Upload reaches App Store Connect and appears under TestFlight after processing.

## Immediate Recommendation

Do **not** upload yet. The current commit is a strong product prototype, but TestFlight needs one more build-loop:

1. Decide SwiftUI native vs Expo native.
2. Build the selected iOS target.
3. Validate on simulator/device.
4. Archive.
5. Upload.

My recommendation is to choose **SwiftUI native** for the durable Apple app, and use the Expo iOS target only if we want a quick TestFlight feedback build before the full SwiftUI port reaches parity.
