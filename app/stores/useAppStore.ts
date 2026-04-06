import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AppState {
  childName: string;
  childAge: number;
  onboardingComplete: boolean;
  hydrated: boolean;
  setChildName: (name: string) => void;
  setChildAge: (age: number) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  hydrate: () => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  childName: "",
  childAge: 4,
  onboardingComplete: false,
  hydrated: false,

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
    set({ onboardingComplete: false, childName: "", childAge: 4 });
    AsyncStorage.multiRemove(["onboardingComplete", "childName", "childAge"]);
  },

  hydrate: async () => {
    const [complete, name, age] = await AsyncStorage.multiGet([
      "onboardingComplete",
      "childName",
      "childAge",
    ]);
    set({
      onboardingComplete: complete[1] === "true",
      childName: name[1] || "",
      childAge: age[1] ? parseInt(age[1], 10) : 4,
      hydrated: true,
    });
  },
}));
