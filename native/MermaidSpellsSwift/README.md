# Mermaid Spells Swift

Native SwiftUI port of the Mermaid Spells literacy game.

Current scope:

- Mac-native SwiftUI app runnable with Swift Package Manager.
- Platform-neutral learning models, mastery rules, session builder, and views.
- Lowercase-first Montessori progression with first words and phonograms.

Run locally:

```sh
swift run MermaidSpellsNative
```

Build check:

```sh
swift build
```

iPad path:

- Reuse `Sources/MermaidSpellsNative` as the shared SwiftUI/core layer.
- Add an Xcode iOS app target that points at the same models, services, and views.
- Add Apple Speech and AVFoundation permission strings in the iOS app target when live voice validation is wired.
