import React from "react";
import Svg, { Defs, G, LinearGradient, Path, Rect, Stop } from "react-native-svg";

type Props = {
  width?: number;
  height?: number;
  color?: string;
  opacity?: number;
};

/**
 * Decorative mosque arches silhouette for the Mawaqit hero card.
 * Three pointed-arch ogees with central dome and minaret hints.
 */
export function MosqueArches({
  width = 360,
  height = 180,
  color = "#ffffff",
  opacity = 0.12,
}: Props) {
  // Coordinate system: 0..360 wide, 0..180 tall
  const w = 360;
  const h = 180;

  // Arch geometry: three pointed arches
  // Center arch is bigger, side arches smaller
  // Pointed arch path: starts bottom-left, curves up to point, down to bottom-right
  const arch = (cx: number, baseY: number, archW: number, archH: number) => {
    const left = cx - archW / 2;
    const right = cx + archW / 2;
    const top = baseY - archH;
    const c1x = left;
    const c1y = top + archH * 0.05;
    const c2x = cx - archW * 0.18;
    const c2y = top - archH * 0.05;
    const c3x = cx + archW * 0.18;
    const c3y = top - archH * 0.05;
    const c4x = right;
    const c4y = top + archH * 0.05;
    return `M ${left} ${baseY} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${cx} ${top} C ${c3x} ${c3y}, ${c4x} ${c4y}, ${right} ${baseY} Z`;
  };

  // Dome on top of central arch
  const domeCenterX = w / 2;
  const domeBaseY = 30;
  const domeRadius = 28;
  const dome = `M ${domeCenterX - domeRadius} ${domeBaseY} Q ${domeCenterX - domeRadius} ${domeBaseY - domeRadius * 1.4}, ${domeCenterX} ${domeBaseY - domeRadius * 1.5} Q ${domeCenterX + domeRadius} ${domeBaseY - domeRadius * 1.4}, ${domeCenterX + domeRadius} ${domeBaseY} Z`;

  // Minarets — thin tall rectangles with small caps on either side
  const minaretW = 6;
  const minaretH = 100;
  const leftMinaretX = 60;
  const rightMinaretX = w - 60 - minaretW;

  return (
    <Svg
      width={width}
      height={height}
      viewBox={`0 0 ${w} ${h}`}
      style={{ position: "absolute", left: 0, right: 0, bottom: 0, opacity }}
      pointerEvents="none"
    >
      <Defs>
        <LinearGradient id="archFade" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity="0.0" />
          <Stop offset="0.4" stopColor={color} stopOpacity="0.45" />
          <Stop offset="1" stopColor={color} stopOpacity="0.9" />
        </LinearGradient>
      </Defs>

      <G fill="url(#archFade)">
        {/* Side arches */}
        <Path d={arch(80, h, 80, 90)} />
        <Path d={arch(w - 80, h, 80, 90)} />

        {/* Center bigger arch */}
        <Path d={arch(w / 2, h, 140, 130)} />

        {/* Central dome */}
        <Path d={dome} />
        {/* Tiny finial */}
        <Rect
          x={domeCenterX - 1.5}
          y={domeBaseY - domeRadius * 1.6 - 10}
          width={3}
          height={10}
          rx={1}
        />

        {/* Minarets */}
        <Rect x={leftMinaretX} y={h - minaretH} width={minaretW} height={minaretH} />
        <Rect
          x={leftMinaretX - 3}
          y={h - minaretH - 10}
          width={minaretW + 6}
          height={6}
          rx={2}
        />
        <Rect x={rightMinaretX} y={h - minaretH} width={minaretW} height={minaretH} />
        <Rect
          x={rightMinaretX - 3}
          y={h - minaretH - 10}
          width={minaretW + 6}
          height={6}
          rx={2}
        />
      </G>
    </Svg>
  );
}
