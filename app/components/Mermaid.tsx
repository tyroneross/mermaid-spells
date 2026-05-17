import React, { useEffect } from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

interface MermaidProps {
  dancing: boolean;
  heldEmoji: string | null;
  level?: number;
  variant?: "guide" | "phonogram" | "celebration";
}

const MERMAID_IMAGES: Record<NonNullable<MermaidProps["variant"]>, ImageSourcePropType> = {
  guide: require("../assets/mermaids/mermaid-guide-a.png"),
  phonogram: require("../assets/mermaids/mermaid-guide-phonograms.png"),
  celebration: require("../assets/mermaids/mermaid-group-celebration.png"),
};

function variantForLevel(level: number): NonNullable<MermaidProps["variant"]> {
  return level <= 0 ? "guide" : "phonogram";
}

export default function Mermaid({
  dancing,
  heldEmoji,
  level = 0,
  variant,
}: MermaidProps) {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const scale = useSharedValue(1);
  const sparkleOpacity = useSharedValue(0.2);
  const resolvedVariant = variant ?? variantForLevel(level);
  const isCelebration = resolvedVariant === "celebration";
  const source = MERMAID_IMAGES[resolvedVariant];

  useEffect(() => {
    sparkleOpacity.value = withRepeat(
      withSequence(
        withTiming(0.75, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.2, { duration: 1100, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [sparkleOpacity]);

  useEffect(() => {
    if (dancing) {
      translateY.value = withRepeat(
        withSequence(
          withTiming(-14, { duration: 170, easing: Easing.inOut(Easing.ease) }),
          withTiming(-5, { duration: 120, easing: Easing.inOut(Easing.ease) }),
          withTiming(-16, { duration: 150, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 210, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
      translateX.value = withRepeat(
        withSequence(
          withTiming(-5, { duration: 220, easing: Easing.inOut(Easing.ease) }),
          withTiming(5, { duration: 220, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 180, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      rotate.value = withRepeat(
        withSequence(
          withTiming(-4, { duration: 180 }),
          withTiming(4, { duration: 180 }),
          withTiming(-3, { duration: 140 }),
          withTiming(3, { duration: 140 }),
          withTiming(0, { duration: 120 })
        ),
        -1,
        false
      );
      scale.value = withRepeat(
        withSequence(
          withTiming(1.03, { duration: 220, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 240, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      return;
    }

    translateX.value = withRepeat(
      withSequence(
        withTiming(-3, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        withTiming(3, { duration: 1800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    rotate.value = withTiming(0, { duration: 300 });
    scale.value = withRepeat(
      withSequence(
        withTiming(1.015, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    translateY.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [dancing, rotate, scale, translateX, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
  }));

  const sparkleStyle = useAnimatedStyle(() => ({
    opacity: sparkleOpacity.value,
  }));

  return (
    <View style={[styles.container, isCelebration && styles.containerWide]}>
      <Animated.View style={[styles.card, isCelebration && styles.cardWide, animatedStyle]}>
        <Image source={source} style={styles.image} resizeMode="cover" />
        <View style={styles.glow} />
        <Animated.View style={[styles.sparkles, sparkleStyle]} pointerEvents="none">
          <Text style={[styles.sparkle, styles.sparkleTop]}>✦</Text>
          <Text style={[styles.sparkle, styles.sparkleLeft]}>✧</Text>
          <Text style={[styles.sparkle, styles.sparkleRight]}>✦</Text>
        </Animated.View>
        {heldEmoji && (
          <View style={[styles.heldBadge, isCelebration && styles.heldBadgeWide]}>
            <Text style={styles.heldEmoji}>{heldEmoji}</Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 150,
    height: 208,
    alignItems: "center",
    justifyContent: "center",
  },
  containerWide: {
    width: 270,
    height: 172,
  },
  card: {
    width: 142,
    height: 196,
    borderRadius: 30,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.55)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 8,
  },
  cardWide: {
    width: 260,
    height: 146,
    borderRadius: 24,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  sparkles: {
    ...StyleSheet.absoluteFillObject,
  },
  sparkle: {
    position: "absolute",
    color: "rgba(255,255,255,0.92)",
    fontSize: 18,
    textShadowColor: "rgba(255,255,255,0.8)",
    textShadowRadius: 8,
  },
  sparkleTop: {
    top: 12,
    right: 22,
  },
  sparkleLeft: {
    left: 14,
    top: 82,
    fontSize: 15,
  },
  sparkleRight: {
    right: 12,
    bottom: 58,
    fontSize: 16,
  },
  heldBadge: {
    position: "absolute",
    right: 8,
    bottom: 8,
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 2,
    borderColor: "rgba(123,104,238,0.4)",
  },
  heldBadgeWide: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  heldEmoji: {
    fontSize: 27,
  },
});
