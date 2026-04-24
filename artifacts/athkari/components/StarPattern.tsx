import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Path, G, Defs, Pattern, Rect } from "react-native-svg";

type Props = {
  color?: string;
  opacity?: number;
};

const STAR_PATH =
  "M50 5 L61 39 L97 39 L67 60 L78 95 L50 73 L22 95 L33 60 L3 39 L39 39 Z";

export function StarPattern({ color = "#ffffff", opacity = 0.08 }: Props) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern id="stars" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
            <G opacity={opacity}>
              <Path d={STAR_PATH} fill={color} />
              <Path
                d={STAR_PATH}
                fill={color}
                transform="translate(60 60) scale(0.5)"
              />
            </G>
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#stars)" />
      </Svg>
    </View>
  );
}
