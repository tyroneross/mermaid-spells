import { useCallback, useEffect, useRef } from "react";
import { Audio, type AVPlaybackSource } from "expo-av";

type SoundKey = "tap" | "correct" | "wrong" | "celebration";

const SOUND_ASSETS: Record<SoundKey, AVPlaybackSource> = {
  tap: require("../assets/sounds/tap.wav"),
  correct: require("../assets/sounds/correct.wav"),
  wrong: require("../assets/sounds/wrong.wav"),
  celebration: require("../assets/sounds/celebration.wav"),
};

const SOUND_VOLUME: Record<SoundKey, number> = {
  tap: 0.45,
  correct: 0.72,
  wrong: 0.5,
  celebration: 0.75,
};

let audioModePromise: Promise<void> | null = null;

function configureAudioMode() {
  audioModePromise ??= Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
    staysActiveInBackground: false,
  }).catch(() => undefined);

  return audioModePromise;
}

export function useSoundEngine(enabled: boolean) {
  const soundsRef = useRef<Partial<Record<SoundKey, Audio.Sound>>>({});
  const loadingRef = useRef<Partial<Record<SoundKey, Promise<Audio.Sound>>>>({});

  const loadSound = useCallback(async (key: SoundKey) => {
    const loaded = soundsRef.current[key];
    if (loaded) return loaded;

    const loading = loadingRef.current[key];
    if (loading) return loading;

    const nextLoad = configureAudioMode()
      .then(() =>
        Audio.Sound.createAsync(SOUND_ASSETS[key], {
          shouldPlay: false,
          volume: SOUND_VOLUME[key],
        })
      )
      .then(({ sound }) => {
        soundsRef.current[key] = sound;
        delete loadingRef.current[key];
        return sound;
      })
      .catch((error) => {
        delete loadingRef.current[key];
        throw error;
      });

    loadingRef.current[key] = nextLoad;
    return nextLoad;
  }, []);

  const play = useCallback(
    (key: SoundKey) => {
      if (!enabled) return;

      void loadSound(key)
        .then(async (sound) => {
          await sound.setVolumeAsync(SOUND_VOLUME[key]);
          await sound.setPositionAsync(0);
          await sound.playAsync();
        })
        .catch(() => undefined);
    },
    [enabled, loadSound]
  );

  useEffect(() => {
    return () => {
      Object.values(soundsRef.current).forEach((sound) => {
        void sound?.unloadAsync();
      });
    };
  }, []);

  const playCorrect = useCallback(() => {
    play("correct");
  }, [play]);

  const playWrong = useCallback(() => {
    play("wrong");
  }, [play]);

  const playTap = useCallback(() => {
    play("tap");
  }, [play]);

  const playCelebration = useCallback(() => {
    play("celebration");
  }, [play]);

  return { playCorrect, playWrong, playTap, playCelebration };
}
