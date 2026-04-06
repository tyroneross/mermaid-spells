import { useCallback, useRef } from "react";
import { Audio } from "expo-av";

// Synthesized tones via expo-av aren't practical on RN.
// Instead we use short haptic bursts for feedback, and this hook
// provides no-op stubs that can later be wired to real .wav assets.
// For MVP, haptics carry the feedback — sounds are optional.

export function useSoundEngine(enabled: boolean) {
  const playCorrect = useCallback(() => {
    // Future: play ascending chime .wav
  }, []);

  const playWrong = useCallback(() => {
    // Future: play gentle low tone .wav
  }, []);

  const playTap = useCallback(() => {
    // Future: play short click .wav
  }, []);

  const playCelebration = useCallback(() => {
    // Future: play celebration fanfare .wav
  }, []);

  return { playCorrect, playWrong, playTap, playCelebration };
}
