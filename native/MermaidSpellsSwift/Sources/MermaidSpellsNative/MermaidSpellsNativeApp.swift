import SwiftUI

@main
struct MermaidSpellsNativeApp: App {
    var body: some Scene {
        WindowGroup {
            GameView()
                .frame(minWidth: 420, minHeight: 700)
        }
        #if os(macOS)
        .windowResizability(.contentMinSize)
        #endif
    }
}
