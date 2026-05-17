import Foundation

enum LearningData {
    static let montessoriOrder = [
        "s", "m", "a", "t",
        "c", "r", "i", "p",
        "b", "f", "o", "g",
        "d", "h", "e", "l",
        "j", "k", "n", "u",
        "q", "v", "w", "x", "y", "z"
    ]

    private static let letterSeeds: [String: (word: String, symbol: String, phonetic: String)] = [
        "a": ("apple", "🍎", "/a/"),
        "b": ("ball", "⚽", "/b/"),
        "c": ("cat", "🐱", "/k/"),
        "d": ("dog", "🐶", "/d/"),
        "e": ("elephant", "🐘", "/e/"),
        "f": ("fish", "🐟", "/f/"),
        "g": ("goat", "🐐", "/g/"),
        "h": ("hat", "🎩", "/h/"),
        "i": ("igloo", "🏠", "/i/"),
        "j": ("jellyfish", "🪼", "/j/"),
        "k": ("kite", "🪁", "/k/"),
        "l": ("lion", "🦁", "/l/"),
        "m": ("moon", "🌙", "/m/"),
        "n": ("nest", "🪺", "/n/"),
        "o": ("octopus", "🐙", "/o/"),
        "p": ("pig", "🐷", "/p/"),
        "q": ("queen", "👑", "/kw/"),
        "r": ("rainbow", "🌈", "/r/"),
        "s": ("sun", "☀️", "/s/"),
        "t": ("tree", "🌳", "/t/"),
        "u": ("umbrella", "☂️", "/u/"),
        "v": ("violin", "🎻", "/v/"),
        "w": ("whale", "🐳", "/w/"),
        "x": ("fox", "🦊", "/ks/"),
        "y": ("yarn", "🧶", "/y/"),
        "z": ("zebra", "🦓", "/z/")
    ]

    static let letterItems: [LearningItem] = montessoriOrder.compactMap { letter in
        guard let seed = letterSeeds[letter] else {
            return nil
        }

        return LearningItem(
            id: "letter:\(letter)",
            kind: .letter,
            display: letter,
            soundLabel: seed.phonetic,
            spokenPrompt: "This spell says \(seed.phonetic)",
            exampleWords: [seed.word],
            prerequisites: [],
            stage: .letter,
            assetKey: seed.word,
            symbol: seed.symbol
        )
    }

    static let phonogramItems: [LearningItem] = [
        LearningItem(id: "phonogram:sh", kind: .phonogram, display: "sh", soundLabel: "/sh/", spokenPrompt: "This spell says /sh/", exampleWords: ["ship", "shell"], prerequisites: ["letter:s", "letter:h"], stage: .phonogramOne, assetKey: "ship", symbol: "🚢"),
        LearningItem(id: "phonogram:ch", kind: .phonogram, display: "ch", soundLabel: "/ch/", spokenPrompt: "This spell says /ch/", exampleWords: ["chair", "chat"], prerequisites: ["letter:c", "letter:h"], stage: .phonogramOne, assetKey: "chair", symbol: "🪑"),
        LearningItem(id: "phonogram:th", kind: .phonogram, display: "th", soundLabel: "/th/", spokenPrompt: "This spell says /th/", exampleWords: ["thumb", "thin"], prerequisites: ["letter:t", "letter:h"], stage: .phonogramOne, assetKey: "thumb", symbol: "👍"),
        LearningItem(id: "phonogram:qu", kind: .phonogram, display: "qu", soundLabel: "/kw/", spokenPrompt: "This spell says /kw/", exampleWords: ["queen", "quail"], prerequisites: ["letter:q", "letter:u"], stage: .phonogramOne, assetKey: "queen", symbol: "👑"),
        LearningItem(id: "phonogram:ai", kind: .phonogram, display: "ai", soundLabel: "/ai/", spokenPrompt: "This spell says /ai/", exampleWords: ["rain", "sail"], prerequisites: ["letter:a", "letter:i"], stage: .phonogramTwo, assetKey: "rain", symbol: "🌧️"),
        LearningItem(id: "phonogram:ee", kind: .phonogram, display: "ee", soundLabel: "/ee/", spokenPrompt: "This spell says /ee/", exampleWords: ["bee", "seed"], prerequisites: ["letter:e"], stage: .phonogramTwo, assetKey: "bee", symbol: "🐝"),
        LearningItem(id: "phonogram:oa", kind: .phonogram, display: "oa", soundLabel: "/oa/", spokenPrompt: "This spell says /oa/", exampleWords: ["boat", "goat"], prerequisites: ["letter:o", "letter:a"], stage: .phonogramTwo, assetKey: "boat", symbol: "⛵"),
        LearningItem(id: "phonogram:ar", kind: .phonogram, display: "ar", soundLabel: "/ar/", spokenPrompt: "This spell says /ar/", exampleWords: ["car", "star"], prerequisites: ["letter:a", "letter:r"], stage: .phonogramThree, assetKey: "car", symbol: "🚗"),
        LearningItem(id: "phonogram:or", kind: .phonogram, display: "or", soundLabel: "/or/", spokenPrompt: "This spell says /or/", exampleWords: ["horn", "fork"], prerequisites: ["letter:o", "letter:r"], stage: .phonogramThree, assetKey: "horn", symbol: "📯"),
        LearningItem(id: "phonogram:er", kind: .phonogram, display: "er", soundLabel: "/er/", spokenPrompt: "This spell says /er/", exampleWords: ["fern", "her"], prerequisites: ["letter:e", "letter:r"], stage: .phonogramThree, assetKey: "fern", symbol: "🌿"),
        LearningItem(id: "phonogram:au", kind: .phonogram, display: "au", soundLabel: "/aw/", spokenPrompt: "This spell says /aw/", exampleWords: ["haul", "pause"], prerequisites: ["letter:a", "letter:u"], stage: .phonogramFour, assetKey: "shell", symbol: "🐚"),
        LearningItem(id: "phonogram:oo", kind: .phonogram, display: "oo", soundLabel: "/oo/", spokenPrompt: "This spell says /oo/", exampleWords: ["moon", "pool"], prerequisites: ["letter:o"], stage: .phonogramFour, assetKey: "moon", symbol: "🌙"),
        LearningItem(id: "phonogram:ue", kind: .phonogram, display: "ue", soundLabel: "/ue/", spokenPrompt: "This spell says /ue/", exampleWords: ["blue", "glue"], prerequisites: ["letter:u", "letter:e"], stage: .phonogramFour, assetKey: "blue", symbol: "🔵"),
        LearningItem(id: "phonogram:ie", kind: .phonogram, display: "ie", soundLabel: "/ie/", spokenPrompt: "This spell says /ie/", exampleWords: ["pie", "tie"], prerequisites: ["letter:i", "letter:e"], stage: .phonogramFour, assetKey: "pie", symbol: "🥧"),
        LearningItem(id: "phonogram:oy", kind: .phonogram, display: "oy", soundLabel: "/oy/", spokenPrompt: "This spell says /oy/", exampleWords: ["toy", "oyster"], prerequisites: ["letter:o", "letter:y"], stage: .phonogramFour, assetKey: "toy", symbol: "🧸"),
        LearningItem(id: "phonogram:ou", kind: .phonogram, display: "ou", soundLabel: "/ou/", spokenPrompt: "This spell says /ou/", exampleWords: ["cloud", "out"], prerequisites: ["letter:o", "letter:u"], stage: .phonogramFour, assetKey: "cloud", symbol: "☁️"),
        LearningItem(id: "phonogram:our", kind: .phonogram, display: "our", soundLabel: "/our/", spokenPrompt: "This later spell says /our/", exampleWords: ["four", "pour"], prerequisites: ["phonogram:ou", "letter:r"], stage: .extensionStage, assetKey: "four", symbol: "4️⃣")
    ]

