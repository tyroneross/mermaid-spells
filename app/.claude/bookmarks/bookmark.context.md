# Mermaid Spells — Session Summary

## What Was Done

### Montessori Pedagogy Integration (`app/constants/letterData.ts`)
- Added `MONTESSORI_ORDER` array — letters in phonetic groups (s,m,a,t → c,r,i,p → b,f,o,g → d,h,e,l → j,k,n,u → q,v,w,x,y,z)
- Added `phonetic` field to all 26 letter entries (e.g., `/s/` for "s", `/k/` for "c")
- Restructured LEVELS to follow phonetic groups:
  - Level 1 "Tide Pool" — 8 letters, 2 choices (Groups 1-2)
  - Level 2 "Coral Garden" — 8 letters, 3 choices (Groups 3-4)
  - Level 3 "Deep Ocean" — 10 letters, 4 choices (Groups 5-6)
- Letters shuffled within each level's group, but group ordering is pedagogically meaningful

### Mermaid SVG Redesign (`app/components/Mermaid.tsx`)
- Replaced afro with **locs hairstyle** — 10 bezier-curve loc paths with colorful beads at tips
- Added **white headband** across top of head
- Replaced shell bikini with **pink long-sleeve top** with fabric fold detail and sleeves
- **Larger warm brown eyes** (iris #5D3A1A, rx 7/ry 6) with double highlight dots
- **U-shaped brick-pattern scales** on tail (5 rows, staggered)
- **Detailed fins** with 3 vein lines per fin, slightly larger
- All animation hooks preserved (dancing, idle float, sparkles, tail colors)

### Game Flow Redesign (`app/App.tsx`)
- **Three-phase round flow**: intro → match → feedback
- **Intro phase**: Shows large letter + phonetic sound + word/emoji ("This is /s/, like sun"), tap to continue
- **Match phase**: Phonetic-focused prompt ("Find the /s/ sound"), no word labels on buttons until revealed
- **Feedback (correct)**: Mermaid dances, celebration text, self-paced "Next" button (no auto-timer)
- **Feedback (wrong)**: Gentle — no shake animation, no red colors, no error sound. Shows correct answer calmly, "Try Again" loops back to intro for reinforcement
- **Kept gamification**: Stars, streak fire (3+), celebration praise — fun and encouraging
- **Self-paced**: All advancement via tap, no auto-timers
- **Queue**: Built from `MONTESSORI_ORDER` with shuffle within each level's phonetic group
- Removed: shake animation, `playWrong()`, error haptic, red borders on wrong answer

## User Preferences Noted
- Keep gamification — fun and encouraging, some gamification is helpful
- Optimize for ADHD kids — learn while having fun, but mostly learn
- Open to better visual format than SVG (Rive, Skia, Lottie, sprites) — not yet implemented
- Build from scratch preference

## Files Modified
- `app/constants/letterData.ts`
- `app/components/Mermaid.tsx`
- `app/App.tsx`

## Open Items
- Mermaid visual format upgrade (SVG → Rive/Skia/Lottie) — user interested but not yet decided
- Sound engine still stubbed (`useSoundEngine.ts`)
- TypeScript compiles clean, app launched on iPhone 17 Pro simulator
