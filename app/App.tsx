import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts, Kalam_700Bold } from "@expo-google-fonts/kalam";
import Animated, {
  FadeIn,
  ZoomIn,
} from "react-native-reanimated";

import Mermaid from "./components/Mermaid";
import Bubbles from "./components/Bubbles";
import SeaCreatures from "./components/SeaCreatures";
import { useSoundEngine } from "./hooks/useSoundEngine";
import {
  letterData,
  MONTESSORI_ORDER,
  shuffle,
  getDistractors,
  LEVELS,
} from "./constants/letterData";
import { useAppStore } from "./stores/useAppStore";
import ParentGate from "./screens/ParentGate";
import ChildSetup from "./screens/ChildSetup";

type AppScreen = "loading" | "parentGate" | "childSetup" | "game";
type GameMode = "play" | "levelDone" | "allDone";
type Phase = "intro" | "match" | "feedback";

export default function App() {
  const [fontsLoaded] = useFonts({ Kalam_700Bold });
  const childName = useAppStore((s) => s.childName);
  const onboardingComplete = useAppStore((s) => s.onboardingComplete);
  const hydrated = useAppStore((s) => s.hydrated);
  const hydrate = useAppStore((s) => s.hydrate);
  const setChildName = useAppStore((s) => s.setChildName);
  const setChildAge = useAppStore((s) => s.setChildAge);
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);

  const [screen, setScreen] = useState<AppScreen>("loading");

  // Hydrate store on mount
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Route once hydrated — only run when hydrated/fontsLoaded change
  useEffect(() => {
    if (!hydrated || !fontsLoaded) return;
    setScreen(onboardingComplete ? "game" : "parentGate");
  }, [hydrated, fontsLoaded]);

  if (screen === "loading" || !fontsLoaded || !hydrated) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <LinearGradient
          colors={["#0B0E2C", "#141852", "#1B3A6B"]}
          style={[styles.shell, { justifyContent: "center" }]}
        >
          <ActivityIndicator size="large" color="#7B68EE" />
        </LinearGradient>
      </GestureHandlerRootView>
    );
  }

  if (screen === "parentGate") {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" />
        <ParentGate onPass={() => setScreen("childSetup")} />
      </GestureHandlerRootView>
    );
  }

  if (screen === "childSetup") {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" />
        <ChildSetup
          onComplete={(name, age) => {
            setChildName(name);
            setChildAge(age);
            completeOnboarding();
            setScreen("game");
          }}
        />
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      <GameScreen childName={childName} />
    </GestureHandlerRootView>
  );
}

// ─── Game Screen ───────────────────────────────────────────

