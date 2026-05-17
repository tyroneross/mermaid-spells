import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type DimensionValue,
} from "react-native";

import {
  learningItems,
  type LearningItem,
  type LearningStage,
} from "../constants/learningItems";
import {
  type LearningProgressMap,
  isReadyForPrerequisite,
} from "../services/masteryEngine";
import { getEligibleLearningItems } from "../services/sessionBuilder";

interface SettingsProgressPanelProps {
  childName: string;
  childAge: number;
  sessionNumber: number;
  learningProgress: LearningProgressMap;
  soundOn: boolean;
  voicePracticeOn: boolean;
  onSetSoundOn: (enabled: boolean) => void;
  onSetVoicePracticeOn: (enabled: boolean) => void;
  onResetProfile: () => void;
  onClose: () => void;
}

interface LevelConfig {
  stage: LearningStage;
  title: string;
  focus: string;
}

interface LevelSummary extends LevelConfig {
  total: number;
  open: number;
  practiced: number;
  ready: number;
  mastered: number;
  status: "Complete" | "Open" | "Locked";
}

const LEVELS: LevelConfig[] = [
  {
    stage: "letter",
    title: "Lowercase sounds",
    focus: "single cursive letters",
  },
  {
    stage: "phonogram-1",
    title: "First key sounds",
    focus: "sh, ch, th, qu",
  },
  {
    stage: "phonogram-2",
    title: "Vowel teams",
    focus: "ai, ee, oa",
  },
  {
    stage: "phonogram-3",
    title: "R sounds",
    focus: "ar, or, er",
  },
  {
    stage: "phonogram-4",
    title: "More vowel teams",
    focus: "au, oo, ue, ie, oy, ou",
  },
  {
    stage: "extension",
    title: "Later sounds",
    focus: "our",
  },
  {
    stage: "word-1",
    title: "First words",
    focus: "am, sat, mat, cat",
  },
  {
    stage: "word-phonogram",
    title: "Sound words",
    focus: "ship, chat, rain, moon",
  },
];

function progressPercent(value: number, total: number): DimensionValue {
  if (total === 0) return "0%";
  return `${Math.round((value / total) * 100)}%`;
}

function itemIsOpen(item: LearningItem, openIds: Set<string>): boolean {
  return openIds.has(item.id);
}

function summarizeLevels(progress: LearningProgressMap): LevelSummary[] {
  const openIds = new Set(getEligibleLearningItems(progress).map((item) => item.id));

  return LEVELS.map((level) => {
    const items = learningItems.filter((item) => item.stage === level.stage);
    const total = items.length;
    const open = items.filter((item) => itemIsOpen(item, openIds)).length;
    const practiced = items.filter((item) => (progress[item.id]?.attempts ?? 0) > 0).length;
    const ready = items.filter((item) => isReadyForPrerequisite(progress[item.id])).length;
    const mastered = items.filter((item) => progress[item.id]?.box === 4).length;
    const status = ready === total && total > 0 ? "Complete" : open > 0 ? "Open" : "Locked";

    return {
      ...level,
      total,
      open,
      practiced,
      ready,
      mastered,
      status,
    };
  });
}

function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <Pressable
      onPress={() => onChange(!value)}
      style={styles.toggleRow}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
    >
      <Text style={styles.toggleLabel}>{label}</Text>
      <View style={[styles.toggleTrack, value && styles.toggleTrackOn]}>
        <View style={[styles.toggleKnob, value && styles.toggleKnobOn]} />
      </View>
    </Pressable>
  );
}

