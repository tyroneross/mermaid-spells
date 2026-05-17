import SwiftUI

struct GameView: View {
    @State private var progress: [String: LearningProgress] = [:]
    @State private var sessionNumber = 1
    @State private var queue = SessionBuilder.buildSessionQueue(progress: [:], sessionNumber: 1)
    @State private var roundIndex = 0
    @State private var options: [LearningItem] = []
    @State private var feedback: RoundFeedback?
    @State private var voiceTranscript = ""

    private var currentItem: LearningItem {
        queue.isEmpty ? LearningData.letterItems[0] : queue[roundIndex]
    }

    private var progressLabel: String {
        "\(roundIndex + 1) of \(queue.count)"
    }

    var body: some View {
        GeometryReader { geometry in
            let isCompact = geometry.size.width < 620

            ZStack {
                OceanBackdrop()

                ScrollView {
                    VStack(spacing: 18) {
                        HeaderView(sessionNumber: sessionNumber, progressLabel: progressLabel)
                        SpellCard(item: currentItem, isCompact: isCompact)
                        ChoiceGrid(
                            options: options,
                            selectedId: feedback?.selectedId,
                            correctId: currentItem.id,
                            isLocked: feedback != nil,
                            isCompact: isCompact,
                            onSelect: choose
                        )
                        VoicePracticeCard(
                            item: currentItem,
                            transcript: $voiceTranscript,
                            result: feedback?.voiceResult,
                            onCheck: checkVoice
                        )
                        FooterAction(feedback: feedback, onContinue: continueRound)
                    }
                    .frame(maxWidth: 820)
                    .padding(.horizontal, isCompact ? 18 : 30)
                    .padding(.vertical, 24)
                    .frame(maxWidth: .infinity)
                }
            }
        }
        .onAppear(perform: rebuildOptions)
    }

    private func choose(_ item: LearningItem) {
        guard feedback == nil else {
            return
        }

        let matched = item.id == currentItem.id
        MasteryEngine.recordAttempt(
            progress: &progress,
            itemId: currentItem.id,
            matched: matched,
            sessionNumber: sessionNumber
        )

        feedback = RoundFeedback(
            matched: matched,
            selectedId: item.id,
            voiceResult: nil
        )
    }

    private func checkVoice() {
        let result = VoiceValidator.validate(transcript: voiceTranscript, target: currentItem)
        feedback = RoundFeedback(
            matched: result.matched,
            selectedId: feedback?.selectedId,
            voiceResult: result
        )
    }

    private func continueRound() {
        if roundIndex + 1 >= queue.count {
            sessionNumber += 1
            queue = SessionBuilder.buildSessionQueue(
                progress: progress,
                sessionNumber: sessionNumber
            )
            roundIndex = 0
        } else {
            roundIndex += 1
        }

        feedback = nil
        voiceTranscript = ""
        rebuildOptions()
    }

    private func rebuildOptions() {
        let eligible = SessionBuilder.getEligibleLearningItems(progress: progress)
        let pool = eligible.count >= 4 ? eligible : LearningData.letterItems
        let distractors = LearningData.distractorItems(
            correctId: currentItem.id,
            count: 3,
            pool: pool
        )
        options = ([currentItem] + distractors).shuffled()
    }
}

private struct RoundFeedback {
    let matched: Bool
    let selectedId: String?
    let voiceResult: VoiceValidationResult?
}

private struct OceanBackdrop: View {
    var body: some View {
        LinearGradient(
            colors: [
                Color(red: 0.03, green: 0.37, blue: 0.53),
                Color(red: 0.07, green: 0.62, blue: 0.67),
                Color(red: 0.75, green: 0.92, blue: 0.86)
            ],
            startPoint: .top,
            endPoint: .bottom
        )
        .ignoresSafeArea()
    }
}

private struct HeaderView: View {
    let sessionNumber: Int
    let progressLabel: String

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text("Mermaid Spells")
                    .font(.system(size: 30, weight: .bold, design: .rounded))
                    .foregroundStyle(.white)
                Text("Session \(sessionNumber)")
                    .font(.system(size: 16, weight: .semibold, design: .rounded))
                    .foregroundStyle(.white.opacity(0.84))
            }

            Spacer()

            Text(progressLabel)
                .font(.system(size: 16, weight: .bold, design: .rounded))
                .foregroundStyle(Color(red: 0.02, green: 0.24, blue: 0.34))
                .padding(.horizontal, 16)
                .padding(.vertical, 10)
                .background(.white.opacity(0.86), in: Capsule())
        }
    }
}

private struct SpellCard: View {
    let item: LearningItem
    let isCompact: Bool

