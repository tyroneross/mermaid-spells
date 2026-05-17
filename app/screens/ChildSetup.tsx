import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import Bubbles from "../components/Bubbles";
import Mermaid from "../components/Mermaid";

const AGE_OPTIONS = [3, 4, 5, 6];

interface ChildSetupProps {
  onComplete: (name: string, age: number) => void;
}

export default function ChildSetup({ onComplete }: ChildSetupProps) {
  const [name, setName] = useState("");
  const [age, setAge] = useState<number | null>(null);

  const canContinue = name.trim().length > 0 && age !== null;

  const handleStart = () => {
    if (!canContinue) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete(name.trim(), age!);
  };

  return (
    <LinearGradient
      colors={["#0B0E2C", "#141852", "#1B3A6B", "#1F6B8A", "#26A69A"]}
      locations={[0, 0.2, 0.45, 0.7, 1]}
      style={styles.container}
    >
      <Bubbles />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
      >
        <Animated.View entering={FadeIn.duration(600)} style={styles.mermaidWrap}>
          <Mermaid dancing={false} heldEmoji={null} level={0} />
        </Animated.View>

        <Animated.Text
          entering={FadeInUp.delay(200).duration(500)}
          style={styles.title}
        >
          Let's get started!
        </Animated.Text>

        <Animated.View
          entering={FadeInUp.delay(400).duration(500)}
          style={styles.inputGroup}
        >
          <Text style={styles.label}>What's your child's name?</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter name"
            placeholderTextColor="rgba(27,58,107,0.35)"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            returnKeyType="done"
          />
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(600).duration(500)}
          style={styles.inputGroup}
        >
          <Text style={styles.label}>How old are they?</Text>
          <View style={styles.ageRow}>
            {AGE_OPTIONS.map((a) => (
              <Pressable
                key={a}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setAge(a);
                }}
                style={[
                  styles.ageBtn,
                  age === a && styles.ageBtnSelected,
                ]}
              >
                <Text
                  style={[
                    styles.ageBtnText,
                    age === a && styles.ageBtnTextSelected,
                  ]}
                >
                  {a === 6 ? "6+" : String(a)}
                </Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(800).duration(500)}>
          <Pressable
            onPress={handleStart}
            disabled={!canContinue}
            style={[styles.startBtnWrap, !canContinue && { opacity: 0.4 }]}
          >
            <LinearGradient
              colors={["#E8A0BF", "#7B68EE"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.startBtn}
            >
              <Text style={styles.startBtnText}>
                {"\u{1F9DC}"} Start the Adventure!
              </Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </KeyboardAvoidingView>
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
  mermaidWrap: {
    marginBottom: 8,
    transform: [{ scale: 0.7 }],
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 24,
  },
  inputGroup: {
    width: "100%",
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "rgba(255,255,255,0.7)",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 20,
    color: "#1B3A6B",
    fontWeight: "600",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  ageRow: {
    flexDirection: "row",
    gap: 12,
  },
  ageBtn: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  ageBtnSelected: {
    backgroundColor: "rgba(123,104,238,0.2)",
    borderWidth: 2,
    borderColor: "#7B68EE",
  },
  ageBtnText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1B3A6B",
  },
  ageBtnTextSelected: {
    color: "#7B68EE",
  },
  startBtnWrap: {
    borderRadius: 50,
    overflow: "hidden",
    marginTop: 8,
    shadowColor: "rgba(123,104,238,0.4)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 8,
  },
  startBtn: {
    paddingHorizontal: 38,
    paddingVertical: 16,
    borderRadius: 50,
  },
  startBtnText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
});
