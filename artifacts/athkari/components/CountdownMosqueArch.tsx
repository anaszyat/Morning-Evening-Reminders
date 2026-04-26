import React from "react";
import Svg, { Defs, Ellipse, LinearGradient, Path, Stop } from "react-native-svg";

type Props = {
  width: number;
  height: number;
  /** Fraction REMAINING of the interval to next prayer (1 = full, 0 = empty). */
  progress: number;
  outlineColor?: string;
  traceColor?: string;
  baseColor?: string;
  strokeWidth?: number;
};

const VW = 320;
const VH = 280;

// Arch geometry within the viewBox
const ARCH_LEFT = 30;
const ARCH_RIGHT = VW - ARCH_LEFT; // 290
const ARCH_BOTTOM = 240;
const ARCH_RADIUS = (ARCH_RIGHT - ARCH_LEFT) / 2; // 130
const APEX_X = VW / 2;

// Round (semicircle) arch from bottom-LEFT, up over the top, to bottom-RIGHT.
// As the depleting trace shrinks, the right-end portion disappears first
// leaving the left side visible (matches reference imagery).
const ARCH_PATH = [
  `M ${ARCH_LEFT} ${ARCH_BOTTOM}`,
  `A ${ARCH_RADIUS} ${ARCH_RADIUS} 0 0 1 ${ARCH_RIGHT} ${ARCH_BOTTOM}`,
].join(" ");

const PILLAR_Y = ARCH_BOTTOM + 14;

/**
 * Tall pointed mosque-style arch with a glowing trace that follows
 * the outline and depletes as the next prayer approaches.
 *
 * Three rounded bulb-shaped pillar bases sit at the bottom.
 */
export function CountdownMosqueArch({
  width,
  height,
  progress,
  outlineColor = "rgba(255,255,255,0.22)",
  traceColor = "#ffffff",
  baseColor = "rgba(255,255,255,0.32)",
  strokeWidth = 4,
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
      <Defs>
        <LinearGradient id="archTraceGrad" x1="0" y1="1" x2="0" y2="0">
          <Stop offset="0" stopColor={traceColor} stopOpacity="0.95" />
          <Stop offset="1" stopColor={traceColor} stopOpacity="1" />
        </LinearGradient>
      </Defs>

      {/* Soft outline of the full arch (always visible) */}
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
          {/* outer soft glow */}
          <Path
            d={ARCH_PATH}
            stroke={traceColor}
            strokeOpacity={0.25}
            strokeWidth={strokeWidth + 12}
            fill="none"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={`${visible} 1`}
          />
          {/* inner glow */}
          <Path
            d={ARCH_PATH}
            stroke={traceColor}
            strokeOpacity={0.5}
            strokeWidth={strokeWidth + 6}
            fill="none"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={`${visible} 1`}
          />
          {/* main bright stroke */}
          <Path
            d={ARCH_PATH}
            stroke="url(#archTraceGrad)"
            strokeWidth={strokeWidth + 1}
            fill="none"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={`${visible} 1`}
          />
        </>
      )}

      {/* Three pillar bases (rounded bulb shapes) */}
      <Ellipse
        cx={ARCH_LEFT}
        cy={PILLAR_Y}
        rx={14}
        ry={11}
        fill={baseColor}
      />
      <Ellipse
        cx={APEX_X}
        cy={PILLAR_Y + 1}
        rx={18}
        ry={13}
        fill={baseColor}
      />
      <Ellipse
        cx={ARCH_RIGHT}
        cy={PILLAR_Y}
        rx={14}
        ry={11}
        fill={baseColor}
      />
    </Svg>
  );
}
