import Foundation

enum LearningItemKind: String, Codable, CaseIterable {
    case letter
    case phonogram
    case word
}

enum LearningStage: String, Codable, CaseIterable {
    case letter
    case phonogramOne
    case phonogramTwo
    case phonogramThree
    case phonogramFour
    case wordOne
    case wordPhonogram
    case extensionStage

    var isExtension: Bool {
        self == .extensionStage
    }
}

struct LearningItem: Identifiable, Hashable, Codable {
    let id: String
    let kind: LearningItemKind
    let display: String
    let soundLabel: String
    let spokenPrompt: String
    let exampleWords: [String]
    let prerequisites: [String]
    let stage: LearningStage
    let assetKey: String
    let symbol: String
}
