import React from "react";
import Svg, { Path } from "react-native-svg";

export type CountdownArcProps = {
  size: number;
  strokeWidth: number;
  /** Fraction REMAINING (1 = just started, 0 = elapsed). */
  progress: number;
  bgColor: string;
  fgColor: string;
};

/**
 * A top semi-circle arc used as a depleting progress ring around the
 * countdown timer. The foreground arc shrinks from a full half-circle
 * (progress = 1) down to nothing (progress = 0) as the next prayer approaches.
 */
export function CountdownArc({ size, strokeWidth, progress, bgColor, fgColor }: CountdownArcProps) {
  const sw = strokeWidth;
  const r = (size - sw) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const p = Math.max(0, Math.min(1, progress));

  const endX = cx - r * Math.cos(p * Math.PI);
  const endY = cy - r * Math.sin(p * Math.PI);

  const bgPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 0 ${cx + r} ${cy}`;
  const showFg = p > 0.001;
  const fgPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 0 ${endX} ${endY}`;

  const viewHeight = size / 2 + sw / 2;

  return (
    <Svg width={size} height={viewHeight} viewBox={`0 0 ${size} ${viewHeight}`}>
      <Path d={bgPath} stroke={bgColor} strokeWidth={sw} strokeLinecap="round" fill="none" />
      {showFg && (
        <Path d={fgPath} stroke={fgColor} strokeWidth={sw} strokeLinecap="round" fill="none" />
      )}
    </Svg>
  );
}
