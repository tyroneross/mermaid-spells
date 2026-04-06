import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Ellipse,
  Circle,
  Rect,
  Path,
  G,
} from "react-native-svg";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { useEffect } from "react";
import { TAIL_COLORS } from "../constants/letterData";

const SKIN = "#6B3E26";
const SKIN_HI = "#7D4E34";
const HAIR = "#1A0A00";
const HAIR_HI = "#2D1A0D";

// Locs — each is [startX, startY, cp1X, cp1Y, cp2X, cp2Y, endX, endY]
// Quadratic bezier curves flowing down from the head
const LOCS: [number, number, number, number, number, number][] = [
  // Left side locs
  [38, 28, 30, 48, 28, 68],       // far left, long
  [42, 22, 32, 40, 34, 60],       // left, medium-long
  [48, 18, 38, 36, 36, 55],       // left-center, medium
  [54, 14, 46, 32, 44, 50],       // near-left, shorter
  // Center locs
  [60, 12, 58, 28, 56, 46],       // left of center
  [70, 12, 72, 28, 74, 46],       // right of center
  // Right side locs
  [76, 14, 84, 32, 86, 50],       // near-right, shorter
  [82, 18, 92, 36, 94, 55],       // right-center, medium
  [88, 22, 98, 40, 96, 60],       // right, medium-long
  [92, 28, 100, 48, 102, 68],     // far right, long
];

// Beads at loc tips — [cx, cy, r, color, highlight]
const LOC_BEADS: [number, number, number, string, string][] = [
  [28, 68, 3, "#9B59B6", "#D2B4DE"],    // Purple — far left
  [34, 60, 2.5, "#1CB5E0", "#AED6F1"],  // Teal
  [36, 55, 2.5, "#FF69B4", "#FADBD8"],  // Pink
  [44, 50, 2, "#2ECC71", "#ABEBC6"],    // Green
  [56, 46, 2.5, "#FFD700", "#FFF8DC"],  // Gold
  [74, 46, 2.5, "#E74C3C", "#F5B7B1"],  // Red
  [86, 50, 2, "#FFD700", "#FFF8DC"],    // Gold
  [94, 55, 2.5, "#9B59B6", "#D2B4DE"],  // Purple
  [96, 60, 2.5, "#FF69B4", "#FADBD8"],  // Pink
  [102, 68, 3, "#1CB5E0", "#AED6F1"],   // Teal — far right
];

// U-shaped scale rows — each row: [y, xStart, xEnd, scaleCount]
const SCALE_ROWS: [number, number, number, number][] = [
  [108, 52, 78, 5],
  [116, 50, 80, 6],
  [124, 49, 81, 6],
  [132, 50, 80, 5],
  [140, 52, 78, 4],
];

// Idle sparkle positions
const IDLE_SPARKLES: [number, number][] = [
  [8, 50], [122, 45], [12, 130], [118, 125],
];

interface MermaidProps {
  dancing: boolean;
  heldEmoji: string | null;
  level?: number;
}

