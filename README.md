# Mermaid Spells

**Secret underwater letter magic** — A cursive letter learning app for Montessori children ages 4-5.

## What Is This?

Mermaid Spells is a mobile app where children practice cursive letters in a private, pressure-free underwater world with a friendly mermaid companion. No scores. No timers. No failure states. Just a child and their mermaid friend, learning letter magic together.

## Origin

Built as a quick restaurant game for a 4-year-old Montessori student who loved mermaids. She played it enthusiastically — picking emoji pictures that matched cursive letters while a mermaid danced on screen. That engagement sparked the idea for a full learning app grounded in educational research.

## Who It's For

- **Primary**: 4-5 year old Montessori students learning cursive (Montessori teaches cursive before print)
- **Secondary**: Children with ADHD who need short, dopamine-rich learning loops
- **Tertiary**: Children with performance anxiety who thrive in private, low-stakes practice

## Project Structure

```
mermaid-spells/
  docs/
    VISION.md              Why this app exists
    RESEARCH.md            Educational science & how we apply it
    ARCHITECTURE.md        Tech stack & system design
    FEATURES.md            Phased feature roadmap
    DESIGN-PRINCIPLES.md   ADHD + anxiety-safe UX rules
    DECISIONS.md           Architecture Decision Records
  prototype/
    CursiveLetterGame.jsx  Original restaurant prototype
  assets/
    reference/             Mermaid character reference images
```

## Tech Stack (Planned)

- **Expo** (React Native) — managed builds, OTA updates
- **React Native Skia** — GPU-accelerated underwater animations
- **Reanimated 4** + **Gesture Handler** — fluid letter tracing
- **Expo SQLite** — offline-first progress tracking
- **Zustand** — simple state management
- **Expo Haptics** + **Expo Speech** — multi-sensory feedback

## Design Philosophy

Every design decision flows from one insight: **the app is a private, safe space where a child practices without anyone watching**. This means:

1. No visible scores (progress tracked silently)
2. No failure states (wrong answers handled gently)
3. No timers (child controls pace)
4. Effort-based praise ("You traced so carefully!")
5. Narrative framing ("Help the mermaid learn her spells!")

See [docs/DESIGN-PRINCIPLES.md](docs/DESIGN-PRINCIPLES.md) for the full framework.

## Getting Started

_App development hasn't started yet. This repo currently contains research, architecture decisions, and the original prototype._

```bash
# Future: Initialize Expo project
npx create-expo-app MermaidSpells
```
