/**
 * CursiveLetterGame.jsx
 *
 * Original prototype — built at a restaurant for a 4-year-old Montessori student.
 * This is the seed of Mermaid Spells. Preserved as-is for reference.
 *
 * Features:
 * - Cursive letter displayed in Kalam font
 * - 2-4 emoji choices (progressive difficulty)
 * - Black mermaid companion (SVG) with dance animation
 * - Web Audio API sound effects
 * - Underwater theme with bubble animations
 */

import { useState, useCallback, useEffect, useRef } from "react";

const letterData = {
  a: { word: "apple", emoji: "\u{1F34E}" },
  b: { word: "ball", emoji: "\u26BD" },
  c: { word: "cat", emoji: "\u{1F431}" },
  d: { word: "dog", emoji: "\u{1F436}" },
  e: { word: "elephant", emoji: "\u{1F418}" },
  f: { word: "fish", emoji: "\u{1F41F}" },
  g: { word: "goat", emoji: "\u{1F410}" },
  h: { word: "hat", emoji: "\u{1F3A9}" },
  i: { word: "igloo", emoji: "\u{1F3E0}" },
  j: { word: "jellyfish", emoji: "\u{1FABC}" },
  k: { word: "kite", emoji: "\u{1FA81}" },
  l: { word: "lion", emoji: "\u{1F981}" },
  m: { word: "moon", emoji: "\u{1F319}" },
  n: { word: "nest", emoji: "\u{1FABA}" },
  o: { word: "octopus", emoji: "\u{1F419}" },
  p: { word: "pig", emoji: "\u{1F437}" },
  q: { word: "queen", emoji: "\u{1F451}" },
  r: { word: "rainbow", emoji: "\u{1F308}" },
  s: { word: "sun", emoji: "\u2600\uFE0F" },
  t: { word: "tree", emoji: "\u{1F333}" },
  u: { word: "umbrella", emoji: "\u2602\uFE0F" },
  v: { word: "violin", emoji: "\u{1F3BB}" },
  w: { word: "whale", emoji: "\u{1F433}" },
  x: { word: "fox", emoji: "\u{1F98A}" },
  y: { word: "yarn", emoji: "\u{1F9F6}" },
  z: { word: "zebra", emoji: "\u{1F993}" },
};

const allLetters = Object.keys(letterData);

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getDistractors(correct, count) {
  const pool = allLetters.filter((l) => l !== correct);
  return shuffle(pool).slice(0, count);
}

function getDifficulty(round) {
  if (round < 8) return 2;
  if (round < 18) return 3;
  return 4;
}

// Sound Engine (Web Audio API)
function useSoundEngine(enabled) {
  const ctxRef = useRef(null);
  const getCtx = useCallback(() => {
    if (!enabled) return null;
    if (!ctxRef.current || ctxRef.current.state === "closed") {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctxRef.current.state === "suspended") ctxRef.current.resume();
    return ctxRef.current;
  }, [enabled]);

  const playTone = useCallback(
    (freq, duration, type = "sine", vol = 0.13) => {
      const ctx = getCtx();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + duration
      );
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    },
    [getCtx]
  );

  const playCorrect = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    [523, 659, 784, 1047].forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0.1, t + i * 0.11);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.11 + 0.32);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t + i * 0.11);
      osc.stop(t + i * 0.11 + 0.32);
    });
  }, [getCtx]);

  const playWrong = useCallback(() => {
    playTone(220, 0.35, "triangle", 0.08);
    setTimeout(() => playTone(185, 0.45, "triangle", 0.06), 180);
  }, [playTone]);

  const playTap = useCallback(() => {
    playTone(680, 0.07, "sine", 0.05);
  }, [playTone]);

  const playCelebration = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    [523, 587, 659, 784, 880, 1047, 1175, 1319].forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = i % 2 === 0 ? "sine" : "triangle";
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0.09, t + i * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.09 + 0.28);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t + i * 0.09);
      osc.stop(t + i * 0.09 + 0.28);
    });
  }, [getCtx]);

  return { playCorrect, playWrong, playTap, playCelebration };
}

