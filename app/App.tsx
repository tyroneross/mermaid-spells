import React, { useEffect, useState } from "react";
import { ActivityIndicator, StatusBar, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts, Kalam_700Bold } from "@expo-google-fonts/kalam";

import { useAppStore } from "./stores/useAppStore";
import ParentGate from "./screens/ParentGate";
import ChildSetup from "./screens/ChildSetup";
import GameScreen from "./screens/GameScreen";

type AppScreen = "loading" | "parentGate" | "childSetup" | "game";

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

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated || !fontsLoaded) return;
    setScreen(onboardingComplete ? "game" : "parentGate");
  }, [hydrated, fontsLoaded, onboardingComplete]);

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

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 10,
    paddingBottom: 16,
  },
});
