import Foundation

enum SessionBuilder {
    static let sessionItemCount = 15
    private static let firstSessionLetterCount = 6
    private static let letterLookahead = 4

    static func getEligibleLearningItems(progress: [String: LearningProgress]) -> [LearningItem] {
        unlockedLetterItems(progress: progress) + unlockedAdvancedItems(progress: progress)
    }

    static func buildSessionQueue(
        progress: [String: LearningProgress],
        sessionNumber: Int,
        count: Int = sessionItemCount
    ) -> [LearningItem] {
        let eligibleItems = getEligibleLearningItems(progress: progress)
        var pool = weightedPool(
            items: eligibleItems,
            progress: progress,
            sessionNumber: sessionNumber
        )

        if pool.isEmpty {
            pool = eligibleItems
        }

        var queue: [LearningItem] = []

        while queue.count < count, !pool.isEmpty {
            let lastId = queue.last?.id
            let candidates = pool.filter { $0.id != lastId }
            guard let next = (candidates.isEmpty ? pool : candidates).randomElement() else {
                break
            }

            queue.append(next)

            if let removeIndex = pool.firstIndex(where: { $0.id == next.id }) {
                pool.remove(at: removeIndex)
            }
        }

        var refill = eligibleItems.shuffled()
        while queue.count < count, !refill.isEmpty {
            let lastId = queue.last?.id
            let next = refill.first { $0.id != lastId } ?? refill[0]
            queue.append(next)
            refill.removeAll { $0.id == next.id }
            if refill.isEmpty {
                refill = eligibleItems.shuffled()
            }
        }

        return queue
    }

    private static func unlockedLetterItems(progress: [String: LearningProgress]) -> [LearningItem] {
        let masteredLetterCount = LearningData.letterItems.filter {
            MasteryEngine.isReadyForPrerequisite(progress[$0.id])
        }.count
        let count = min(
            LearningData.letterItems.count,
            max(firstSessionLetterCount, masteredLetterCount + letterLookahead)
        )
        return Array(LearningData.letterItems.prefix(count))
    }

    private static func unlockedAdvancedItems(progress: [String: LearningProgress]) -> [LearningItem] {
        LearningData.allItems.filter { item in
            guard item.kind != .letter, !item.stage.isExtension else {
                return false
            }
            return item.prerequisites.allSatisfy {
                MasteryEngine.isReadyForPrerequisite(progress[$0])
            }
        }
    }

    private static func itemWeight(
        item: LearningItem,
        progress: [String: LearningProgress],
        sessionNumber: Int
    ) -> Int {
        guard let itemProgress = progress[item.id] else {
            return item.kind == .letter ? 3 : 2
        }

        switch itemProgress.box {
        case 1:
            return 3
        case 2:
            return 2
        case 3:
            return 1
        default:
            return sessionNumber - itemProgress.lastSeenSession >= 3 ? 1 : 0
        }
    }

    private static func weightedPool(
        items: [LearningItem],
        progress: [String: LearningProgress],
        sessionNumber: Int
    ) -> [LearningItem] {
        items.flatMap { item in
            Array(repeating: item, count: itemWeight(
                item: item,
                progress: progress,
                sessionNumber: sessionNumber
            ))
        }
    }
}