// Mermaid SVG Component
function Mermaid({ dancing, heldEmoji }) {
  const skin = "#6B3E26";
  const skinHi = "#7D4E34";
  const afro = "#1A0A00";
  const afroHi = "#2D1A0D";

  return (
    <div
      style={{
        width: 130,
        height: 190,
        margin: "0 auto",
        position: "relative",
        animation: dancing
          ? "mermaidDance 0.55s ease-in-out infinite"
          : "mermaidFloat 3s ease-in-out infinite",
        transformOrigin: "bottom center",
      }}
    >
      <svg viewBox="0 0 130 190" width="130" height="190">
        <defs>
          <linearGradient id="tG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7B68EE" />
            <stop offset="50%" stopColor="#6A5ACD" />
            <stop offset="100%" stopColor="#483D8B" />
          </linearGradient>
          <linearGradient id="tS" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.08)" />
          </linearGradient>
          <radialGradient id="aG" cx="50%" cy="42%">
            <stop offset="0%" stopColor={afroHi} />
            <stop offset="65%" stopColor={afro} />
            <stop offset="100%" stopColor="#000" />
          </radialGradient>
          <linearGradient id="fG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9B8FE8" />
            <stop offset="100%" stopColor="#6C5CE7" />
          </linearGradient>
        </defs>

        {/* Afro */}
        <ellipse cx="65" cy="34" rx="36" ry="36" fill="url(#aG)" />
        <ellipse cx="65" cy="28" rx="33" ry="31" fill="url(#aG)" />
        {[
          [38, 22, 9],
          [92, 22, 9],
          [34, 40, 8],
          [96, 40, 8],
          [47, 10, 7],
          [83, 10, 7],
          [65, 4, 8],
          [53, 6, 6],
          [78, 6, 6],
          [32, 30, 7],
          [98, 30, 7],
          [42, 48, 6],
          [88, 48, 6],
        ].map(([cx, cy, r], i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill={i % 3 === 0 ? afroHi : afro}
          />
        ))}
        <ellipse
          cx="56"
          cy="16"
          rx="5"
          ry="2.5"
          fill="rgba(255,255,255,0.05)"
        />
        <ellipse
          cx="78"
          cy="20"
          rx="4"
          ry="2"
          fill="rgba(255,255,255,0.04)"
        />

        {/* Gold beads */}
        {[
          [42, 18, 3],
          [85, 13, 2.8],
          [64, 5, 2.5],
          [50, 8, 2],
        ].map(([cx, cy, r], i) => (
          <g key={i}>
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="#FFD700"
              stroke="#DAA520"
              strokeWidth="0.4"
            />
            <circle
              cx={cx}
              cy={cy}
              r={r * 0.45}
              fill="#FFF8DC"
              opacity="0.7"
            />
          </g>
        ))}

        {/* Face */}
        <ellipse cx="65" cy="44" rx="21" ry="22" fill={skin} />
        <ellipse cx="65" cy="45" rx="19" ry="20" fill={skinHi} />
        <ellipse
          cx="65"
          cy="36"
          rx="10"
          ry="5"
          fill="rgba(255,255,255,0.05)"
        />

        {/* Eyebrows */}
        <path
          d="M52 35 Q58 32 63 35"
          stroke="#1A0A00"
          strokeWidth="1.4"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M67 35 Q72 32 78 35"
          stroke="#1A0A00"
          strokeWidth="1.4"
          fill="none"
          strokeLinecap="round"
        />

        {/* Eyes */}
        {dancing ? (
          <>
            <path
              d="M54 41 Q58 37 62 41"
              stroke="#1A0A00"
              strokeWidth="2.2"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M68 41 Q72 37 76 41"
              stroke="#1A0A00"
              strokeWidth="2.2"
              fill="none"
              strokeLinecap="round"
            />
          </>
        ) : (
          <>
            <ellipse cx="58" cy="42" rx="5" ry="4.5" fill="#FFFAF0" />
            <ellipse cx="72" cy="42" rx="5" ry="4.5" fill="#FFFAF0" />
            <circle cx="58" cy="42" r="3.2" fill="#3D1C02" />
            <circle cx="72" cy="42" r="3.2" fill="#3D1C02" />
            <circle cx="58" cy="42" r="1.8" fill="#1A0A00" />
            <circle cx="72" cy="42" r="1.8" fill="#1A0A00" />
            <circle cx="59.5" cy="40.5" r="1.1" fill="#fff" />
            <circle cx="73.5" cy="40.5" r="1.1" fill="#fff" />
            <path
              d="M52 39 L50.5 37"
              stroke="#1A0A00"
              strokeWidth="1"
              strokeLinecap="round"
            />
            <path
              d="M54 38 L53 36"
              stroke="#1A0A00"
              strokeWidth="0.8"
              strokeLinecap="round"
            />
            <path
              d="M78 39 L79.5 37"
              stroke="#1A0A00"
              strokeWidth="1"
              strokeLinecap="round"
            />
            <path
              d="M76 38 L77 36"
              stroke="#1A0A00"
              strokeWidth="0.8"
              strokeLinecap="round"
            />
          </>
        )}

        {/* Nose */}
        <path
          d="M63 48 Q65 50.5 67 48"
          stroke="#5A3420"
          strokeWidth="1.1"
          fill="none"
          strokeLinecap="round"
        />

        {/* Blush */}
        <ellipse cx="50" cy="49" rx="4.5" ry="2.5" fill="#D4826A" opacity="0.3" />
        <ellipse cx="80" cy="49" rx="4.5" ry="2.5" fill="#D4826A" opacity="0.3" />

        {/* Mouth */}
        {dancing ? (
          <>
            <path
              d="M58 54 Q65 62 72 54"
              stroke="#C44569"
              strokeWidth="1.4"
              fill="#E8737D"
            />
            <path d="M61 54 Q65 57 69 54" fill="#fff" opacity="0.85" />
          </>
        ) : (
          <path
            d="M59 54 Q65 59 71 54"
            stroke="#C44569"
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
          />
        )}

        {/* Neck + necklace */}
        <rect x="59" y="64" width="12" height="7" rx="3" fill={skin} />
        <path
          d="M54 69 Q65 74 76 69"
          stroke="#FFD700"
          strokeWidth="1.3"
          fill="none"
        />
        <circle
          cx="65"
          cy="73"
          r="2.8"
          fill="#FF69B4"
          stroke="#FFD700"
          strokeWidth="0.8"
        />

        {/* Shell top */}
        <ellipse
          cx="56"
          cy="78"
          rx="10"
          ry="7.5"
          fill="#E8A0BF"
          stroke="#D4789C"
          strokeWidth="0.7"
        />
        <ellipse
          cx="74"
          cy="78"
          rx="10"
          ry="7.5"
          fill="#E8A0BF"
          stroke="#D4789C"
          strokeWidth="0.7"
        />
        <path
          d="M48 78 Q52 73 56 78 Q60 73 64 78"
          stroke="#D4789C"
          strokeWidth="0.5"
          fill="none"
        />
        <path
          d="M66 78 Q70 73 74 78 Q78 73 82 78"
          stroke="#D4789C"
          strokeWidth="0.5"
          fill="none"
        />
        <ellipse
          cx="56"
          cy="76"
          rx="3.5"
          ry="1.8"
          fill="rgba(255,255,255,0.12)"
        />
        <ellipse
          cx="74"
          cy="76"
          rx="3.5"
          ry="1.8"
          fill="rgba(255,255,255,0.12)"
        />

        {/* Waist */}
        <path
          d="M51 84 Q65 88 79 84 L76 100 Q65 103 54 100 Z"
          fill={skin}
        />

        {/* Arms */}
        {dancing ? (
          <>
            <path
              d="M51 77 Q34 60 25 40"
              stroke={skin}
              strokeWidth="7.5"
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="23" cy="38" r="4.5" fill={skin} />
            <path
              d="M79 77 Q96 60 105 40"
              stroke={skin}
              strokeWidth="7.5"
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="107" cy="38" r="4.5" fill={skin} />
          </>
        ) : (
          <>
            <path
              d="M51 79 Q38 88 33 98"
              stroke={skin}
              strokeWidth="7.5"
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="32" cy="99" r="4.5" fill={skin} />
            <path
              d="M79 79 Q92 88 97 98"
              stroke={skin}
              strokeWidth="7.5"
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="98" cy="99" r="4.5" fill={skin} />
          </>
        )}

        {/* Tail */}
        <path
          d="M54 100 Q50 115 48 132 Q46 144 51 155 Q58 162 65 160 Q72 162 79 155 Q84 144 82 132 Q80 115 76 100 Z"
          fill="url(#tG)"
        />
        <path
          d="M54 100 Q50 115 48 132 Q46 144 51 155 Q58 162 65 160 Q72 162 79 155 Q84 144 82 132 Q80 115 76 100 Z"
          fill="url(#tS)"
        />
        {[106, 115, 124, 133, 142].map((y, i) => (
          <path
            key={i}
            d={`M${51 + i * 0.4} ${y} Q58 ${y - 2.5} 65 ${y} Q72 ${y - 2.5} ${79 - i * 0.4} ${y}`}
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="0.7"
            fill="none"
          />
        ))}

        {/* Fins */}
        <path
          d="M51 155 Q38 168 24 178 Q42 172 55 164 Q60 161 65 160"
          fill="url(#fG)"
        />
        <path
          d="M79 155 Q92 168 106 178 Q88 172 75 164 Q70 161 65 160"
          fill="url(#fG)"
        />
        <path
          d="M51 155 Q38 168 24 178"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="0.5"
          fill="none"
        />
        <path
          d="M79 155 Q92 168 106 178"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="0.5"
          fill="none"
        />

        {/* Sparkles (when dancing) */}
        {dancing &&
          [
            [10, 28],
            [120, 22],
            [6, 65],
            [124, 60],
            [14, 105],
            [116, 110],
            [4, 140],
            [126, 138],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={1.2 + (i % 3)} fill="#FFD700">
              <animate
                attributeName="opacity"
                values="1;0;1"
                dur={`${0.25 + i * 0.08}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="r"
                values={`${1.2 + (i % 3)};${2.5 + (i % 2)};${1.2 + (i % 3)}`}
                dur={`${0.35 + i * 0.06}s`}
                repeatCount="indefinite"
              />
            </circle>
          ))}
        {dancing && (
          <>
            <text x="2" y="50" fontSize="12">
              ✨
              <animate
                attributeName="opacity"
                values="1;0.1;1"
                dur="0.35s"
                repeatCount="indefinite"
              />
            </text>
            <text x="112" y="45" fontSize="12">
              ⭐
              <animate
                attributeName="opacity"
                values="0.8;0;0.8"
                dur="0.4s"
                repeatCount="indefinite"
              />
            </text>
            <text x="0" y="125" fontSize="10">
              💫
              <animate
                attributeName="opacity"
                values="1;0;1"
                dur="0.3s"
                repeatCount="indefinite"
              />
            </text>
            <text x="116" y="120" fontSize="10">
              💖
              <animate
                attributeName="opacity"
                values="0.7;0;0.7"
                dur="0.38s"
                repeatCount="indefinite"
              />
            </text>
          </>
        )}
      </svg>

      {/* Held emoji */}
      {dancing && heldEmoji && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: -10,
            fontSize: 34,
            animation: "heldBounce 0.45s ease-in-out infinite",
            filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.35))",
          }}
        >
          {heldEmoji}
        </div>
      )}
    </div>
  );
}

function Bubbles() {
  const b = Array.from({ length: 14 }, (_, i) => ({
    left: `${3 + ((i * 7 + 11) % 94)}%`,
    size: 5 + (i % 5) * 4,
    delay: i * 0.55,
    dur: 7 + (i % 4) * 2,
    op: 0.06 + (i % 3) * 0.03,
  }));
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      {b.map((v, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            bottom: -20,
            left: v.left,
            width: v.size,
            height: v.size,
            borderRadius: "50%",
            background: `rgba(255,255,255,${v.op})`,
            border: "1px solid rgba(255,255,255,0.06)",
            animation: `bubbleUp ${v.dur}s ease-in ${v.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

// Main Game Component
export default function CursiveLetterGame() {
  const [queue, setQueue] = useState(() => shuffle(allLetters));
  const [round, setRound] = useState(0);
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [dancing, setDancing] = useState(false);
  const [wrong, setWrong] = useState(false);
  const [mode, setMode] = useState("play");
  const [showWord, setShowWord] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const tRef = useRef(null);

  const { playCorrect, playWrong, playTap, playCelebration } =
    useSoundEngine(soundOn);
  const currentLetter = queue[round];

  const buildOptions = useCallback(
    (r) => {
      const letter = queue[r];
      const nd = getDifficulty(r) - 1;
      setOptions(shuffle([letter, ...getDistractors(letter, nd)]));
    },
    [queue]
  );

  useEffect(() => {
    if (mode === "play") buildOptions(round);
  }, [round, mode, buildOptions]);

  const handlePick = (pick) => {
    if (selected) return;
    playTap();
    setSelected(pick);
    setShowWord(true);
    if (pick === currentLetter) {
      setScore((s) => s + 1);
      setStreak((s) => s + 1);
      setDancing(true);
      setTimeout(() => playCorrect(), 80);
      tRef.current = setTimeout(() => {
        setDancing(false);
        setSelected(null);
        setShowWord(false);
        if (round + 1 >= queue.length) {
          setMode("done");
          setTimeout(playCelebration, 150);
        } else setRound((r) => r + 1);
      }, 2200);
    } else {
      setWrong(true);
      setStreak(0);
      setTimeout(() => playWrong(), 80);
      tRef.current = setTimeout(() => {
        setWrong(false);
        setSelected(null);
        setShowWord(false);
        if (round + 1 >= queue.length) setMode("done");
        else setRound((r) => r + 1);
      }, 2600);
    }
  };

  const restart = () => {
    setQueue(shuffle(allLetters));
    setRound(0);
    setScore(0);
    setStreak(0);
    setSelected(null);
    setDancing(false);
    setWrong(false);
    setShowWord(false);
    setMode("play");
  };

  useEffect(
    () => () => {
      if (tRef.current) clearTimeout(tRef.current);
    },
    []
  );

  const diff = getDifficulty(round);
  const diffLabel =
    diff === 2 ? "\u{1F30A} Shallow" : diff === 3 ? "\u{1F420} Deeper" : "\u{1F40B} Deep Sea";

  const shell = {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    position: "relative",
    overflow: "hidden",
    background:
      "linear-gradient(180deg, #0B0E2C 0%, #141852 20%, #1B3A6B 45%, #1F6B8A 70%, #26A69A 100%)",
  };

  if (mode === "done") {
    return (
      <div
        style={{
          ...shell,
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
          textAlign: "center",
        }}
      >
        <Bubbles />
        <div style={{ zIndex: 1 }}>
          <Mermaid dancing heldEmoji="\u{1F3C6}" />
          <h1
            style={{
              fontSize: 34,
              margin: "10px 0 4px",
              fontWeight: 700,
              color: "#fff",
            }}
          >
            \u{1F389} Swim-tastic! \u{1F389}
          </h1>
          <p style={{ fontSize: 22, margin: "0 0 4px", color: "#E0E7FF" }}>
            <strong>{score}</strong> out of <strong>{queue.length}</strong>!
          </p>
          <p
            style={{
              fontSize: 17,
              margin: "0 0 22px",
              color: "rgba(255,255,255,0.6)",
            }}
          >
            {score === queue.length
              ? "Perfect! Letter Mermaid! \u{1F451}"
              : score >= queue.length * 0.8
                ? "Amazing! \u{1F31F}"
                : score >= queue.length * 0.5
                  ? "Great exploring! \u{1F420}"
                  : "Keep swimming! \u{1F41A}"}
          </p>
          <button
            onClick={restart}
            style={{
              padding: "13px 38px",
              fontSize: 21,
              fontWeight: 700,
              border: "none",
              borderRadius: 50,
              cursor: "pointer",
              background: "linear-gradient(135deg, #E8A0BF, #7B68EE)",
              color: "#fff",
              boxShadow: "0 4px 20px rgba(123,104,238,0.4)",
            }}
          >
            \u{1F9DC} Swim Again!
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        ...shell,
        alignItems: "center",
        padding: "10px 10px 16px",
      }}
    >
      <Bubbles />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Kalam:wght@700&display=swap');
        @keyframes mermaidFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes mermaidDance {
          0%{transform:rotate(0) translateY(0)}
          15%{transform:rotate(-10deg) translateY(-14px)}
          30%{transform:rotate(10deg) translateY(-8px)}
          45%{transform:rotate(-8deg) translateY(-16px)}
          60%{transform:rotate(8deg) translateY(-6px)}
          75%{transform:rotate(-5deg) translateY(-12px)}
          100%{transform:rotate(0) translateY(0)}
        }
        @keyframes popIn { from{transform:scale(0.6);opacity:0} to{transform:scale(1);opacity:1} }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-5px)} 80%{transform:translateX(5px)} }
        @keyframes bubbleUp { 0%{transform:translateY(0) scale(1);opacity:0.25} 100%{transform:translateY(-105vh) scale(0.2);opacity:0} }
        @keyframes correctPulse { 0%,100%{box-shadow:0 0 8px rgba(123,104,238,0.3)} 50%{box-shadow:0 0 22px rgba(123,104,238,0.65), 0 0 44px rgba(123,104,238,0.25)} }
        @keyframes heldBounce { 0%,100%{transform:translateY(0) rotate(-5deg)} 50%{transform:translateY(-8px) rotate(5deg)} }
        @keyframes slideDown { from{transform:translateY(-30px);opacity:0} to{transform:translateY(0);opacity:1} }
      `}</style>

      {/* Top bar */}
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 5,
          zIndex: 1,
        }}
      >
        <span
          style={{
            color: "rgba(255,255,255,0.45)",
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          {diffLabel}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: "#FFD700", fontSize: 14, fontWeight: 700 }}>
            ⭐ {score}
            {streak >= 3 ? ` 🔥${streak}` : ""}
          </span>
          <button
            onClick={() => setSoundOn((s) => !s)}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "none",
              borderRadius: 8,
              padding: "3px 7px",
              cursor: "pointer",
              fontSize: 15,
              color: "#fff",
            }}
            title={soundOn ? "Mute" : "Unmute"}
          >
            {soundOn ? "🔊" : "🔇"}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          height: 5,
          borderRadius: 3,
          background: "rgba(255,255,255,0.08)",
          marginBottom: 10,
          overflow: "hidden",
          zIndex: 1,
        }}
      >
        <div
          style={{
            height: "100%",
            borderRadius: 3,
            background: "linear-gradient(90deg, #E8A0BF, #7B68EE)",
            width: `${(round / queue.length) * 100}%`,
            transition: "width 0.4s ease",
          }}
        />
      </div>

      {/* Letter display */}
      <div
        key={round}
        style={{
          background: "rgba(255,255,255,0.94)",
          borderRadius: 24,
          padding: "6px 32px 10px",
          textAlign: "center",
          boxShadow: "0 6px 28px rgba(0,0,0,0.2)",
          animation: selected
            ? wrong
              ? "shake 0.4s ease"
              : "none"
            : "popIn 0.35s ease-out",
          zIndex: 1,
          marginBottom: 10,
          minWidth: 190,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 11,
            color: "#aaa",
            fontWeight: 600,
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          Which picture starts with
        </p>
        <div
          style={{
            fontFamily: "'Kalam', cursive",
            fontSize: 140,
            lineHeight: 1.15,
            color: "#1B3A6B",
            userSelect: "none",
            filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.05))",
          }}
        >
          {currentLetter}
        </div>
      </div>

      {/* Choice buttons */}
      <div
        key={`o-${round}`}
        style={{
          display: "flex",
          gap: 11,
          flexWrap: "wrap",
          justifyContent: "center",
          zIndex: 1,
          animation: "popIn 0.4s ease-out",
          maxWidth: 460,
          marginBottom: 8,
        }}
      >
        {options.map((letter) => {
          const d = letterData[letter];
          const isC = letter === currentLetter;
          const isP = selected === letter;
          const isR = selected !== null;
          let bg = "rgba(255,255,255,0.92)";
          let bdr = "3px solid rgba(123,104,238,0.12)";
          let ex = {};
          if (isR && isC) {
            bg = "rgba(123,104,238,0.1)";
            bdr = "3px solid #7B68EE";
            ex = { animation: "correctPulse 0.6s ease-in-out infinite" };
          } else if (isP && !isC) {
            bg = "#fde8e8";
            bdr = "3px solid #E74C3C";
          }

          return (
            <button
              key={letter}
              onClick={() => handlePick(letter)}
              disabled={isR}
              style={{
                width: options.length <= 3 ? 112 : 96,
                padding: "12px 6px 8px",
                borderRadius: 20,
                border: bdr,
                background: bg,
                cursor: isR ? "default" : "pointer",
                boxShadow: "0 3px 12px rgba(0,0,0,0.08)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                transition: "transform 0.15s, opacity 0.3s",
                opacity: isR && !isC && !isP ? 0.3 : 1,
                ...ex,
              }}
              onMouseEnter={(e) => {
                if (!isR) e.currentTarget.style.transform = "scale(1.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <span style={{ fontSize: options.length <= 3 ? 46 : 38 }}>
                {d.emoji}
              </span>
              {showWord && (
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: isC ? "#7B68EE" : "#bbb",
                    animation: "popIn 0.2s ease-out",
                  }}
                >
                  {d.word}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Mermaid at bottom */}
      <div style={{ zIndex: 1, marginTop: "auto", paddingTop: 2 }}>
        {dancing && (
          <p
            style={{
              textAlign: "center",
              color: "#FFD700",
              fontSize: 17,
              fontWeight: 700,
              margin: "0 0 3px",
              animation: "slideDown 0.3s ease-out",
              textShadow: "0 1px 6px rgba(0,0,0,0.4)",
            }}
          >
            {
              ["Yay! 🎉", "Amazing! 🌟", "You rock! 💫", "Splash! 🐬", "Wow! ✨"][
                round % 5
              ]
            }
          </p>
        )}
        {wrong && (
          <p
            style={{
              textAlign: "center",
              color: "#FFB6C1",
              fontSize: 15,
              fontWeight: 600,
              margin: "0 0 3px",
              animation: "slideDown 0.3s ease-out",
            }}
          >
            It was <strong>{letterData[currentLetter].word}</strong>
            {letterData[currentLetter].emoji}
          </p>
        )}
        <Mermaid
          dancing={dancing}
          heldEmoji={dancing ? letterData[currentLetter].emoji : null}
        />
      </div>

      <p
        style={{
          color: "rgba(255,255,255,0.25)",
          fontSize: 10,
          marginTop: 4,
          zIndex: 1,
        }}
      >
        {round + 1} / {queue.length}
      </p>
    </div>
  );
}