    static let firstWordItems: [LearningItem] = [
        LearningItem(id: "word:am", kind: .word, display: "am", soundLabel: "am", spokenPrompt: "Blend the sounds for am", exampleWords: ["am"], prerequisites: ["letter:a", "letter:m"], stage: .wordOne, assetKey: "am", symbol: "🌊"),
        LearningItem(id: "word:sat", kind: .word, display: "sat", soundLabel: "sat", spokenPrompt: "Blend the sounds for sat", exampleWords: ["sat"], prerequisites: ["letter:s", "letter:a", "letter:t"], stage: .wordOne, assetKey: "sat", symbol: "🪨"),
        LearningItem(id: "word:mat", kind: .word, display: "mat", soundLabel: "mat", spokenPrompt: "Blend the sounds for mat", exampleWords: ["mat"], prerequisites: ["letter:m", "letter:a", "letter:t"], stage: .wordOne, assetKey: "mat", symbol: "🧺"),
        LearningItem(id: "word:cat", kind: .word, display: "cat", soundLabel: "cat", spokenPrompt: "Blend the sounds for cat", exampleWords: ["cat"], prerequisites: ["letter:c", "letter:a", "letter:t"], stage: .wordOne, assetKey: "cat", symbol: "🐱"),
        LearningItem(id: "word:ship", kind: .word, display: "ship", soundLabel: "ship", spokenPrompt: "Blend the sounds for ship", exampleWords: ["ship"], prerequisites: ["phonogram:sh", "letter:i", "letter:p"], stage: .wordPhonogram, assetKey: "ship", symbol: "🚢"),
        LearningItem(id: "word:chat", kind: .word, display: "chat", soundLabel: "chat", spokenPrompt: "Blend the sounds for chat", exampleWords: ["chat"], prerequisites: ["phonogram:ch", "letter:a", "letter:t"], stage: .wordPhonogram, assetKey: "chat", symbol: "💬"),
        LearningItem(id: "word:rain", kind: .word, display: "rain", soundLabel: "rain", spokenPrompt: "Blend the sounds for rain", exampleWords: ["rain"], prerequisites: ["letter:r", "phonogram:ai", "letter:n"], stage: .wordPhonogram, assetKey: "rain", symbol: "🌧️"),
        LearningItem(id: "word:moon", kind: .word, display: "moon", soundLabel: "moon", spokenPrompt: "Blend the sounds for moon", exampleWords: ["moon"], prerequisites: ["letter:m", "phonogram:oo", "letter:n"], stage: .wordPhonogram, assetKey: "moon", symbol: "🌙")
    ]

    static let allItems = letterItems + phonogramItems + firstWordItems
    static let itemsById = Dictionary(uniqueKeysWithValues: allItems.map { ($0.id, $0) })

    static func item(id: String) -> LearningItem? {
        itemsById[id]
    }

    static func distractorItems(correctId: String, count: Int, pool: [LearningItem]) -> [LearningItem] {
        Array(pool.filter { $0.id != correctId }.shuffled().prefix(count))
    }
}
