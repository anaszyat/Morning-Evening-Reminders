import React, { useMemo } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import Svg, { G, Polygon } from "react-native-svg";

function starPoints(cx: number, cy: number, R: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 16; i++) {
    const a = (i * Math.PI) / 8 - Math.PI / 2;
    const radius = i % 2 === 0 ? R : r;
    pts.push(
      `${(cx + radius * Math.cos(a)).toFixed(2)},${(cy + radius * Math.sin(a)).toFixed(2)}`
    );
  }
  return pts.join(" ");
}

function diamondPoints(cx: number, cy: number, d: number): string {
  return `${cx - d},${cy} ${cx},${cy - d} ${cx + d},${cy} ${cx},${cy + d}`;
}

type Props = {
  isDark: boolean;
};

const STAR_OFFSETS: [number, number][] = [
  [0.5, 0.5],
  [0, 0], [1, 0], [0, 1], [1, 1],
  [0.5, 0], [0.5, 1],
  [0, 0.5], [1, 0.5],
];

const DIAMOND_OFFSETS: [number, number][] = [
  [0.75, 0.5], [0.25, 0.5],
  [0.5, 0.75], [0.5, 0.25],
  [0.25, 0], [0.75, 0],
  [0.25, 1], [0.75, 1],
  [0, 0.25], [0, 0.75],
  [1, 0.25], [1, 0.75],
];

export function IslamicPatternBg({ isDark }: Props) {
  const { width, height } = useWindowDimensions();

  const T = 70;
  const R = 11;
  const r = 4.5;
  const C = 7;

  const color    = isDark ? "#ffd060" : "#083020";
  const sOpacity = isDark ? 0.55 : 0.50;
  const sw       = 2.0;

  const cols = Math.ceil(width  / T) + 2;
  const rows = Math.ceil(height / T) + 2;

  const tiles = useMemo(
    () =>
      Array.from({ length: rows }, (_, row) =>
        Array.from({ length: cols }, (_, col) => ({
          tx: (col - 1) * T,
          ty: (row - 1) * T,
          key: `${row}-${col}`,
        }))
      ).flat(),
    [cols, rows, T]
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={width} height={height}>
        {tiles.map(({ tx, ty, key }) => (
          <G key={key} transform={`translate(${tx},${ty})`}>
            {STAR_OFFSETS.map(([fx, fy], i) => (
              <Polygon
                key={`s${i}`}
                points={starPoints(fx * T, fy * T, R, r)}
                fill="none"
                stroke={color}
                strokeWidth={sw}
                strokeOpacity={sOpacity}
              />
            ))}
            {DIAMOND_OFFSETS.map(([fx, fy], i) => (
              <Polygon
                key={`d${i}`}
                points={diamondPoints(fx * T, fy * T, C)}
                fill="none"
                stroke={color}
                strokeWidth={sw}
                strokeOpacity={sOpacity}
              />
            ))}
          </G>
        ))}
      </Svg>
    </View>
  );
}
