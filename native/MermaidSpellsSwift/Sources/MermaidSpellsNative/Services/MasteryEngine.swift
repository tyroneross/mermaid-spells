import Foundation

struct LearningProgress: Codable, Equatable {
    var box: Int
    var attempts: Int
    var successes: Int
    var lastSeenSession: Int
    var introducedAtSession: Int
}

enum MasteryEngine {
    static func createNewProgress(sessionNumber: Int) -> LearningProgress {
        LearningProgress(
            box: 1,
            attempts: 0,
            successes: 0,
            lastSeenSession: sessionNumber,
            introducedAtSession: sessionNumber
        )
    }

    static func recordAttempt(
        progress: inout [String: LearningProgress],
        itemId: String,
        matched: Bool,
        sessionNumber: Int
    ) {
        var existing = progress[itemId] ?? createNewProgress(sessionNumber: sessionNumber)
        existing.box = matched ? min(4, existing.box + 1) : 1
        existing.attempts += 1
        existing.successes += matched ? 1 : 0
        existing.lastSeenSession = sessionNumber
        progress[itemId] = existing
    }

    static func isReadyForPrerequisite(_ progress: LearningProgress?) -> Bool {
        (progress?.box ?? 0) >= 3
    }
}
