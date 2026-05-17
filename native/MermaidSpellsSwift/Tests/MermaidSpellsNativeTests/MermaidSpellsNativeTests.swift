import XCTest
@testable import MermaidSpellsNative

final class MermaidSpellsNativeTests: XCTestCase {
    func testInitialSessionUsesLowercaseMontessoriStart() {
        let eligible = SessionBuilder.getEligibleLearningItems(progress: [:])
        let firstDisplays = eligible.prefix(6).map(\.display)

        XCTAssertEqual(firstDisplays, ["s", "m", "a", "t", "c", "r"])
        XCTAssertTrue(eligible.allSatisfy { $0.display == $0.display.lowercased() })
    }

    func testPhonogramUnlockRequiresReadyPrerequisites() {
        var progress: [String: LearningProgress] = [:]
        MasteryEngine.recordAttempt(progress: &progress, itemId: "letter:s", matched: true, sessionNumber: 1)
        MasteryEngine.recordAttempt(progress: &progress, itemId: "letter:s", matched: true, sessionNumber: 1)
        MasteryEngine.recordAttempt(progress: &progress, itemId: "letter:h", matched: true, sessionNumber: 1)
        MasteryEngine.recordAttempt(progress: &progress, itemId: "letter:h", matched: true, sessionNumber: 1)

        let eligibleIds = Set(SessionBuilder.getEligibleLearningItems(progress: progress).map(\.id))
        XCTAssertTrue(eligibleIds.contains("phonogram:sh"))
        XCTAssertFalse(eligibleIds.contains("phonogram:our"))
    }

    func testVoiceValidatorAcceptsSoundAndExampleWord() throws {
        let sh = try XCTUnwrap(LearningData.item(id: "phonogram:sh"))

        XCTAssertTrue(VoiceValidator.validate(transcript: "sh", target: sh).matched)
        XCTAssertTrue(VoiceValidator.validate(transcript: "ship", target: sh).matched)
        XCTAssertFalse(VoiceValidator.validate(transcript: "moon", target: sh).matched)
    }
}
