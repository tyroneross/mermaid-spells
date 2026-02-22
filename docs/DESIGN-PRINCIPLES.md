# Design Principles

## Core Philosophy

**The app is a private, safe space where a child practices without anyone watching.**

Every design decision must pass this test: _Does this make the child feel safe, autonomous, and competent?_

---

## The 10 Rules

### 1. Private by Default
No observer mode. No "share your score" prompts. No screenshots of results. The child practices alone with their mermaid friend. If a parent wants to see progress, they access it through a completely separate interface that the child never encounters.

**Research basis**: Performance anxiety is neurological (amygdala-triggered freeze response). Removing observation pressure allows children to access knowledge they already have. _(See RESEARCH.md, Section 3)_

### 2. No Failure States
Wrong answers are handled gently: mermaid shows an "ooh" face, the correct answer is revealed warmly, and the next letter appears. No red X marks. No "try again" messages. No sound effects that signal failure (the prototype's gentle wrong-answer tone is acceptable — it's soft and non-punitive).

**Research basis**: Mastery experiences build self-efficacy. Every "failure" experience erodes a child's belief that they can succeed. _(Bandura, Self-Efficacy Theory)_

### 3. No Timers
Zero countdowns anywhere in the app. The child taps when they're ready. Between letters, the mermaid floats peacefully underwater — no urgency signals. The only time reference is a gentle stopping suggestion after ~15 letters.

**Research basis**: Countdowns amplify impulsivity and anxiety in ADHD children. Flexible pacing produces better learning outcomes. _(See RESEARCH.md, Section 2)_

### 4. No Visible Scores
The child never sees "3/10" or "you got 7 right!" Progress is tracked silently in the database for the spaced repetition algorithm. The progress bar from the prototype should be removed or made extremely subtle (ambient, not informational).

**Research basis**: Visible scoring creates evaluation pressure, triggers performance anxiety, and shifts motivation from intrinsic to extrinsic. _(See RESEARCH.md, Sections 3 & 6)_

### 5. Micro-Celebrations Every 20-30 Seconds
Every letter attempt triggers multiple feedback events: haptic tap on selection, sound effect, mermaid animation, word reveal. This creates a continuous stream of micro-dopamine hits that sustain ADHD attention.

**Research basis**: ADHD brains have lower baseline dopamine. Frequent reinforcement every 20-30 seconds maintains engagement. _(See RESEARCH.md, Section 2)_

### 6. Natural Session Length (5-7 Minutes)
After approximately 15 letters (~6 minutes), the mermaid says something like "Great swimming today!" and offers a natural stopping point. The child CAN continue, but the suggestion normalizes stopping. No "just one more!" pressure.

**Research basis**: Attention degrades rapidly after 7 minutes in ADHD children. Short, complete sessions feel more rewarding than long, exhausting ones. _(See RESEARCH.md, Section 2)_

### 7. Narrative Framing
The child is "helping the mermaid learn her spells," not "practicing letters." Each letter is a spell, not a test question. Mastering all 26 makes the mermaid a "Spell Master." This reframes learning as adventure.

**Research basis**: Narrative engagement creates psychological flow. Storytelling provides "imaginary, unrestricted space" for exploration without judgment. _(Csikszentmihalyi; See RESEARCH.md, Section 3)_

### 8. Child Autonomy
The child chooses when to play, when to stop, and (in later phases) which letters to practice. Every interaction is child-initiated. The app never pushes notifications, never says "come back tomorrow," never implies the child should be doing more.

**Research basis**: Autonomy is one of three core drivers of intrinsic motivation (alongside competence and relatedness). _(Ryan & Deci, Self-Determination Theory)_

### 9. Effort-Based Praise
Celebration messages praise the attempt, not the outcome:
- "You traced so carefully!" (not "Perfect score!")
- "What great swimming!" (not "10/10!")
- "The mermaid loved that!" (not "Correct!")

**Research basis**: Effort praise promotes growth mindset and persistence. Outcome praise promotes fixed mindset and avoidance of challenge. _(Dweck, Growth Mindset Theory)_

### 10. Sensory Options
Sound, haptics, and speech are all independently toggleable. Some children are sensory-seeking (want all stimuli). Some are sensory-avoidant (want visual only). The app respects both without judgment.

**Research basis**: Multi-sensory learning is powerful but must be optional. Forced sensory input can overwhelm, especially for neurodivergent children. _(See RESEARCH.md, Section 5)_

---

## Visual Design Rules (Calm Precision Alignment)

### Content Dominance
- Tracing canvas or letter display occupies 70%+ of screen
- Only 3 cognitive elements visible at once: letter, choices, mermaid
- No navigation bars, headers, footers, or settings icons in the play area

### Touch Targets
- All tappable elements: minimum 60x80 points (exceeds iOS 44x44 guideline)
- Only two gestures used: tap and pan (no pinch, no swipe, no long-press)
- Large hit zones compensate for developing fine motor control

### Spacing & Rhythm
- 8pt grid throughout
- Consistent padding between choice buttons
- Predictable transition timing (all animations 200-400ms)
- No jarring layout shifts between letters

### Color
- Underwater gradient background (deep blue to teal) — calming
- High contrast letter display (dark on white card)
- Emoji/pictures are the color — UI chrome is muted
- No red for "wrong" — use soft pink or just neutral fade

### Typography
- Cursive letters: Kalam font or custom cursive at 100-140pt (large, clear)
- Instructional text (minimal): 14px, medium weight
- Word labels: 12-14px, bold when revealed
- All text is optional/ambient — the app works with images and sounds alone

---

## What We Don't Do

| Anti-Pattern | Why Not | What Instead |
|-------------|---------|--------------|
| Leaderboards | Creates comparison anxiety | Private progress only |
| Daily streaks | Creates obligation, not joy | Session-based natural pacing |
| "Wrong answer" sound effects | Signals failure, triggers shame | Gentle tone + correct answer reveal |
| Stars/coins/gems | Extrinsic rewards undermine intrinsic motivation | Mermaid's joy is the reward |
| "Share with friends" | Violates privacy-first principle | Nothing to share |
| Push notifications | "Come back!" pressure creates obligation | Child plays when they want |
| Countdown timers | Amplifies ADHD impulsivity | Infinite time per question |
| Difficulty labels visible to child | "Easy/Hard" creates self-judgment | Difficulty adjusts silently |
| Parent-visible progress in child UI | Creates surveillance feeling | Separate parent access point |
