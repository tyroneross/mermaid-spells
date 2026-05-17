import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View, type DimensionValue } from "react-native";
import {
  ExpoSpeechRecognitionModule,
  RecognizerIntentExtraLanguageModel,
  TaskHintIOS,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";

import type { LearningItem } from "../constants/learningItems";
import {
  getVoiceContextualStrings,
  validateTranscriptForItem,
  type VoiceValidationResult,
} from "../services/voiceValidation";

interface VoicePracticePanelProps {
  item: LearningItem;
}

function canUseRecognition(): boolean {
  try {
    return ExpoSpeechRecognitionModule.isRecognitionAvailable();
  } catch {
    return false;
  }
}

function friendlyError(error: string): string {
  if (error === "not-allowed") {
    return "A grown-up needs to turn the microphone on.";
  }
  if (error === "no-speech" || error === "speech-timeout") {
    return "The mermaid could not hear it.";
  }
  if (error === "network") {
    return "The voice shell needs a better signal.";
  }
  return "Voice practice is resting right now.";
}

export default function VoicePracticePanel({ item }: VoicePracticePanelProps) {
  const [recognizing, setRecognizing] = useState(false);
  const [volume, setVolume] = useState(-2);
  const [result, setResult] = useState<VoiceValidationResult | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const recognitionAvailable = useMemo(() => canUseRecognition(), []);

  useEffect(() => {
    setRecognizing(false);
    setVolume(-2);
    setResult(null);
    setMessage(null);
  }, [item.id]);

  useEffect(() => {
    return () => {
      try {
        ExpoSpeechRecognitionModule.abort();
      } catch {
        // The native recognizer may be unavailable in Expo Go or web previews.
      }
    };
  }, []);

  useSpeechRecognitionEvent("start", () => {
    setRecognizing(true);
    setResult(null);
    setMessage(null);
  });

  useSpeechRecognitionEvent("end", () => {
    setRecognizing(false);
  });

  useSpeechRecognitionEvent("result", (event) => {
    const bestTranscript = event.results.find((entry) => entry.transcript)?.transcript ?? "";
    if (!bestTranscript) return;

    const nextResult = validateTranscriptForItem(item, bestTranscript);
    setResult(nextResult);

    if (nextResult.matched) {
      setMessage("The mermaid heard it.");
      ExpoSpeechRecognitionModule.stop();
    } else if (event.isFinal) {
      setMessage("Try the sound once more.");
    }
  });

  useSpeechRecognitionEvent("error", (event) => {
    if (event.error === "aborted") return;
    setRecognizing(false);
    setMessage(friendlyError(event.error));
  });

  useSpeechRecognitionEvent("nomatch", () => {
    setRecognizing(false);
    setMessage("Try the sound once more.");
  });

  useSpeechRecognitionEvent("volumechange", (event) => {
    setVolume(event.value);
  });

  const startListening = async () => {
    if (recognizing) {
      ExpoSpeechRecognitionModule.stop();
      return;
    }

    setResult(null);
    setMessage(null);
    setVolume(-2);

    if (!recognitionAvailable) {
      setMessage("Voice practice is not ready here.");
      return;
    }

    try {
      const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!permission.granted) {
        setMessage("A grown-up needs to turn the microphone on.");
        return;
      }

      ExpoSpeechRecognitionModule.start({
        lang: "en-US",
        interimResults: true,
        maxAlternatives: 3,
        continuous: false,
        contextualStrings: getVoiceContextualStrings(item),
        iosTaskHint: TaskHintIOS.confirmation,
        iosVoiceProcessingEnabled: true,
        androidIntentOptions: {
          EXTRA_LANGUAGE_MODEL:
            RecognizerIntentExtraLanguageModel.LANGUAGE_MODEL_WEB_SEARCH,
          EXTRA_PROMPT: `Say ${item.soundLabel}`,
        },
        volumeChangeEventOptions: {
          enabled: true,
          intervalMillis: 120,
        },
      });
    } catch {
      setRecognizing(false);
      setMessage("Voice practice is resting right now.");
    }
  };

  const meterWidth = `${Math.max(8, Math.min(100, ((volume + 2) / 12) * 100))}%` as DimensionValue;
  const helperText =
    message ??
    (recognizing
      ? "Listening..."
      : result?.matched
        ? "The mermaid heard it."
        : `Say ${item.soundLabel}`);

  return (
    <View style={styles.panel}>
      <View style={styles.copy}>
        <Text style={styles.title}>Voice spell</Text>
        <Text style={styles.helper}>{helperText}</Text>
      </View>
      <Pressable
        onPress={startListening}
        style={[styles.micButton, recognizing && styles.micButtonActive]}
        accessibilityRole="button"
        accessibilityLabel={recognizing ? "Stop listening" : `Say ${item.soundLabel}`}
      >
        <Text style={styles.micIcon}>{recognizing ? "\u25A0" : "\u{1F399}\uFE0F"}</Text>
      </Pressable>
      <View style={styles.meterTrack}>
        <View
          style={[
            styles.meterFill,
            { width: result?.matched ? "100%" : meterWidth },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderColor: "rgba(255,255,255,0.24)",
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 2,
    marginBottom: 12,
    zIndex: 2,
  },
  copy: {
    paddingRight: 62,
  },
  title: {
    color: "rgba(255,255,255,0.86)",
    fontSize: 13,
    fontWeight: "700",
  },
  helper: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 13,
    fontWeight: "500",
    marginTop: 2,
  },
  micButton: {
    position: "absolute",
    right: 12,
    top: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  micButtonActive: {
    backgroundColor: "rgba(232,160,191,0.96)",
  },
  micIcon: {
    color: "rgba(27,58,107,1)",
    fontSize: 18,
    fontWeight: "800",
  },
  meterTrack: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 6,
    overflow: "hidden",
    marginTop: 9,
  },
  meterFill: {
    height: "100%",
    backgroundColor: "rgba(232,160,191,1)",
    borderRadius: 6,
  },
});
