import React, { useEffect } from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import Svg, { Path, Ellipse, Rect, Line, G } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  interpolate,
} from "react-native-reanimated";

function Fish({
  color,
  size,
  y,
  delay,
  duration,
  direction,
  screenWidth,
}: {
  color: string;
  size: number;
  y: number;
  delay: number;
  duration: number;
  direction: 1 | -1;
  screenWidth: number;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration, easing: Easing.linear }),
        -1,
        false
      )
    );
  }, []);

  const animStyle = useAnimatedStyle(() => {
    const startX = direction === 1 ? -size * 2 : screenWidth + size;
    const endX = direction === 1 ? screenWidth + size : -size * 2;
    const tx = interpolate(progress.value, [0, 1], [startX, endX]);
    const wobble = Math.sin(progress.value * Math.PI * 8) * 4;
    return {
      transform: [
        { translateX: tx },
        { translateY: wobble },
        { scaleX: direction },
      ],
    };
  });

  return (
    <Animated.View
      style={[{ position: "absolute", top: y, width: size * 2, height: size }, animStyle]}
    >
      <Svg viewBox="0 0 40 20" width={size * 2} height={size}>
        {/* Body */}
        <Ellipse cx={20} cy={10} rx={12} ry={7} fill={color} />
        {/* Tail */}
        <Path d="M6 10 L0 3 L0 17 Z" fill={color} opacity={0.8} />
        {/* Eye */}
        <Ellipse cx={26} cy={8} rx={2.5} ry={2.5} fill="#fff" />
        <Ellipse cx={27} cy={8} rx={1.5} ry={1.5} fill="#1A0A00" />
        {/* Stripe */}
        <Path
          d="M16 4 Q20 10 16 16"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth={1.2}
          fill="none"
        />
      </Svg>
    </Animated.View>
  );
}

function LightRays({ screenWidth, screenHeight }: { screenWidth: number; screenHeight: number }) {
  const opacity = useSharedValue(0.04);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.08, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.04, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.raysContainer, animStyle]} pointerEvents="none">
      <Svg
        width={screenWidth}
        height={screenHeight * 0.5}
        viewBox={`0 0 ${screenWidth} ${screenHeight * 0.5}`}
      >
        {[0.15, 0.35, 0.6, 0.8].map((pos, i) => (
          <G key={i}>
            <Line
              x1={pos * screenWidth}
              y1={0}
              x2={pos * screenWidth - 40 + i * 20}
              y2={screenHeight * 0.5}
              stroke="rgba(255,255,255,0.5)"
              strokeWidth={20 + i * 8}
              strokeLinecap="round"
            />
          </G>
        ))}
      </Svg>
    </Animated.View>
  );
}

function Coral() {
  return (
    <View style={styles.coralContainer} pointerEvents="none">
      {/* Left coral cluster */}
      <View style={styles.coralLeft}>
        <Svg viewBox="0 0 80 60" width={80} height={60}>
          {/* Pink coral */}
          <Path
            d="M10 60 Q12 35 8 20 Q6 10 15 8 Q20 6 18 20 Q16 35 20 60"
            fill="#E8A0BF"
            opacity={0.7}
          />
          <Path
            d="M25 60 Q28 30 30 15 Q32 5 38 10 Q35 18 32 30 Q30 45 35 60"
            fill="#F0B8D0"
            opacity={0.6}
          />
          {/* Green seaweed */}
          <Path
            d="M50 60 Q45 40 48 25 Q50 15 52 25 Q55 40 50 60"
            fill="#26A69A"
            opacity={0.5}
          />
          <Path
            d="M60 60 Q58 45 62 30 Q65 20 63 30 Q60 45 65 60"
            fill="#2DD4BF"
            opacity={0.4}
          />
        </Svg>
      </View>
      {/* Right coral cluster */}
      <View style={styles.coralRight}>
        <Svg viewBox="0 0 70 50" width={70} height={50}>
          <Path
            d="M60 50 Q58 30 62 15 Q65 5 60 15 Q55 30 55 50"
            fill="#E8A0BF"
            opacity={0.6}
          />
          <Path
            d="M40 50 Q42 35 38 20 Q36 10 42 18 Q45 30 43 50"
            fill="#F0B8D0"
            opacity={0.5}
          />
          <Path
            d="M15 50 Q18 35 15 22 Q13 15 18 22 Q20 35 20 50"
            fill="#26A69A"
            opacity={0.45}
          />
        </Svg>
      </View>
    </View>
  );
}

export default function SeaCreatures() {
  const { width, height } = useWindowDimensions();

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LightRays screenWidth={width} screenHeight={height} />
      <Fish
        color="#FF8C42"
        size={16}
        y={height * 0.55}
        delay={0}
        duration={12000}
        direction={1}
        screenWidth={width}
      />
      <Fish
        color="#5DADE2"
        size={12}
        y={height * 0.65}
        delay={4000}
        duration={15000}
        direction={-1}
        screenWidth={width}
      />
      <Fish
        color="#FF6B8A"
        size={10}
        y={height * 0.45}
        delay={7000}
        duration={18000}
        direction={1}
        screenWidth={width}
      />
      <Coral />
    </View>
  );
}

const styles = StyleSheet.create({
  raysContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  coralContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  coralLeft: {
    marginLeft: -5,
  },
  coralRight: {
    marginRight: -5,
  },
});
