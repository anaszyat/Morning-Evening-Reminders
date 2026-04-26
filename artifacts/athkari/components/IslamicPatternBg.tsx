import React from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import Svg, { Defs, Pattern, Polygon, Line, Rect } from "react-native-svg";

function starPoints(cx: number, cy: number, R: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 16; i++) {
    const a = (i * Math.PI) / 8 - Math.PI / 2;
    const radius = i % 2 === 0 ? R : r;
    pts.push(
      `${(cx + radius * Math.cos(a)).toFixed(3)},${(cy + radius * Math.sin(a)).toFixed(3)}`
    );
  }
  return pts.join(" ");
}

function diamond(cx: number, cy: number, d: number): string {
  return `${cx - d},${cy} ${cx},${cy - d} ${cx + d},${cy} ${cx},${cy + d}`;
}

type Props = {
  isDark: boolean;
};

export function IslamicPatternBg({ isDark }: Props) {
  const { width, height } = useWindowDimensions();

  const T = 80;
  const R = 12;
  const r = 5;
  const C = 8;

  const color = isDark ? "#c9a550" : "#1a6b55";
  const opacity = isDark ? 0.11 : 0.14;
  const sw = 0.75;

  const stars: [number, number][] = [
    [T / 2, T / 2],
    [0, 0], [T, 0], [0, T], [T, T],
    [T / 2, 0], [T / 2, T],
    [0, T / 2], [T, T / 2],
  ];

  const diamonds: [number, number][] = [
    [T / 2 + T / 4, T / 2],
    [T / 2 - T / 4, T / 2],
    [T / 2, T / 2 + T / 4],
    [T / 2, T / 2 - T / 4],
    [T / 4, 0], [3 * T / 4, 0],
    [T / 4, T], [3 * T / 4, T],
    [0, T / 4], [0, 3 * T / 4],
    [T, T / 4], [T, 3 * T / 4],
  ];

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={width} height={height}>
        <Defs>
          <Pattern
            id="islamic-bg"
            x="0"
            y="0"
            width={T}
            height={T}
            patternUnits="userSpaceOnUse"
          >
            {stars.map(([cx, cy], i) => (
              <Polygon
                key={`s${i}`}
                points={starPoints(cx, cy, R, r)}
                fill="none"
                stroke={color}
                strokeWidth={sw}
              />
            ))}
            {diamonds.map(([cx, cy], i) => (
              <Polygon
                key={`d${i}`}
                points={diamond(cx, cy, C)}
                fill="none"
                stroke={color}
                strokeWidth={sw}
              />
            ))}
          </Pattern>
        </Defs>
        <Rect
          width={width}
          height={height}
          fill="url(#islamic-bg)"
          opacity={opacity}
        />
      </Svg>
    </View>
  );
}