    var body: some View {
        VStack(spacing: 12) {
            Text(item.symbol)
                .font(.system(size: isCompact ? 62 : 76))
                .frame(height: isCompact ? 76 : 92)

            Text(item.display)
                .font(.custom("Snell Roundhand", size: isCompact ? 118 : 148))
                .minimumScaleFactor(0.72)
                .lineLimit(1)
                .foregroundStyle(Color(red: 0.02, green: 0.2, blue: 0.32))
                .frame(height: isCompact ? 126 : 158)

            Text(item.spokenPrompt)
                .font(.system(size: 22, weight: .bold, design: .rounded))
                .foregroundStyle(Color(red: 0.05, green: 0.28, blue: 0.38))
                .multilineTextAlignment(.center)

            Text("as in \(item.exampleWords.joined(separator: ", "))")
                .font(.system(size: 18, weight: .medium, design: .rounded))
                .foregroundStyle(Color(red: 0.17, green: 0.39, blue: 0.45))
        }
        .padding(isCompact ? 20 : 28)
        .frame(maxWidth: .infinity)
        .background(.white.opacity(0.9), in: RoundedRectangle(cornerRadius: 20, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .stroke(.white.opacity(0.66), lineWidth: 2)
        )
    }
}

private struct ChoiceGrid: View {
    let options: [LearningItem]
    let selectedId: String?
    let correctId: String
    let isLocked: Bool
    let isCompact: Bool
    let onSelect: (LearningItem) -> Void

    private var columns: [GridItem] {
        Array(
            repeating: GridItem(.flexible(), spacing: 14),
            count: isCompact ? 1 : 2
        )
    }

    var body: some View {
        LazyVGrid(columns: columns, spacing: 14) {
            ForEach(options) { item in
                Button {
                    onSelect(item)
                } label: {
                    HStack(spacing: 14) {
                        Text(item.symbol)
                            .font(.system(size: 34))
                            .frame(width: 44, height: 44)

                        VStack(alignment: .leading, spacing: 2) {
                            Text(item.display)
                                .font(.custom("Snell Roundhand", size: 42))
                                .lineLimit(1)
                                .minimumScaleFactor(0.72)
                            Text(item.soundLabel)
                                .font(.system(size: 17, weight: .semibold, design: .rounded))
                        }

                        Spacer()
                    }
                    .foregroundStyle(Color(red: 0.02, green: 0.2, blue: 0.32))
                    .padding(16)
                    .frame(minHeight: 82)
                    .background(background(for: item), in: RoundedRectangle(cornerRadius: 16, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: 16, style: .continuous)
                            .stroke(border(for: item), lineWidth: 3)
                    )
                }
                .buttonStyle(.plain)
                .disabled(isLocked)
            }
        }
    }

    private func background(for item: LearningItem) -> Color {
        guard let selectedId else {
            return .white.opacity(0.86)
        }

        if item.id == correctId {
            return Color(red: 0.72, green: 0.95, blue: 0.79)
        }

        if item.id == selectedId {
            return Color(red: 1.0, green: 0.84, blue: 0.78)
        }

        return .white.opacity(0.64)
    }

    private func border(for item: LearningItem) -> Color {
        if selectedId == nil {
            return .white.opacity(0.42)
        }

        if item.id == correctId {
            return Color(red: 0.04, green: 0.55, blue: 0.23)
        }

        if item.id == selectedId {
            return Color(red: 0.88, green: 0.31, blue: 0.2)
        }

        return .clear
    }
}

private struct VoicePracticeCard: View {
    let item: LearningItem
    @Binding var transcript: String
    let result: VoiceValidationResult?
    let onCheck: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text("Say \(item.soundLabel)")
                    .font(.system(size: 20, weight: .bold, design: .rounded))
                Spacer()
                resultLabel
            }
            TextField("voice transcript", text: $transcript)
                .textFieldStyle(.roundedBorder)
            Button("Check voice", action: onCheck)
                .font(.system(size: 17, weight: .bold, design: .rounded))
                .buttonStyle(.borderedProminent)
                .disabled(transcript.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
        }
        .padding(18)
        .frame(maxWidth: .infinity)
        .background(.white.opacity(0.84), in: RoundedRectangle(cornerRadius: 16, style: .continuous))
    }

    @ViewBuilder
    private var resultLabel: some View {
        if let result {
            Text(result.matched ? "matched" : "try again")
                .font(.system(size: 14, weight: .bold, design: .rounded))
                .foregroundStyle(result.matched ? .green : .orange)
        }
    }
}

private struct FooterAction: View {
    let feedback: RoundFeedback?
    let onContinue: () -> Void

    var body: some View {
        HStack {
            if let feedback {
                Text(feedback.matched ? "That is the spell." : "Look again at the shape.")
                    .font(.system(size: 20, weight: .bold, design: .rounded))
                    .foregroundStyle(.white)
                Spacer()
                Button("Next", action: onContinue)
                    .font(.system(size: 18, weight: .bold, design: .rounded))
                    .buttonStyle(.borderedProminent)
                    .tint(Color(red: 0.02, green: 0.3, blue: 0.45))
            } else {
                Text("Choose the matching spell.")
                    .font(.system(size: 20, weight: .bold, design: .rounded))
                    .foregroundStyle(.white)
                Spacer()
            }
        }
        .frame(minHeight: 48)
    }
}
