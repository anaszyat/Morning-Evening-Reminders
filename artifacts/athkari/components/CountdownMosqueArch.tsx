import React from "react";
import Svg, { Ellipse, Path } from "react-native-svg";

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
  outlineColor = "rgba(255,255,255,0.18)",
  traceColor = "#ffffff",
  glowColor = "#67E8F9",
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
      {/* Dim background arc */}
      <Path
        d={ARCH_PATH}
        stroke={outlineColor}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
      />

      {/* Bright depleting trace (dashoffset-driven CCW shrink) */}
      {visible > 0 && (
        <>
          {/* outer cyan halo */}
          <Path
            d={ARCH_PATH}
            stroke={glowColor}
            strokeOpacity={0.35}
            strokeWidth={strokeWidth + 14}
            fill="none"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={`${visible} 1`}
          />
          {/* inner cyan glow */}
          <Path
            d={ARCH_PATH}
            stroke={glowColor}
            strokeOpacity={0.65}
            strokeWidth={strokeWidth + 7}
            fill="none"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={`${visible} 1`}
          />
          {/* white core */}
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
