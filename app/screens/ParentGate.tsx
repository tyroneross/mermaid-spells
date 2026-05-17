import React, { useState, useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import Bubbles from "../components/Bubbles";

interface ParentGateProps {
  onPass: () => void;
}

export default function ParentGate({ onPass }: ParentGateProps) {
  const [wrong, setWrong] = useState(false);

  const challenge = useMemo(() => {
    const a = Math.floor(Math.random() * 6) + 2; // 2-7
    const b = Math.floor(Math.random() * 6) + 1; // 1-6
    const answer = a + b;
    // Generate 3 wrong answers that are close but distinct
    const wrongSet = new Set<number>();
    while (wrongSet.size < 3) {
      const w = answer + (Math.floor(Math.random() * 5) - 2); // answer ± 2
      if (w !== answer && w > 0) wrongSet.add(w);
    }
    const options = [...wrongSet, answer].sort(() => Math.random() - 0.5);
    return { a, b, answer, options };
  }, []);

  const handlePick = (num: number) => {
    if (num === challenge.answer) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onPass();
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setWrong(true);
      setTimeout(() => setWrong(false), 1500);
    }
  };

  return (
    <LinearGradient
      colors={["#0B0E2C", "#141852", "#1B3A6B", "#1F6B8A", "#26A69A"]}
      locations={[0, 0.2, 0.45, 0.7, 1]}
      style={styles.container}
    >
      <Bubbles />
      <View style={styles.content}>
        <Animated.Text entering={FadeIn.duration(600)} style={styles.icon}>
          {"\u{1F9DC}\u200D\u2640\uFE0F"}
        </Animated.Text>
        <Animated.Text
          entering={FadeInUp.delay(200).duration(500)}
          style={styles.title}
        >
          A grown-up is needed
        </Animated.Text>
        <Animated.Text
          entering={FadeInUp.delay(400).duration(500)}
          style={styles.subtitle}
        >
          Please answer this question to continue
        </Animated.Text>

        <Animated.View
          entering={FadeInUp.delay(600).duration(500)}
          style={styles.questionCard}
        >
          <Text style={styles.questionLabel}>What is</Text>
          <Text style={styles.questionMath}>
            {challenge.a} + {challenge.b} = ?
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(800).duration(500)}
          style={styles.optionsGrid}
        >
          {challenge.options.map((num, i) => (
            <Pressable
              key={`${num}-${i}`}
              onPress={() => handlePick(num)}
              style={({ pressed }) => [
                styles.optionBtn,
                pressed && styles.optionPressed,
              ]}
            >
              <Text style={styles.optionText}>{num}</Text>
            </Pressable>
          ))}
        </Animated.View>

        {wrong && (
          <Animated.Text entering={FadeIn.duration(300)} style={styles.wrongMsg}>
            Try again!
          </Animated.Text>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    zIndex: 1,
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    marginBottom: 32,
  },
  questionCard: {
    backgroundColor: "rgba(255,255,255,0.94)",
    borderRadius: 24,
    paddingHorizontal: 40,
    paddingVertical: 24,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 8,
  },
  questionLabel: {
    fontSize: 14,
    color: "#888",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  questionMath: {
    fontSize: 42,
    fontWeight: "700",
    color: "#1B3A6B",
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
  },
  optionBtn: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  optionPressed: {
    backgroundColor: "rgba(123,104,238,0.15)",
    transform: [{ scale: 0.95 }],
  },
  optionText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1B3A6B",
  },
  wrongMsg: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "600",
    color: "#FFB6C1",
  },
});
