import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  recordLearningAttempt,
  type LearningProgressMap,
} from "../services/masteryEngine";

const STORAGE_KEYS = [
  "onboardingComplete",
  "childName",
  "childAge",
  "learningProgress",
  "sessionNumber",
  "soundOn",
  "voicePracticeOn",
];

interface AppState {
  childName: string;
  childAge: number;
  onboardingComplete: boolean;
  hydrated: boolean;
  learningProgress: LearningProgressMap;
  sessionNumber: number;
  soundOn: boolean;
  voicePracticeOn: boolean;
  setChildName: (name: string) => void;
  setChildAge: (age: number) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  setSoundOn: (enabled: boolean) => void;
  setVoicePracticeOn: (enabled: boolean) => void;
  startNewSession: () => void;
  recordLearningAttempt: (itemId: string, matched: boolean) => void;
  hydrate: () => Promise<void>;
}

function parseProgress(value: string | null): LearningProgressMap {
  if (!value) return {};
  try {
    return JSON.parse(value) as LearningProgressMap;
  } catch {
    return {};
  }
}

export const useAppStore = create<AppState>((set) => ({
  childName: "",
  childAge: 4,
  onboardingComplete: false,
  hydrated: false,
  learningProgress: {},
  sessionNumber: 1,
  soundOn: true,
  voicePracticeOn: false,

  setChildName: (name) => {
    set({ childName: name });
    AsyncStorage.setItem("childName", name);
  },

  setChildAge: (age) => {
    set({ childAge: age });
    AsyncStorage.setItem("childAge", String(age));
  },

  completeOnboarding: () => {
    set({ onboardingComplete: true });
    AsyncStorage.setItem("onboardingComplete", "true");
  },

  resetOnboarding: () => {
    set({
      onboardingComplete: false,
      childName: "",
      childAge: 4,
      learningProgress: {},
      sessionNumber: 1,
      soundOn: true,
      voicePracticeOn: false,
    });
    AsyncStorage.multiRemove(STORAGE_KEYS);
  },

  setSoundOn: (enabled) => {
    set({ soundOn: enabled });
    AsyncStorage.setItem("soundOn", String(enabled));
  },

  setVoicePracticeOn: (enabled) => {
    set({ voicePracticeOn: enabled });
    AsyncStorage.setItem("voicePracticeOn", String(enabled));
  },

  startNewSession: () => {
    set((state) => {
      const sessionNumber = state.sessionNumber + 1;
      AsyncStorage.setItem("sessionNumber", String(sessionNumber));
      return { sessionNumber };
    });
  },

  recordLearningAttempt: (itemId, matched) => {
    set((state) => {
      const learningProgress = recordLearningAttempt(
        state.learningProgress,
        itemId,
        matched,
        state.sessionNumber
      );
      AsyncStorage.setItem("learningProgress", JSON.stringify(learningProgress));
      return { learningProgress };
    });
  },

  hydrate: async () => {
    const [complete, name, age, progress, sessionNumber, soundOn, voicePracticeOn] =
      await AsyncStorage.multiGet(STORAGE_KEYS);
    set({
      onboardingComplete: complete[1] === "true",
      childName: name[1] || "",
      childAge: age[1] ? parseInt(age[1], 10) : 4,
      learningProgress: parseProgress(progress[1]),
      sessionNumber: sessionNumber[1] ? parseInt(sessionNumber[1], 10) : 1,
      soundOn: soundOn[1] ? soundOn[1] === "true" : true,
      voicePracticeOn: voicePracticeOn[1] === "true",
      hydrated: true,
    });
  },
}));
