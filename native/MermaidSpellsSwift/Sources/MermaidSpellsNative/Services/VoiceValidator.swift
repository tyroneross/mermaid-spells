import Foundation

struct VoiceValidationResult: Equatable {
    let matched: Bool
    let confidence: Double
}

enum VoiceValidator {
    static func validate(transcript: String, target: LearningItem) -> VoiceValidationResult {
        let normalizedTranscript = normalize(transcript)
        let targets = candidateTargets(for: target)

        if targets.contains(normalizedTranscript) {
            return VoiceValidationResult(matched: true, confidence: 1.0)
        }

        let partialMatch = targets.contains { candidate in
            normalizedTranscript.contains(candidate) || candidate.contains(normalizedTranscript)
        }

        return VoiceValidationResult(
            matched: partialMatch,
            confidence: partialMatch ? 0.72 : 0.0
        )
    }

    private static func candidateTargets(for item: LearningItem) -> Set<String> {
        var candidates = Set<String>()
        candidates.insert(item.display)
        candidates.insert(item.soundLabel.replacingOccurrences(of: "/", with: ""))
        item.exampleWords.forEach { candidates.insert($0) }
        return Set(candidates.map(normalize))
    }

    private static func normalize(_ value: String) -> String {
        value
            .lowercased()
            .replacingOccurrences(of: "/", with: "")
            .replacingOccurrences(of: " ", with: "")
            .trimmingCharacters(in: .whitespacesAndNewlines)
    }
}
