import React from "react";
import Svg, { Circle, Path } from "react-native-svg";

type Props = {
  width: number;
  height: number;
  /** Fraction REMAINING of the interval to next prayer (1 = full, 0 = empty). */
  progress: number;
  outlineColor?: string;
  traceColor?: string;
  glowColor?: string;
  baseColor?: string;
  strokeWidth?: number;
  showBases?: boolean;
};

const VW = 240;
const VH = 130;

// Arch geometry within the viewBox
const ARCH_LEFT = 18;
const ARCH_RIGHT = VW - ARCH_LEFT;
const ARCH_BOTTOM = 118;
const ARCH_RADIUS = (ARCH_RIGHT - ARCH_LEFT) / 2;

// Round (semicircle) arch from bottom-LEFT, up over the top, to bottom-RIGHT.
// As the depleting trace shrinks, the right-end portion disappears first
// — the bright stroke recedes counterclockwise as time passes.
const ARCH_PATH = [
  `M ${ARCH_LEFT} ${ARCH_BOTTOM}`,
  `A ${ARCH_RADIUS} ${ARCH_RADIUS} 0 0 1 ${ARCH_RIGHT} ${ARCH_BOTTOM}`,
].join(" ");

/**
 * Semicircular countdown arc with a glowing white/cyan trace
 * that depletes counterclockwise as the next prayer approaches.
 */
export function CountdownMosqueArch({
  width,
  height,
  progress,
  outlineColor = "rgba(255,255,255,0.18)",
  traceColor = "#ffffff",
  glowColor = "#67E8F9",
  baseColor = "rgba(255,255,255,0.45)",
  strokeWidth = 4,
  showBases = true,
}: Props) {
  const p = Math.max(0, Math.min(1, progress));
  const visible = p < 0.0001 ? 0 : p;

  return (
    <Svg
      width={width}
      height={height}
      viewBox={`0 0 ${VW} ${VH}`}
      pointerEvents="none"
    >
      {/* Dim background arc */}
      <Path
        d={ARCH_PATH}
        stroke={outlineColor}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
      />

      {/* Bright depleting trace */}
      {visible > 0 && (
        <>
          <Path
            d={ARCH_PATH}
            stroke={glowColor}
            strokeOpacity={0.3}
            strokeWidth={strokeWidth + 12}
            fill="none"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={`${visible} 1`}
          />
          <Path
            d={ARCH_PATH}
            stroke={glowColor}
            strokeOpacity={0.6}
            strokeWidth={strokeWidth + 6}
            fill="none"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={`${visible} 1`}
          />
          <Path
            d={ARCH_PATH}
            stroke={traceColor}
            strokeWidth={strokeWidth + 1}
            fill="none"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={`${visible} 1`}
          />
        </>
      )}

      {/* Lamp-like dots at the arc endpoints */}
      {showBases && (
        <>
          <Circle cx={ARCH_LEFT} cy={ARCH_BOTTOM} r={5} fill={baseColor} />
          <Circle cx={ARCH_RIGHT} cy={ARCH_BOTTOM} r={5} fill={baseColor} />
        </>
      )}
    </Svg>
  );
}