export default function SettingsProgressPanel({
  childName,
  childAge,
  sessionNumber,
  learningProgress,
  soundOn,
  voicePracticeOn,
  onSetSoundOn,
  onSetVoicePracticeOn,
  onResetProfile,
  onClose,
}: SettingsProgressPanelProps) {
  const [confirmReset, setConfirmReset] = useState(false);
  const levelSummaries = useMemo(
    () => summarizeLevels(learningProgress),
    [learningProgress]
  );
  const openIndex = levelSummaries.findIndex((level) => level.status === "Open");
  const incompleteIndex = levelSummaries.findIndex(
    (level) => level.status !== "Complete"
  );
  const activeIndex =
    openIndex >= 0
      ? openIndex
      : incompleteIndex >= 0
        ? incompleteIndex
        : Math.max(0, levelSummaries.length - 1);
  const activeLevel = levelSummaries[activeIndex] ?? levelSummaries[0];
  const totalReady = learningItems.filter((item) =>
    isReadyForPrerequisite(learningProgress[item.id])
  ).length;
  const totalMastered = learningItems.filter(
    (item) => learningProgress[item.id]?.box === 4
  ).length;

  return (
    <View style={styles.overlay}>
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close settings"
      />
      <View style={styles.sheet}>
        <View style={styles.header}>
          <View>
            <Text style={styles.kicker}>Grown-up view</Text>
            <Text style={styles.title}>Settings and progress</Text>
          </View>
          <Pressable
            onPress={onClose}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="Close settings"
          >
            <Text style={styles.closeText}>x</Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.summaryBand}>
            <View>
              <Text style={styles.summaryLabel}>Current level</Text>
              <Text style={styles.summaryTitle}>
                {activeIndex + 1}. {activeLevel.title}
              </Text>
              <Text style={styles.summarySubtext}>{activeLevel.focus}</Text>
            </View>
            <View style={styles.summaryStats}>
              <Text style={styles.statNumber}>{totalReady}</Text>
              <Text style={styles.statLabel}>ready</Text>
              <Text style={styles.statNumber}>{totalMastered}</Text>
              <Text style={styles.statLabel}>mastered</Text>
            </View>
          </View>

          <View style={styles.profileRow}>
            <View style={styles.profilePill}>
              <Text style={styles.profileLabel}>Learner</Text>
              <Text style={styles.profileValue} numberOfLines={1}>
                {childName || "Mermaid reader"}
              </Text>
            </View>
            <View style={styles.profilePill}>
              <Text style={styles.profileLabel}>Age</Text>
              <Text style={styles.profileValue}>{childAge}</Text>
            </View>
            <View style={styles.profilePill}>
              <Text style={styles.profileLabel}>Session</Text>
              <Text style={styles.profileValue}>{sessionNumber}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Settings</Text>
            <ToggleRow label="Sound" value={soundOn} onChange={onSetSoundOn} />
            <ToggleRow
              label="Voice practice"
              value={voicePracticeOn}
              onChange={onSetVoicePracticeOn}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Learning levels</Text>
            {levelSummaries.map((level, index) => (
              <View key={level.stage} style={styles.levelRow}>
                <View style={styles.levelHeader}>
                  <View style={styles.levelTitleWrap}>
                    <Text style={styles.levelNumber}>{index + 1}</Text>
                    <View>
                      <Text style={styles.levelTitle}>{level.title}</Text>
                      <Text style={styles.levelFocus}>{level.focus}</Text>
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.levelStatus,
                      level.status === "Complete" && styles.levelStatusComplete,
                      level.status === "Locked" && styles.levelStatusLocked,
                    ]}
                  >
                    {level.status}
                  </Text>
                </View>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: progressPercent(level.ready, level.total) },
                    ]}
                  />
                </View>
                <Text style={styles.levelMeta}>
                  {level.ready}/{level.total} ready | {level.mastered} mastered |{" "}
                  {level.open} open
                </Text>
              </View>
            ))}
          </View>

          <Pressable
            onPress={() => {
              if (confirmReset) {
                onResetProfile();
                return;
              }
              setConfirmReset(true);
            }}
            style={[styles.resetButton, confirmReset && styles.resetButtonConfirm]}
            accessibilityRole="button"
          >
            <Text style={styles.resetText}>
              {confirmReset ? "Tap again to reset profile" : "Reset profile"}
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 30,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(4,9,25,0.58)",
  },
  sheet: {
    width: "100%",
    maxWidth: 460,
    maxHeight: "88%",
    backgroundColor: "rgba(255,255,255,0.97)",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 18,
    paddingHorizontal: 18,
    paddingBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 18,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  kicker: {
    color: "#7B68EE",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  title: {
    color: "#1B3A6B",
    fontSize: 24,
    fontWeight: "800",
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(27,58,107,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    color: "#1B3A6B",
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 22,
  },
  scroll: {
    width: "100%",
  },
  scrollContent: {
    paddingBottom: 10,
  },
  summaryBand: {
    backgroundColor: "rgba(123,104,238,0.1)",
    borderColor: "rgba(123,104,238,0.16)",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  summaryLabel: {
    color: "#7B68EE",
    fontSize: 12,
    fontWeight: "800",
  },
  summaryTitle: {
    color: "#1B3A6B",
    fontSize: 19,
    fontWeight: "800",
    marginTop: 2,
  },
  summarySubtext: {
    color: "rgba(27,58,107,0.68)",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
  },
  summaryStats: {
    minWidth: 76,
    alignItems: "flex-end",
  },
  statNumber: {
    color: "#1B3A6B",
    fontSize: 19,
    fontWeight: "900",
  },
  statLabel: {
    color: "rgba(27,58,107,0.6)",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 2,
  },
  profileRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  profilePill: {
    flex: 1,
    minWidth: 0,
    backgroundColor: "rgba(27,58,107,0.06)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  profileLabel: {
    color: "rgba(27,58,107,0.58)",
    fontSize: 11,
    fontWeight: "700",
  },
  profileValue: {
    color: "#1B3A6B",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 1,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    color: "#1B3A6B",
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 8,
  },
  toggleRow: {
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: "rgba(27,58,107,0.06)",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  toggleLabel: {
    color: "#1B3A6B",
    fontSize: 15,
    fontWeight: "800",
  },
  toggleTrack: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(27,58,107,0.22)",
    padding: 3,
    justifyContent: "center",
  },
  toggleTrackOn: {
    backgroundColor: "#7B68EE",
  },
  toggleKnob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#fff",
  },
  toggleKnobOn: {
    transform: [{ translateX: 20 }],
  },
  levelRow: {
    borderRadius: 14,
    backgroundColor: "rgba(27,58,107,0.06)",
    padding: 12,
    marginBottom: 9,
  },
  levelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  levelTitleWrap: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  levelNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(123,104,238,0.16)",
    color: "#7B68EE",
    textAlign: "center",
    lineHeight: 28,
    fontSize: 13,
    fontWeight: "900",
  },
  levelTitle: {
    color: "#1B3A6B",
    fontSize: 15,
    fontWeight: "900",
  },
  levelFocus: {
    color: "rgba(27,58,107,0.62)",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 1,
  },
  levelStatus: {
    color: "#7B68EE",
    fontSize: 12,
    fontWeight: "900",
  },
  levelStatusComplete: {
    color: "#1F8F7A",
  },
  levelStatusLocked: {
    color: "rgba(27,58,107,0.42)",
  },
  progressTrack: {
    height: 8,
    borderRadius: 8,
    backgroundColor: "rgba(27,58,107,0.12)",
    marginTop: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 8,
    backgroundColor: "#E8A0BF",
  },
  levelMeta: {
    color: "rgba(27,58,107,0.62)",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 6,
  },
  resetButton: {
    minHeight: 44,
    borderRadius: 14,
    borderColor: "rgba(232,160,191,0.42)",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  resetButtonConfirm: {
    backgroundColor: "rgba(232,160,191,0.16)",
  },
  resetText: {
    color: "#9F3F65",
    fontSize: 14,
    fontWeight: "900",
  },
});
