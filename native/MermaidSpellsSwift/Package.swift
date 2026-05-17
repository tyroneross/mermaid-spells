// swift-tools-version: 5.9

import PackageDescription

let package = Package(
    name: "MermaidSpellsSwift",
    platforms: [
        .macOS(.v14),
        .iOS(.v17)
    ],
    products: [
        .executable(name: "MermaidSpellsNative", targets: ["MermaidSpellsNative"])
    ],
    targets: [
        .executableTarget(name: "MermaidSpellsNative"),
        .testTarget(
            name: "MermaidSpellsNativeTests",
            dependencies: ["MermaidSpellsNative"]
        )
    ]
)