function GameScreen({ childName }: { childName: string }) {
  // Build queue from Montessori order — shuffle within each level's group
  const [queue] = useState(() => {
    const level1 = shuffle(MONTESSORI_ORDER.slice(0, 8));   // Groups 1-2
    const level2 = shuffle(MONTESSORI_ORDER.slice(8, 16));  // Groups 3-4
    const level3 = shuffle(MONTESSORI_ORDER.slice(16, 26)); // Groups 5-6
    return [...level1, ...level2, ...level3];
  });

  const [level, setLevel] = useState(0);
  const [round, setRound] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [dancing, setDancing] = useState(false);
  const [mode, setMode] = useState<GameMode>("play");
  const [phase, setPhase] = useState<Phase>("intro");
  const [soundOn, setSoundOn] = useState(true);
  const [showGreeting, setShowGreeting] = useState(!!childName);

  const { playCorrect, playTap, playCelebration } =
    useSoundEngine(soundOn);

  const levelConfig = LEVELS[level];
  const levelStart = useMemo(
    () => LEVELS.slice(0, level).reduce((sum, l) => sum + l.count, 0),
    [level]
  );
  const levelLetters = useMemo(
    () => queue.slice(levelStart, levelStart + levelConfig.count),
    [queue, levelStart, levelConfig.count]
  );
  const currentLetter = levelLetters[round];
  const currentData = currentLetter ? letterData[currentLetter] : null;

  // Hide greeting after a moment
  useEffect(() => {
    if (showGreeting) {
      const t = setTimeout(() => setShowGreeting(false), 2000);
      return () => clearTimeout(t);
    }
  }, [showGreeting]);

  // Set up options when entering match phase
  useEffect(() => {
    if (mode === "play" && phase === "match") {
      const letter = levelLetters[round];
      if (!letter) return;
      const nd = levelConfig.choices - 1;
      setOptions(shuffle([letter, ...getDistractors(letter, nd)]));
    }
  }, [round, mode, level, phase]);

  // Reset phase to intro on new round
  useEffect(() => {
    if (mode === "play") {
      setPhase("intro");
    }
  }, [round, level, mode]);

  const handleIntroTap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    playTap();
    setPhase("match");
  };

  const handlePick = (pick: string) => {
    if (selected || phase !== "match") return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    playTap();
    setSelected(pick);

    if (pick === currentLetter) {
      // Correct!
      setScore((s) => s + 1);
      setStreak((s) => s + 1);
      setDancing(true);
      setPhase("feedback");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => playCorrect(), 80);
    } else {
      // Wrong — gentle handling, no shaming
      setStreak(0);
      setPhase("feedback");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleNextAfterCorrect = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDancing(false);
    setSelected(null);
    if (round + 1 >= levelConfig.count) {
      if (level + 1 >= LEVELS.length) {
        setMode("allDone");
        setTimeout(playCelebration, 150);
      } else {
        setMode("levelDone");
      }
    } else {
      setRound((r) => r + 1);
    }
  };

  const handleRetryAfterWrong = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(null);
    setPhase("intro"); // Show intro again — reinforces the letter-sound connection
  };

  const nextLevel = () => {
    setLevel((l) => l + 1);
    setRound(0);
    setSelected(null);
    setDancing(false);
    setPhase("intro");
    setMode("play");
  };

  const restart = () => {
    setLevel(0);
    setRound(0);
    setScore(0);
    setStreak(0);
    setSelected(null);
    setDancing(false);
    setPhase("intro");
    setMode("play");
  };

  const totalRounds = LEVELS.reduce((s, l) => s + l.count, 0);
  const isCorrect = selected === currentLetter;

  // ─── Level Complete Screen ───
  if (mode === "levelDone") {
    const nextLevelConfig = LEVELS[level + 1];
    return (
      <LinearGradient
        colors={["#0B0E2C", "#141852", "#1B3A6B", "#1F6B8A", "#26A69A"]}
        locations={[0, 0.2, 0.45, 0.7, 1]}
        style={styles.shell}
      >
        <Bubbles />
        <SeaCreatures />
        <View style={styles.doneContent}>
          <Mermaid dancing heldEmoji={"\u2B50"} level={level} />
          <Text style={styles.doneTitle}>
            {levelConfig.emoji} Level Complete!
          </Text>
          <Text style={styles.doneScore}>
            {levelConfig.name} cleared!
          </Text>
          <Text style={styles.doneStars}>
            {"\u2B50"} {score} stars earned
          </Text>
          <Text style={styles.doneMessage}>
            Next: {nextLevelConfig.emoji} {nextLevelConfig.name}
          </Text>
          <Pressable onPress={nextLevel} style={styles.restartBtn}>
            <LinearGradient
              colors={["#E8A0BF", "#7B68EE"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.restartGradient}
            >
              <Text style={styles.restartText}>Next Level {"\u{27A1}\uFE0F"}</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </LinearGradient>
    );
  }

  // ─── All Done Screen ───
  if (mode === "allDone") {
    return (
      <LinearGradient
        colors={["#0B0E2C", "#141852", "#1B3A6B", "#1F6B8A", "#26A69A"]}
        locations={[0, 0.2, 0.45, 0.7, 1]}
        style={styles.shell}
      >
        <Bubbles />
        <SeaCreatures />
        <View style={styles.doneContent}>
          <Mermaid dancing heldEmoji={"\u{1F3C6}"} level={2} />
          <Text style={styles.doneTitle}>
            {"\u{1F389}"} Swim-tastic! {"\u{1F389}"}
          </Text>
          <Text style={styles.doneScore}>
            <Text style={{ fontWeight: "700" }}>{score}</Text> out of{" "}
            <Text style={{ fontWeight: "700" }}>{totalRounds}</Text>!
          </Text>
          <Text style={styles.doneMessage}>
            {score === totalRounds
              ? "Perfect! Letter Mermaid! \u{1F451}"
              : score >= totalRounds * 0.8
                ? "Amazing! \u{1F31F}"
                : score >= totalRounds * 0.5
                  ? "Great exploring! \u{1F420}"
                  : "Keep swimming! \u{1F41A}"}
          </Text>
          <Pressable onPress={restart} style={styles.restartBtn}>
            <LinearGradient
              colors={["#E8A0BF", "#7B68EE"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.restartGradient}
            >
              <Text style={styles.restartText}>{"\u{1F9DC}"} Swim Again!</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </LinearGradient>
    );
  }

  // ─── Game Play Screen ───
  return (
    <LinearGradient
      colors={["#0B0E2C", "#141852", "#1B3A6B", "#1F6B8A", "#26A69A"]}
      locations={[0, 0.2, 0.45, 0.7, 1]}
      style={styles.shell}
    >
      <Bubbles />
      <SeaCreatures />

      {/* Greeting overlay */}
      {showGreeting && childName && (
        <Animated.View entering={FadeIn.duration(500)} style={styles.greetingOverlay}>
          <Text style={styles.greetingText}>
            Let's go, {childName}! {"\u{1F30A}"}
          </Text>
        </Animated.View>
      )}

      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.diffLabel}>
          {levelConfig.emoji} {levelConfig.name}
        </Text>
        <View style={styles.scoreRow}>
          <Text style={styles.scoreText}>
            {"\u2B50"} {score}
            {streak >= 3 ? ` \u{1F525}${streak}` : ""}
          </Text>
          <Pressable onPress={() => setSoundOn((s) => !s)} style={styles.soundBtn}>
            <Text style={styles.soundIcon}>
              {soundOn ? "\u{1F50A}" : "\u{1F507}"}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Progress bar (per level) */}
      <View style={styles.progressOuter}>
        <LinearGradient
          colors={["#E8A0BF", "#7B68EE"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.progressInner,
            { width: `${(round / levelConfig.count) * 100}%` as any },
          ]}
        />
      </View>

      {/* ─── INTRO PHASE ─── */}
      {phase === "intro" && currentData && (
        <Pressable onPress={handleIntroTap} style={{ flex: 1, alignItems: "center", zIndex: 1 }}>
          <Animated.View
            key={`intro-${level}-${round}`}
            entering={ZoomIn.duration(400)}
            style={styles.introCard}
          >
            <Text style={styles.introPhonetic}>{currentData.phonetic}</Text>
            <Text style={styles.introLetter}>{currentLetter}</Text>
            <Text style={styles.introDescription}>
              This is {currentData.phonetic}, like {currentData.word} {currentData.emoji}
            </Text>
            <Text style={styles.introTapHint}>Tap to play!</Text>
          </Animated.View>

          <View style={styles.mermaidArea}>
            <Mermaid dancing={false} heldEmoji={null} level={level} />
          </View>
        </Pressable>
      )}

      {/* ─── MATCH PHASE ─── */}
      {phase === "match" && currentData && (
        <>
          {/* Letter display */}
          <Animated.View key={`letter-${level}-${round}`} entering={ZoomIn.duration(350)}>
            <View style={styles.letterCard}>
              <Text style={styles.letterPrompt}>
                Find the {currentData.phonetic} sound
              </Text>
              <Text style={styles.letterDisplay}>{currentLetter}</Text>
            </View>
          </Animated.View>

          {/* Choice buttons */}
          <Animated.View
            key={`opts-${level}-${round}`}
            entering={FadeIn.duration(400)}
            style={styles.optionsRow}
          >
            {options.map((letter) => {
              const d = letterData[letter];
              const isThisCorrect = letter === currentLetter;
              const isPicked = selected === letter;
              const isRevealed = selected !== null;

              let bgColor = "rgba(255,255,255,0.92)";
              let borderColor = "rgba(123,104,238,0.12)";
              if (isRevealed && isThisCorrect) {
                bgColor = "rgba(123,104,238,0.1)";
                borderColor = "#7B68EE";
              } else if (isPicked && !isThisCorrect) {
                // No red — just dim it
                bgColor = "rgba(255,255,255,0.5)";
                borderColor = "rgba(123,104,238,0.12)";
              }

              // Dim non-correct options when revealed
              const opacity = isRevealed && !isThisCorrect ? 0.3 : 1;
              const btnWidth = options.length <= 3 ? 112 : 96;
              const emojiSize = options.length <= 3 ? 46 : 38;

              return (
                <Pressable
                  key={letter}
                  onPress={() => handlePick(letter)}
                  disabled={isRevealed}
                  style={[
                    styles.choiceBtn,
                    { width: btnWidth, backgroundColor: bgColor, borderColor, opacity },
                  ]}
                >
                  <Text style={{ fontSize: emojiSize }}>{d.emoji}</Text>
                </Pressable>
              );
            })}
          </Animated.View>

          {/* Mermaid */}
          <View style={styles.mermaidArea}>
            <Mermaid dancing={false} heldEmoji={null} level={level} />
          </View>
        </>
      )}

      {/* ─── FEEDBACK PHASE ─── */}
      {phase === "feedback" && currentData && (
        <>
          {isCorrect ? (
            // ─── Correct feedback ───
            <>
              <Animated.View entering={ZoomIn.duration(350)} style={styles.feedbackCard}>
                <Text style={styles.feedbackEmoji}>{currentData.emoji}</Text>
                <Text style={styles.feedbackCorrectText}>
                  {["Yay! \u{1F389}", "Amazing! \u{1F31F}", "You rock! \u{1F4AB}", "Splash! \u{1F42C}", "Wow! \u2728"][round % 5]}
                </Text>
                <Text style={styles.feedbackSubtext}>
                  {currentData.phonetic} is for {currentData.word} {currentData.emoji}
                </Text>
                <Pressable onPress={handleNextAfterCorrect} style={styles.nextBtn}>
                  <Text style={styles.nextBtnText}>Next {"\u{27A1}\uFE0F"}</Text>
                </Pressable>
              </Animated.View>

              <View style={styles.mermaidArea}>
                <Mermaid
                  dancing={true}
                  heldEmoji={currentData.emoji}
                  level={level}
                />
              </View>
            </>
          ) : (
            // ─── Wrong feedback — gentle, no shaming ───
            <>
              <Animated.View entering={FadeIn.duration(400)} style={styles.feedbackCard}>
                <Text style={styles.feedbackEmoji}>{currentData.emoji}</Text>
                <Text style={styles.feedbackGentleText}>
                  This is {currentData.phonetic}, {currentData.word} {currentData.emoji}
                </Text>
                <Text style={styles.feedbackSubtext}>
                  Let's try again!
                </Text>
                <Pressable onPress={handleRetryAfterWrong} style={styles.retryBtn}>
                  <Text style={styles.retryBtnText}>Try Again {"\u{1F30A}"}</Text>
                </Pressable>
              </Animated.View>

              <View style={styles.mermaidArea}>
                <Mermaid dancing={false} heldEmoji={null} level={level} />
              </View>
            </>
          )}
        </>
      )}

      <Text style={styles.roundCounter}>
        {round + 1} / {levelConfig.count}
      </Text>
    </LinearGradient>
  );
}

