import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
  interpolate,
} from "react-native-reanimated";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface BubbleConfig {
  left: string;
  size: number;
  delay: number;
  dur: number;
  opacity: number;
}

const BUBBLES: BubbleConfig[] = Array.from({ length: 14 }, (_, i) => ({
  left: `${3 + ((i * 7 + 11) % 94)}%`,
  size: 5 + (i % 5) * 4,
  delay: i * 550,
  dur: (7 + (i % 4) * 2) * 1000,
  opacity: 0.06 + (i % 3) * 0.03,
}));

function Bubble({ config }: { config: BubbleConfig }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      config.delay,
      withRepeat(
        withTiming(1, { duration: config.dur, easing: Easing.in(Easing.ease) }),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(progress.value, [0, 1], [0, -(SCREEN_HEIGHT + 40)]);
    const scale = interpolate(progress.value, [0, 1], [1, 0.2]);
    const opacity = interpolate(progress.value, [0, 0.1, 0.9, 1], [0, config.opacity, config.opacity * 0.3, 0]);
    return {
      transform: [{ translateY }, { scale }],
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          bottom: -20,
          left: config.left as any,
          width: config.size,
          height: config.size,
          borderRadius: config.size / 2,
          backgroundColor: `rgba(255,255,255,${config.opacity})`,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.06)",
        },
        animatedStyle,
      ]}
    />
  );
}

export default function Bubbles() {
  return (
    <View style={styles.container} pointerEvents="none">
      {BUBBLES.map((config, i) => (
        <Bubble key={i} config={config} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
});
