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
const ARCH_LEFT = 38;
const ARCH_RIGHT = VW - ARCH_LEFT; // 282
const ARCH_BOTTOM = 240;
const ARCH_APEX_Y = 38;
const APEX_X = VW / 2;

// Each side is a single cubic Bézier from base → apex
// Path drawn from bottom-LEFT, up to APEX, then down to bottom-RIGHT
// so the depleting trace shrinks from the right end first.
const ARCH_PATH = [
  `M ${ARCH_LEFT} ${ARCH_BOTTOM}`,
  // Left side up to apex (vertical at base, curving inward toward apex)
  `C ${ARCH_LEFT} ${ARCH_BOTTOM - 130}, ${APEX_X - 50} ${ARCH_APEX_Y + 30}, ${APEX_X} ${ARCH_APEX_Y}`,
  // Right side down from apex (curving outward, vertical at base)
  `C ${APEX_X + 50} ${ARCH_APEX_Y + 30}, ${ARCH_RIGHT} ${ARCH_BOTTOM - 130}, ${ARCH_RIGHT} ${ARCH_BOTTOM}`,
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
          {/* glow halo */}
          <Path
            d={ARCH_PATH}
            stroke={traceColor}
            strokeOpacity={0.35}
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
