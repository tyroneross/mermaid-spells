# Feature Roadmap

## Phase 1: Core MVP — "The Restaurant Game, But Better"

Preserve everything that worked in the prototype. Add cursive tracing.

### 1.1 Letter Recognition Game (from prototype)
- Show a cursive letter in large format (Kalam font or custom cursive)
- Present 2-4 emoji/word choices
- Child taps the picture that starts with that letter
- Progressive difficulty: 2 choices (rounds 1-7) → 3 choices (8-17) → 4 choices (18-26)
- Mermaid celebrates correct answers, gently encourages on wrong answers
- Sound effects: tap sound, correct arpeggio, wrong gentle tone, celebration fanfare

### 1.2 Cursive Letter Tracing
- Full-screen Skia canvas for finger tracing
- Animated stroke-order guide: dots flow along the letter path showing direction
- Ghost letter in background, child traces over it
- Generous tolerance zone (~15-20pt buffer) for developing fine motor control
- Haptic feedback at stroke endpoints (medium buzz)
- Phoneme pronunciation on trace completion ("mmm... moon!")
- No "accuracy score" — any completed trace is celebrated

### 1.3 Mermaid Companion
- Animated Black mermaid character (evolved from prototype SVG)
- States: idle float, celebration dance, encouragement ("ooh" face), holding emoji
- Gold bead hair accessories, shell top, purple tail (from prototype design)
- Positioned at bottom of screen, never blocking content

### 1.4 Session-Based Spaced Repetition
- Invisible 4-box Leitner system
- Box 1 (New): letter appears 3-5 times per session
- Box 2 (Learning): 1-2 times per session for next 2-3 sessions
- Box 3 (Familiar): once per session for next 5 sessions
- Box 4 (Mastered): once every 3-4 sessions
- Wrong answer moves letter back to Box 1
- Session = ~15 letters, ~5-7 minutes
- Algorithm ensures ~70-85% success rate (desirable difficulty)

### 1.5 Private Practice Mode (default)
- No visible scores, timers, or failure states
- Progress tracked silently in SQLite
- Child controls pacing completely
- Mermaid offers gentle stopping point after ~15 letters: "Great swimming today!"
- Sound and haptic toggles accessible from corner

---

## Phase 2: Engagement — "The Underwater World"

### 2.1 Story Mode
- Each letter learned = new underwater friend unlocked (sea turtle, dolphin, starfish, etc.)
- Simple narrative: "The mermaid is learning magic spells. Each letter is a spell!"
- 26 friends for 26 letters — collection mechanic without grinding

### 2.2 Pearl Collection
- Automatic: every session generates 1-3 pearls (based on participation, not accuracy)
- Pearls unlock mermaid customizations (not gated by performance)
- No pearl store, no purchasing — purely cosmetic, purely earned by showing up

### 2.3 Mermaid Customization
- Unlock hairstyles (afro puffs, braids, locs, twists)
- Tail colors (purple, teal, pink, gold, rainbow)
- Accessories (starfish clips, pearl necklaces, shell crowns)
- Child's mermaid becomes unique — personal connection

### 2.4 Letter-Sound Connection
- Tap any learned letter to hear: phoneme → word → sentence
- Example: tap "m" → "mmm" → "moon" → "The mermaid swims past the moon"
- Builds phonemic awareness alongside letter recognition

### 2.5 Multiple Child Profiles
- Simple profile picker at app launch (mermaid avatars)
- Each child has independent progress, customization, spaced repetition state
- No passwords — just tap your mermaid to start

---

## Phase 3: Advanced — "Deep Sea"

### 3.1 Word Building
- After mastering 8+ letters: combine into simple CVC words
- "c-a-t" → connect cursive letters → reveal word → picture + sound
- Builds on Montessori moveable alphabet concept

### 3.2 Letter Families
- Group letters by stroke pattern for efficient learning:
  - c-family: c, a, d, g, o, q (all start with the "c" stroke)
  - l-family: l, b, f, h, k
  - i-family: i, j, t, u, w
  - r-family: r, n, m, p
  - e-family: e, s, x, z
  - Standalone: v, y

### 3.3 Parent Dashboard (light)
- Accessible from SEPARATE entry point (never visible in child's UI)
- Shows: total practice time, letters in each mastery box, sessions this week
- No grades, no comparisons, no "your child is behind"
- Framing: "Here's what [name] has been exploring"

### 3.4 Uppercase Bridge
- After cursive mastery: introduce print equivalents
- "Your mermaid knows the secret spell for 'a'. Here's how other people write it: A"
- Connects cursive knowledge to environmental print (books, signs)

### 3.5 Multilingual Support
- Spanish cursive (large market, same Latin alphabet)
- Letter-word associations in target language
- Phoneme pronunciation in target language
- Same mermaid, same UX, different language content

---

## Letter Introduction Order

Based on Montessori stroke patterns and frequency in English:

**Wave 1** (simplest strokes): c, o, a, s, m, t
**Wave 2** (building on Wave 1): i, n, e, r, l, d
**Wave 3** (more complex): u, p, g, h, b, f
**Wave 4** (hardest strokes): w, k, v, y, j, q, x, z

Each wave unlocks when 80% of previous wave is in Box 3+.
