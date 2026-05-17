import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View, type TextStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, ZoomIn } from "react-native-reanimated";

import Bubbles from "../components/Bubbles";
import Mermaid from "../components/Mermaid";
import SeaCreatures from "../components/SeaCreatures";
import SettingsProgressPanel from "../components/SettingsProgressPanel";
import VoicePracticePanel from "../components/VoicePracticePanel";
import { useSoundEngine } from "../hooks/useSoundEngine";
import {
  firstLetterItems,
  getDistractorItems,
  learningItems,
  type LearningItem,
  shuffleItems,
} from "../constants/learningItems";
import {
  buildSessionQueue,
  getEligibleLearningItems,
} from "../services/sessionBuilder";
import { useAppStore } from "../stores/useAppStore";
import { getLearningItemEmoji } from "../constants/visualAssets";

type GameMode = "play" | "sessionDone";
type Phase = "intro" | "match" | "feedback";

interface GameScreenProps {
  childName: string;
}

const KIND_REALMS: Record<LearningItem["kind"], string> = {
  letter: "\u{1F30A} Tide Pool",
  phonogram: "\u{1F41A} Spell Reef",
  word: "\u{1F4D6} Word Cove",
};

function itemEmoji(item: LearningItem): string {
  return getLearningItemEmoji(item);
}

function itemWord(item: LearningItem): string {
  return item.exampleWords[0] ?? item.display;
}

function visualLevel(item: LearningItem): number {
  if (item.kind === "letter") return 0;
  if (item.kind === "phonogram") return 1;
  return 2;
}

function choiceCount(round: number, item: LearningItem): number {
  if (item.kind !== "letter") return 3;
  if (round < 5) return 2;
  if (round < 10) return 3;
  return 4;
}

function promptFor(item: LearningItem): string {
  if (item.kind === "word") {
    return `Find the picture for ${item.display}`;
  }

  return `Find the ${item.soundLabel} spell`;
}

function displayTextSize(item: LearningItem, variant: "intro" | "prompt"): TextStyle {
  const length = item.display.length;

  if (length === 1) {
    return variant === "intro"
      ? { fontSize: 130, lineHeight: 155 }
      : { fontSize: 120, lineHeight: 150 };
  }

  if (length === 2) {
    return variant === "intro"
      ? { fontSize: 108, lineHeight: 132 }
      : { fontSize: 96, lineHeight: 120 };
  }

  if (length === 3) {
    return variant === "intro"
      ? { fontSize: 88, lineHeight: 108 }
      : { fontSize: 78, lineHeight: 100 };
  }

  return variant === "intro"
    ? { fontSize: 72, lineHeight: 92 }
    : { fontSize: 64, lineHeight: 84 };
}

function distractorPoolFor(
  item: LearningItem,
  eligibleItems: LearningItem[]
): LearningItem[] {
  if (item.kind === "letter") {
    return firstLetterItems;
  }

  const sameKindEligible = eligibleItems.filter(
    (candidate) => candidate.kind === item.kind
  );
  if (sameKindEligible.length >= 3) {
    return sameKindEligible;
  }

  return learningItems.filter((candidate) => candidate.kind === item.kind);
}