// ─── Styles ────────────────────────────────────────────────

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
    marginBottom: 5,
    zIndex: 1,
  },
  diffLabel: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 12,
    fontWeight: "600",
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  scoreText: {
    color: "#FFD700",
    fontSize: 14,
    fontWeight: "700",
  },
  soundBtn: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  soundIcon: {
    fontSize: 15,
    color: "#fff",
  },
  progressOuter: {
    width: "100%",
    maxWidth: 440,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginBottom: 10,
    overflow: "hidden",
    zIndex: 1,
  },
  progressInner: {
    height: "100%",
    borderRadius: 3,
  },

  // ─── Intro Phase ───
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
    fontSize: 130,
    lineHeight: 155,
    color: "#1B3A6B",
    fontFamily: "Kalam_700Bold",
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
    color: "#aaa",
    fontWeight: "500",
    marginTop: 10,
  },

  // ─── Match Phase ───
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
  },
  letterDisplay: {
    fontSize: 120,
    lineHeight: 150,
    color: "#1B3A6B",
    fontFamily: "Kalam_700Bold",
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

  // ─── Feedback Phase ───
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

  // ─── Mermaid & Layout ───
  mermaidArea: {
    zIndex: 1,
    marginTop: "auto",
    paddingTop: 2,
    alignItems: "center",
  },
  roundCounter: {
    color: "rgba(255,255,255,0.25)",
    fontSize: 10,
    marginTop: 4,
    zIndex: 1,
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
    marginBottom: 4,
    textAlign: "center",
  },
  doneScore: {
    fontSize: 20,
    color: "#E0E7FF",
    marginBottom: 4,
    textAlign: "center",
  },
  doneStars: {
    fontSize: 16,
    color: "#FFD700",
    fontWeight: "600",
    marginBottom: 4,
  },
  doneMessage: {
    fontSize: 17,
    color: "rgba(255,255,255,0.6)",
    marginBottom: 22,
    textAlign: "center",
  },
  restartBtn: {
    borderRadius: 50,
    overflow: "hidden",
    shadowColor: "rgba(123,104,238,0.4)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 8,
  },
  restartGradient: {
    paddingHorizontal: 38,
    paddingVertical: 13,
    borderRadius: 50,
  },
  restartText: {
    fontSize: 21,
    fontWeight: "700",
    color: "#fff",
  },
});