export default function Mermaid({ dancing, heldEmoji, level = 0 }: MermaidProps) {
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const sparkleOp = useSharedValue(0.15);

  const tailColors = TAIL_COLORS[level] || TAIL_COLORS[2];

  useEffect(() => {
    // Idle sparkle twinkle
    sparkleOp.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.1, { duration: 1200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  useEffect(() => {
    if (dancing) {
      translateY.value = withRepeat(
        withSequence(
          withTiming(-14, { duration: 150, easing: Easing.inOut(Easing.ease) }),
          withTiming(-6, { duration: 100, easing: Easing.inOut(Easing.ease) }),
          withTiming(-16, { duration: 120, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 180, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
      rotate.value = withRepeat(
        withSequence(
          withTiming(-10, { duration: 150 }),
          withTiming(10, { duration: 150 }),
          withTiming(-8, { duration: 120 }),
          withTiming(8, { duration: 120 }),
          withTiming(0, { duration: 100 })
        ),
        -1,
        false
      );
    } else {
      rotate.value = withTiming(0, { duration: 300 });
      translateY.value = withRepeat(
        withSequence(
          withTiming(-6, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }
  }, [dancing]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  // Fin gradient matches tail
  const finTop = tailColors[0];
  const finBot = tailColors[1];

  // Generate U-shaped scale arcs for a row
  const renderScaleRow = (y: number, xStart: number, xEnd: number, count: number, rowIdx: number) => {
    const width = xEnd - xStart;
    const scaleW = width / count;
    const offset = rowIdx % 2 === 1 ? scaleW / 2 : 0; // brick-pattern offset
    const paths = [];
    for (let i = 0; i < count; i++) {
      const x1 = xStart + i * scaleW + offset;
      const x2 = x1 + scaleW;
      const xMid = (x1 + x2) / 2;
      // Skip if out of bounds
      if (x2 > xEnd + scaleW / 2) continue;
      paths.push(
        <Path
          key={`sc${rowIdx}-${i}`}
          d={`M${x1} ${y} Q${xMid} ${y - 4} ${x2} ${y}`}
          stroke="rgba(255,255,255,0.25)"
          strokeWidth={0.7}
          fill="none"
        />
      );
    }
    return paths;
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.svgWrap, animatedStyle]}>
        <Svg viewBox="0 0 130 190" width={130} height={190}>
          <Defs>
            <LinearGradient id="tG" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={tailColors[0]} />
              <Stop offset="50%" stopColor={tailColors[1]} />
              <Stop offset="100%" stopColor={tailColors[2]} />
            </LinearGradient>
            <LinearGradient id="tS" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
              <Stop offset="50%" stopColor="rgba(255,255,255,0)" />
              <Stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
            </LinearGradient>
            <RadialGradient id="hG" cx="50%" cy="30%">
              <Stop offset="0%" stopColor={HAIR_HI} />
              <Stop offset="70%" stopColor={HAIR} />
              <Stop offset="100%" stopColor="#000" />
            </RadialGradient>
            <LinearGradient id="fG" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={finTop} />
              <Stop offset="100%" stopColor={finBot} />
            </LinearGradient>
            <LinearGradient id="topG" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#EBB0CC" />
              <Stop offset="100%" stopColor="#E090B5" />
            </LinearGradient>
          </Defs>

          {/* Hair base — rounded top of head */}
          <Ellipse cx={65} cy={24} rx={28} ry={20} fill="url(#hG)" />

          {/* Locs */}
          {LOCS.map(([sx, sy, cpx, cpy, ex, ey], i) => (
            <Path
              key={`loc${i}`}
              d={`M${sx} ${sy} Q${cpx} ${cpy} ${ex} ${ey}`}
              stroke={i % 3 === 0 ? HAIR_HI : HAIR}
              strokeWidth={3.5}
              fill="none"
              strokeLinecap="round"
            />
          ))}

          {/* Loc highlight strands */}
          {LOCS.filter((_, i) => i % 2 === 0).map(([sx, sy, cpx, cpy, ex, ey], i) => (
            <Path
              key={`loch${i}`}
              d={`M${sx + 1} ${sy + 1} Q${cpx + 1} ${cpy + 1} ${ex + 1} ${ey + 1}`}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={1.5}
              fill="none"
              strokeLinecap="round"
            />
          ))}

          {/* Colorful beads at loc tips */}
          {LOC_BEADS.map(([cx, cy, r, color, hi], i) => (
            <G key={`lb${i}`}>
              <Circle cx={cx} cy={cy} r={r} fill={color} stroke="rgba(0,0,0,0.15)" strokeWidth={0.4} />
              <Circle cx={cx - r * 0.2} cy={cy - r * 0.25} r={r * 0.4} fill={hi} opacity={0.7} />
            </G>
          ))}

          {/* White headband */}
          <Path
            d="M36 24 Q50 20 65 19 Q80 20 94 24"
            stroke="white"
            strokeWidth={2.5}
            fill="none"
            strokeLinecap="round"
            opacity={0.85}
          />

          {/* Face */}
          <Ellipse cx={65} cy={46} rx={21} ry={22} fill={SKIN} />
          <Ellipse cx={65} cy={47} rx={19} ry={20} fill={SKIN_HI} />
          <Ellipse cx={65} cy={38} rx={10} ry={5} fill="rgba(255,255,255,0.05)" />

          {/* Eyebrows — softer */}
          <Path d="M52 37 Q58 34 63 37" stroke="#1A0A00" strokeWidth={1.2} fill="none" strokeLinecap="round" />
          <Path d="M67 37 Q72 34 78 37" stroke="#1A0A00" strokeWidth={1.2} fill="none" strokeLinecap="round" />

          {/* Eyes — larger, warmer */}
          {dancing ? (
            <>
              {/* Happy closed eyes — wider arcs */}
              <Path d="M52 43 Q58 38 64 43" stroke="#1A0A00" strokeWidth={2.4} fill="none" strokeLinecap="round" />
              <Path d="M66 43 Q72 38 78 43" stroke="#1A0A00" strokeWidth={2.4} fill="none" strokeLinecap="round" />
            </>
          ) : (
            <>
              {/* Sclera — larger */}
              <Ellipse cx={58} cy={44} rx={7} ry={6} fill="#FFFAF0" />
              <Ellipse cx={72} cy={44} rx={7} ry={6} fill="#FFFAF0" />
              {/* Iris — warm brown, larger */}
              <Circle cx={58} cy={44} r={4.5} fill="#5D3A1A" />
              <Circle cx={72} cy={44} r={4.5} fill="#5D3A1A" />
              {/* Pupil — larger */}
              <Circle cx={58} cy={44} r={2.5} fill="#1A0A00" />
              <Circle cx={72} cy={44} r={2.5} fill="#1A0A00" />
              {/* Main highlight — larger */}
              <Circle cx={60} cy={42.5} r={1.8} fill="#fff" />
              <Circle cx={74} cy={42.5} r={1.8} fill="#fff" />
              {/* Second small highlight */}
              <Circle cx={57} cy={45.5} r={0.7} fill="#fff" opacity={0.6} />
              <Circle cx={71} cy={45.5} r={0.7} fill="#fff" opacity={0.6} />
              {/* Lashes */}
              <Path d="M51 42 L49.5 40" stroke="#1A0A00" strokeWidth={1} strokeLinecap="round" />
              <Path d="M53 41 L52 39" stroke="#1A0A00" strokeWidth={0.8} strokeLinecap="round" />
              <Path d="M79 42 L80.5 40" stroke="#1A0A00" strokeWidth={1} strokeLinecap="round" />
              <Path d="M77 41 L78 39" stroke="#1A0A00" strokeWidth={0.8} strokeLinecap="round" />
            </>
          )}

          {/* Nose */}
          <Path d="M63 50 Q65 52.5 67 50" stroke="#5A3420" strokeWidth={1.1} fill="none" strokeLinecap="round" />

          {/* Blush */}
          <Ellipse cx={49} cy={51} rx={4.5} ry={2.5} fill="#D4826A" opacity={0.3} />
          <Ellipse cx={81} cy={51} rx={4.5} ry={2.5} fill="#D4826A" opacity={0.3} />

          {/* Mouth */}
          {dancing ? (
            <>
              <Path d="M58 56 Q65 64 72 56" stroke="#C44569" strokeWidth={1.4} fill="#E8737D" />
              <Path d="M61 56 Q65 59 69 56" fill="#fff" opacity={0.85} />
            </>
          ) : (
            <Path d="M59 56 Q65 61 71 56" stroke="#C44569" strokeWidth={1.6} fill="none" strokeLinecap="round" />
          )}

          {/* Neck + necklace */}
          <Rect x={59} y={66} width={12} height={7} rx={3} fill={SKIN} />
          <Path d="M54 71 Q65 76 76 71" stroke="#FFD700" strokeWidth={1.3} fill="none" />
          <Circle cx={65} cy={75} r={2.8} fill="#FF69B4" stroke="#FFD700" strokeWidth={0.8} />

          {/* Pink long-sleeve top */}
          <Path
            d="M48 73 Q47 78 47 84 L54 86 Q65 88 76 86 L83 84 Q83 78 82 73 Q74 70 65 70 Q56 70 48 73 Z"
            fill="url(#topG)"
            stroke="#D4789C"
            strokeWidth={0.5}
          />
          {/* Rounded neckline */}
          <Path d="M52 72 Q65 68 78 72" stroke="#D4789C" strokeWidth={0.6} fill="none" />
          {/* Fabric fold lines */}
          <Path d="M54 78 Q65 80 76 78" stroke="rgba(180,100,140,0.25)" strokeWidth={0.5} fill="none" />
          <Path d="M52 82 Q65 84 78 82" stroke="rgba(180,100,140,0.2)" strokeWidth={0.5} fill="none" />
          {/* Sleeve left */}
          <Path
            d="M48 73 Q42 76 38 80 Q40 84 47 84"
            fill="url(#topG)"
            stroke="#D4789C"
            strokeWidth={0.4}
          />
          {/* Sleeve right */}
          <Path
            d="M82 73 Q88 76 92 80 Q90 84 83 84"
            fill="url(#topG)"
            stroke="#D4789C"
            strokeWidth={0.4}
          />
          {/* Top highlight */}
          <Ellipse cx={60} cy={76} rx={5} ry={2.5} fill="rgba(255,255,255,0.1)" />

          {/* Waist */}
          <Path d="M51 86 Q65 90 79 86 L76 100 Q65 103 54 100 Z" fill={SKIN} />

          {/* Arms */}
          {dancing ? (
            <>
              <Path d="M48 77 Q34 60 25 40" stroke={SKIN} strokeWidth={7.5} fill="none" strokeLinecap="round" />
              <Circle cx={23} cy={38} r={4.5} fill={SKIN} />
              <Path d="M82 77 Q96 60 105 40" stroke={SKIN} strokeWidth={7.5} fill="none" strokeLinecap="round" />
              <Circle cx={107} cy={38} r={4.5} fill={SKIN} />
            </>
          ) : (
            <>
              <Path d="M48 80 Q38 88 33 98" stroke={SKIN} strokeWidth={7.5} fill="none" strokeLinecap="round" />
              <Circle cx={32} cy={99} r={4.5} fill={SKIN} />
              <Path d="M82 80 Q92 88 97 98" stroke={SKIN} strokeWidth={7.5} fill="none" strokeLinecap="round" />
              <Circle cx={98} cy={99} r={4.5} fill={SKIN} />
            </>
          )}

          {/* Tail */}
          <Path
            d="M54 100 Q50 115 48 132 Q46 144 51 155 Q58 162 65 160 Q72 162 79 155 Q84 144 82 132 Q80 115 76 100 Z"
            fill="url(#tG)"
          />
          <Path
            d="M54 100 Q50 115 48 132 Q46 144 51 155 Q58 162 65 160 Q72 162 79 155 Q84 144 82 132 Q80 115 76 100 Z"
            fill="url(#tS)"
          />

          {/* U-shaped scale pattern (brick pattern) */}
          {SCALE_ROWS.map(([y, xStart, xEnd, count], rowIdx) =>
            renderScaleRow(y, xStart, xEnd, count, rowIdx)
          )}

          {/* Fins — slightly larger with vein detail */}
          <Path d="M51 155 Q35 170 20 182 Q40 174 55 164 Q60 161 65 160" fill="url(#fG)" />
          <Path d="M79 155 Q95 170 110 182 Q90 174 75 164 Q70 161 65 160" fill="url(#fG)" />
          {/* Fin outlines */}
          <Path d="M51 155 Q35 170 20 182" stroke="rgba(255,255,255,0.15)" strokeWidth={0.5} fill="none" />
          <Path d="M79 155 Q95 170 110 182" stroke="rgba(255,255,255,0.15)" strokeWidth={0.5} fill="none" />
          {/* Fin vein lines — left */}
          <Path d="M48 158 Q38 168 28 176" stroke="rgba(255,255,255,0.12)" strokeWidth={0.4} fill="none" />
          <Path d="M52 160 Q44 170 36 178" stroke="rgba(255,255,255,0.1)" strokeWidth={0.4} fill="none" />
          <Path d="M56 161 Q50 168 44 175" stroke="rgba(255,255,255,0.08)" strokeWidth={0.4} fill="none" />
          {/* Fin vein lines — right */}
          <Path d="M82 158 Q92 168 102 176" stroke="rgba(255,255,255,0.12)" strokeWidth={0.4} fill="none" />
          <Path d="M78 160 Q86 170 94 178" stroke="rgba(255,255,255,0.1)" strokeWidth={0.4} fill="none" />
          <Path d="M74 161 Q80 168 86 175" stroke="rgba(255,255,255,0.08)" strokeWidth={0.4} fill="none" />

          {/* Idle sparkles (always visible, subtle twinkle) */}
          {!dancing &&
            IDLE_SPARKLES.map(([x, y], i) => (
              <Circle key={`is${i}`} cx={x} cy={y} r={1.5} fill="#FFD700" opacity={0.25} />
            ))}

          {/* Dancing sparkles (bright) */}
          {dancing &&
            [
              [10, 28], [120, 22], [6, 65], [124, 60],
              [14, 105], [116, 110], [4, 140], [126, 138],
            ].map(([x, y], i) => (
              <Circle key={`sp${i}`} cx={x} cy={y} r={1.2 + (i % 3)} fill="#FFD700" opacity={0.7} />
            ))}
        </Svg>

        {/* Held emoji */}
        {dancing && heldEmoji && (
          <Text style={styles.heldEmoji}>{heldEmoji}</Text>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 130,
    height: 200,
    alignItems: "center",
    alignSelf: "center",
  },
  svgWrap: {
    width: 130,
    height: 190,
  },
  heldEmoji: {
    position: "absolute",
    top: 0,
    left: -10,
    fontSize: 34,
  },
});