export default function GameScreen({ childName }: GameScreenProps) {
  const childAge = useAppStore((s) => s.childAge);
  const learningProgress = useAppStore((s) => s.learningProgress);
  const sessionNumber = useAppStore((s) => s.sessionNumber);
  const soundOn = useAppStore((s) => s.soundOn);
  const voicePracticeOn = useAppStore((s) => s.voicePracticeOn);
  const setSoundOn = useAppStore((s) => s.setSoundOn);
  const setVoicePracticeOn = useAppStore((s) => s.setVoicePracticeOn);
  const resetOnboarding = useAppStore((s) => s.resetOnboarding);
  const startNewSession = useAppStore((s) => s.startNewSession);
  const recordLearningAttempt = useAppStore((s) => s.recordLearningAttempt);

  const [sessionQueue, setSessionQueue] = useState(() =>
    buildSessionQueue(learningProgress, sessionNumber)
  );
  const [round, setRound] = useState(0);
  const [options, setOptions] = useState<LearningItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dancing, setDancing] = useState(false);
  const [mode, setMode] = useState<GameMode>("play");
  const [phase, setPhase] = useState<Phase>("intro");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showGreeting, setShowGreeting] = useState(!!childName);

  const eligibleItems = useMemo(
    () => getEligibleLearningItems(learningProgress),
    [learningProgress]
  );
  const currentItem = sessionQueue[round];
  const isMatched = selectedId === currentItem?.id;
  const level = currentItem ? visualLevel(currentItem) : 0;

  const { playCorrect, playWrong, playTap, playCelebration } = useSoundEngine(soundOn);

  useEffect(() => {
    if (!showGreeting) return;
    const t = setTimeout(() => setShowGreeting(false), 2000);
    return () => clearTimeout(t);
  }, [showGreeting]);

  useEffect(() => {
    if (mode === "play") {
      setPhase("intro");
    }
  }, [round, mode]);

  useEffect(() => {
    if (mode !== "play" || phase !== "match" || !currentItem) return;
    const targetChoiceCount = choiceCount(round, currentItem);
    const distractors = getDistractorItems(
      currentItem.id,
      targetChoiceCount - 1,
      distractorPoolFor(currentItem, eligibleItems)
    );
    setOptions(shuffleItems([currentItem, ...distractors]));
  }, [currentItem, eligibleItems, mode, phase, round]);

  const handleIntroTap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    playTap();
    setPhase("match");
  };

  const handlePick = (pick: LearningItem) => {
    if (selectedId || phase !== "match" || !currentItem) return;
    const matched = pick.id === currentItem.id;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    playTap();
    setSelectedId(pick.id);
    recordLearningAttempt(currentItem.id, matched);
    setPhase("feedback");

    if (matched) {
      setDancing(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => playCorrect(), 80);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setTimeout(() => playWrong(), 80);
    }
  };

  const handleNextAfterMatch = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDancing(false);
    setSelectedId(null);

    if (round + 1 >= sessionQueue.length) {
      setMode("sessionDone");
      setTimeout(playCelebration, 150);
      return;
    }

    setRound((r) => r + 1);
  };

  const handleRetryAfterMiss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedId(null);
    setPhase("intro");
  };

  const restart = () => {
    const nextSessionNumber = sessionNumber + 1;
    setSessionQueue(buildSessionQueue(learningProgress, nextSessionNumber));
    startNewSession();
    setRound(0);
    setSelectedId(null);
    setDancing(false);
    setPhase("intro");
    setMode("play");
  };

  if (!currentItem && mode === "play") {
    return (
      <LinearGradient
        colors={["#0B0E2C", "#141852", "#1B3A6B", "#1F6B8A", "#26A69A"]}
        locations={[0, 0.2, 0.45, 0.7, 1]}
        style={styles.shell}
      >
        <Bubbles />
        <SeaCreatures />
        <View style={styles.doneContent}>
          <Mermaid dancing={false} heldEmoji={null} level={0} />
          <Text style={styles.doneTitle}>The mermaid is getting ready.</Text>
        </View>
      </LinearGradient>
    );
  }

  if (mode === "sessionDone") {
    return (
      <LinearGradient
        colors={["#0B0E2C", "#141852", "#1B3A6B", "#1F6B8A", "#26A69A"]}
        locations={[0, 0.2, 0.45, 0.7, 1]}
        style={styles.shell}
      >
        <Bubbles />
        <SeaCreatures />
        <View style={styles.doneContent}>
          <Mermaid dancing heldEmoji={"\u{1F30A}"} level={2} variant="celebration" />
          <Text style={styles.doneTitle}>Great swimming today.</Text>
          <Text style={styles.doneMessage}>
            The mermaid loved practicing secret letter magic with you.
          </Text>
          <Pressable onPress={restart} style={styles.actionBtnWrap}>
            <LinearGradient
              colors={["#E8A0BF", "#7B68EE"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.actionBtn}
            >
              <Text style={styles.actionBtnText}>Swim again</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={["#0B0E2C", "#141852", "#1B3A6B", "#1F6B8A", "#26A69A"]}
      locations={[0, 0.2, 0.45, 0.7, 1]}
      style={styles.shell}
    >
      <Bubbles />
      <SeaCreatures />

      {showGreeting && childName && (
        <Animated.View entering={FadeIn.duration(500)} style={styles.greetingOverlay}>
          <Text style={styles.greetingText}>Let's swim, {childName}.</Text>
        </Animated.View>
      )}

      <View style={styles.topBar}>
        <Text style={styles.realmLabel}>
          {KIND_REALMS[currentItem.kind]} | {round + 1}/{sessionQueue.length}
        </Text>
        <View style={styles.topActions}>
          <Pressable
            onPress={() => setSettingsOpen(true)}
            style={styles.soundBtn}
            accessibilityRole="button"
            accessibilityLabel="Open settings and progress"
          >
            <Text style={styles.soundIcon}>{"\u2699\uFE0F"}</Text>
          </Pressable>
          <Pressable
            onPress={() => setVoicePracticeOn(!voicePracticeOn)}
            style={[styles.soundBtn, voicePracticeOn && styles.soundBtnActive]}
            accessibilityRole="button"
            accessibilityLabel={voicePracticeOn ? "Turn voice practice off" : "Turn voice practice on"}
          >
            <Text style={styles.soundIcon}>{voicePracticeOn ? "\u{1F399}\uFE0F" : "\u{1F3A4}"}</Text>
          </Pressable>
          <Pressable
            onPress={() => setSoundOn(!soundOn)}
            style={styles.soundBtn}
            accessibilityRole="button"
            accessibilityLabel={soundOn ? "Turn sound off" : "Turn sound on"}
          >
            <Text style={styles.soundIcon}>{soundOn ? "\u{1F50A}" : "\u{1F507}"}</Text>
          </Pressable>
        </View>
      </View>

      {phase === "intro" && (
        <Pressable onPress={handleIntroTap} style={styles.playArea}>
          <Animated.View
            key={`intro-${currentItem.id}-${round}`}
            entering={ZoomIn.duration(400)}
            style={styles.introCard}
          >
            <Text style={styles.introPhonetic}>{currentItem.soundLabel}</Text>
            <Text style={[styles.introLetter, displayTextSize(currentItem, "intro")]}>
              {currentItem.display}
            </Text>
            <Text style={styles.introDescription}>
              {currentItem.spokenPrompt}, like {itemWord(currentItem)} {itemEmoji(currentItem)}
            </Text>
            <Text style={styles.introTapHint}>Tap when ready</Text>
          </Animated.View>

          {voicePracticeOn && <VoicePracticePanel item={currentItem} />}

          <View style={styles.mermaidArea}>
            <Mermaid dancing={false} heldEmoji={null} level={level} />
          </View>
        </Pressable>
      )}

      {phase === "match" && (
        <>
          <Animated.View key={`letter-${currentItem.id}-${round}`} entering={ZoomIn.duration(350)}>
            <View style={styles.letterCard}>
              <Text style={styles.letterPrompt}>{promptFor(currentItem)}</Text>
              <Text style={[styles.letterDisplay, displayTextSize(currentItem, "prompt")]}>
                {currentItem.display}
              </Text>
            </View>
          </Animated.View>

          <Animated.View
            key={`opts-${currentItem.id}-${round}`}
            entering={FadeIn.duration(400)}
            style={styles.optionsRow}
          >
            {options.map((item) => {
              const isCurrent = item.id === currentItem.id;
              const isPicked = selectedId === item.id;
              const isRevealed = selectedId !== null;
              let bgColor = "rgba(255,255,255,0.92)";
              let borderColor = "rgba(123,104,238,0.12)";

              if (isRevealed && isCurrent) {
                bgColor = "rgba(123,104,238,0.1)";
                borderColor = "#7B68EE";
              } else if (isPicked && !isCurrent) {
                bgColor = "rgba(255,255,255,0.5)";
                borderColor = "rgba(123,104,238,0.12)";
              }

              const opacity = isRevealed && !isCurrent ? 0.3 : 1;
              const btnWidth = options.length <= 3 ? 112 : 96;
              const emojiSize = options.length <= 3 ? 46 : 38;

              return (
                <Pressable
                  key={item.id}
                  onPress={() => handlePick(item)}
                  disabled={isRevealed}
                  style={[
                    styles.choiceBtn,
                    { width: btnWidth, backgroundColor: bgColor, borderColor, opacity },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`${itemWord(item)} picture`}
                >
                  <Text style={{ fontSize: emojiSize }}>{itemEmoji(item)}</Text>
                </Pressable>
              );
            })}
          </Animated.View>

          <View style={styles.mermaidArea}>
            <Mermaid dancing={false} heldEmoji={null} level={level} />
          </View>
        </>
      )}

      {phase === "feedback" && (
        <>
          {isMatched ? (
            <>
              <Animated.View entering={ZoomIn.duration(350)} style={styles.feedbackCard}>
                <Text style={styles.feedbackEmoji}>{itemEmoji(currentItem)}</Text>
                <Text style={styles.feedbackCorrectText}>
                  {[
                    "The mermaid heard it.",
                    "That spell sparkled.",
                    "Beautiful swimming.",
                    "You found the sound.",
                    "The reef is glowing.",
                  ][round % 5]}
                </Text>
                <Text style={styles.feedbackSubtext}>
                  {currentItem.soundLabel} is for {itemWord(currentItem)} {itemEmoji(currentItem)}
                </Text>
                <Pressable onPress={handleNextAfterMatch} style={styles.nextBtn}>
                  <Text style={styles.nextBtnText}>Next spell</Text>
                </Pressable>
              </Animated.View>

              <View style={styles.mermaidArea}>
                <Mermaid dancing={dancing} heldEmoji={itemEmoji(currentItem)} level={level} />
              </View>
            </>
          ) : (
            <>
              <Animated.View entering={FadeIn.duration(400)} style={styles.feedbackCard}>
                <Text style={styles.feedbackEmoji}>{itemEmoji(currentItem)}</Text>
                <Text style={styles.feedbackGentleText}>
                  This spell says {currentItem.soundLabel}.
                </Text>
                <Text style={styles.feedbackSubtext}>
                  Say it with the mermaid, then listen again.
                </Text>
                <Pressable onPress={handleRetryAfterMiss} style={styles.retryBtn}>
                  <Text style={styles.retryBtnText}>Hear it again</Text>
                </Pressable>
              </Animated.View>

              <View style={styles.mermaidArea}>
                <Mermaid dancing={false} heldEmoji={null} level={level} />
              </View>
            </>
          )}
        </>
      )}

      {settingsOpen && (
        <SettingsProgressPanel
          childName={childName}
          childAge={childAge}
          sessionNumber={sessionNumber}
          learningProgress={learningProgress}
          soundOn={soundOn}
          voicePracticeOn={voicePracticeOn}
          onSetSoundOn={setSoundOn}
          onSetVoicePracticeOn={setVoicePracticeOn}
          onResetProfile={resetOnboarding}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 10,
    paddingBottom: 16,
  },
  greetingOverlay: {
    position: "absolute",
    top: 100,
    zIndex: 10,
    backgroundColor: "rgba(123,104,238,0.85)",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  greetingText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  topBar: {
    width: "100%",
    maxWidth: 440,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    zIndex: 1,
  },
  realmLabel: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 12,
    fontWeight: "600",
  },
  soundBtn: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  soundBtnActive: {
    backgroundColor: "rgba(232,160,191,0.28)",
  },
  soundIcon: {
    fontSize: 15,
    color: "#fff",
  },
  topActions: {
    flexDirection: "row",
    gap: 8,
  },
  playArea: {
    flex: 1,
    alignItems: "center",
    zIndex: 1,
  },
  introCard: {
    backgroundColor: "rgba(255,255,255,0.94)",
    borderRadius: 28,
    paddingHorizontal: 36,
    paddingTop: 18,
    paddingBottom: 22,
    alignItems: "center",
    zIndex: 1,
    marginBottom: 12,
    minWidth: 220,
    maxWidth: 340,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 8,
  },
  introPhonetic: {
    fontSize: 16,
    color: "#7B68EE",
    fontWeight: "600",
    marginBottom: 2,
  },
  introLetter: {
    color: "#1B3A6B",
    fontFamily: "Kalam_700Bold",
    textAlign: "center",
  },
  introDescription: {
    fontSize: 18,
    color: "#444",
    fontWeight: "500",
    textAlign: "center",
    marginTop: 2,
  },
  introTapHint: {
    fontSize: 13,
    color: "#888",
    fontWeight: "500",
    marginTop: 10,
  },
  letterCard: {
    backgroundColor: "rgba(255,255,255,0.94)",
    borderRadius: 24,
    paddingHorizontal: 32,
    paddingTop: 6,
    paddingBottom: 10,
    alignItems: "center",
    zIndex: 1,
    marginBottom: 10,
    minWidth: 190,
    maxWidth: 340,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 8,
  },
  letterPrompt: {
    fontSize: 13,
    color: "#7B68EE",
    fontWeight: "600",
    textAlign: "center",
  },
  letterDisplay: {
    color: "#1B3A6B",
    fontFamily: "Kalam_700Bold",
    textAlign: "center",
  },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 11,
    zIndex: 1,
    maxWidth: 460,
    marginBottom: 8,
  },
  choiceBtn: {
    padding: 12,
    paddingBottom: 8,
    borderRadius: 20,
    borderWidth: 3,
    alignItems: "center",
    gap: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  feedbackCard: {
    backgroundColor: "rgba(255,255,255,0.94)",
    borderRadius: 28,
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 20,
    alignItems: "center",
    zIndex: 1,
    marginBottom: 8,
    minWidth: 200,
    maxWidth: 340,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 8,
  },
  feedbackEmoji: {
    fontSize: 52,
    marginBottom: 6,
  },
  feedbackCorrectText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#7B68EE",
    textAlign: "center",
  },
  feedbackGentleText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#444",
    textAlign: "center",
  },
  feedbackSubtext: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
    textAlign: "center",
  },
  nextBtn: {
    marginTop: 14,
    backgroundColor: "rgba(123,104,238,0.12)",
    borderRadius: 20,
    paddingHorizontal: 28,
    paddingVertical: 10,
  },
  nextBtnText: {
    color: "#7B68EE",
    fontSize: 16,
    fontWeight: "700",
  },
  retryBtn: {
    marginTop: 14,
    backgroundColor: "rgba(232,160,191,0.15)",
    borderRadius: 20,
    paddingHorizontal: 28,
    paddingVertical: 10,
  },
  retryBtnText: {
    color: "#E8A0BF",
    fontSize: 16,
    fontWeight: "700",
  },
  mermaidArea: {
    zIndex: 1,
    marginTop: "auto",
    paddingTop: 2,
    alignItems: "center",
  },
  doneContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
    padding: 20,
  },
  doneTitle: {
    fontSize: 30,
    fontWeight: "700",
    color: "#fff",
    marginTop: 10,
    marginBottom: 8,
    textAlign: "center",
  },
  doneMessage: {
    fontSize: 17,
    color: "rgba(255,255,255,0.68)",
    marginBottom: 22,
    textAlign: "center",
  },
  actionBtnWrap: {
    borderRadius: 50,
    overflow: "hidden",
    shadowColor: "rgba(123,104,238,0.4)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 8,
  },
  actionBtn: {
    paddingHorizontal: 38,
    paddingVertical: 13,
    borderRadius: 50,
  },
  actionBtnText: {
    fontSize: 21,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
});
