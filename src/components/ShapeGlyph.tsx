import React from 'react';
import Svg, { Circle, Path, Polygon, Rect } from 'react-native-svg';

import { GlyphShape } from '../game/collection';
import { CallKind } from '../game/types';

/** Vector glyphs only — no emoji, no tofu-prone text characters. */
export const SIGNAL_SHAPE: Record<CallKind, GlyphShape> = {
  go: 'circle',
  slow: 'square',
  stop: 'hexagon',
  egg: 'diamond',
};

type Props = {
  shape: GlyphShape;
  size?: number;
  color: string;
};

function poly(points: number[][], s: number): string {
  return points.map(p => `${p[0] * s},${p[1] * s}`).join(' ');
}

function ShapeGlyphBase({ shape, size = 22, color }: Props) {
  const s = size;
  switch (shape) {
    case 'square':
      return (
        <Svg width={s} height={s}>
          <Rect x={s * 0.14} y={s * 0.14} width={s * 0.72} height={s * 0.72} fill={color} />
        </Svg>
      );
    case 'hexagon':
      return (
        <Svg width={s} height={s}>
          <Polygon
            points={poly(
              [[0.5, 0.06], [0.93, 0.3], [0.93, 0.7], [0.5, 0.94], [0.07, 0.7], [0.07, 0.3]],
              s,
            )}
            fill={color}
          />
        </Svg>
      );
    case 'diamond':
      return (
        <Svg width={s} height={s}>
          <Polygon points={poly([[0.5, 0.04], [0.96, 0.5], [0.5, 0.96], [0.04, 0.5]], s)} fill={color} />
        </Svg>
      );
    case 'triangle':
      return (
        <Svg width={s} height={s}>
          <Polygon points={poly([[0.5, 0.08], [0.95, 0.9], [0.05, 0.9]], s)} fill={color} />
        </Svg>
      );
    case 'cross':
      return (
        <Svg width={s} height={s}>
          <Rect x={s * 0.38} y={s * 0.06} width={s * 0.24} height={s * 0.88} fill={color} />
          <Rect x={s * 0.06} y={s * 0.38} width={s * 0.88} height={s * 0.24} fill={color} />
        </Svg>
      );
    case 'ring':
      return (
        <Svg width={s} height={s}>
          <Circle
            cx={s / 2}
            cy={s / 2}
            r={s * 0.36}
            stroke={color}
            strokeWidth={s * 0.18}
            fill="none"
          />
        </Svg>
      );
    case 'bar':
      return (
        <Svg width={s} height={s}>
          <Rect x={s * 0.06} y={s * 0.2} width={s * 0.88} height={s * 0.2} fill={color} />
          <Rect x={s * 0.06} y={s * 0.6} width={s * 0.88} height={s * 0.2} fill={color} />
        </Svg>
      );
    case 'pentagon':
      return (
        <Svg width={s} height={s}>
          <Polygon
            points={poly([[0.5, 0.05], [0.96, 0.4], [0.79, 0.95], [0.21, 0.95], [0.04, 0.4]], s)}
            fill={color}
          />
        </Svg>
      );
    case 'star':
      return (
        <Svg width={s} height={s}>
          <Polygon
            points={poly(
              [
                [0.5, 0.03], [0.62, 0.36], [0.97, 0.36], [0.69, 0.57], [0.8, 0.92],
                [0.5, 0.71], [0.2, 0.92], [0.31, 0.57], [0.03, 0.36], [0.38, 0.36],
              ],
              s,
            )}
            fill={color}
          />
        </Svg>
      );
    case 'arch':
      return (
        <Svg width={s} height={s}>
          <Path
            d={`M${s * 0.08} ${s * 0.9} L${s * 0.08} ${s * 0.5} A${s * 0.42} ${s * 0.42} 0 0 1 ${
              s * 0.92
            } ${s * 0.5} L${s * 0.92} ${s * 0.9} L${s * 0.68} ${s * 0.9} L${s * 0.68} ${
              s * 0.52
            } A${s * 0.18} ${s * 0.18} 0 0 0 ${s * 0.32} ${s * 0.52} L${s * 0.32} ${s * 0.9} Z`}
            fill={color}
          />
        </Svg>
      );
    case 'grid':
      return (
        <Svg width={s} height={s}>
          <Rect x={s * 0.08} y={s * 0.08} width={s * 0.36} height={s * 0.36} fill={color} />
          <Rect x={s * 0.56} y={s * 0.08} width={s * 0.36} height={s * 0.36} fill={color} />
          <Rect x={s * 0.08} y={s * 0.56} width={s * 0.36} height={s * 0.36} fill={color} />
          <Rect x={s * 0.56} y={s * 0.56} width={s * 0.36} height={s * 0.36} fill={color} />
        </Svg>
      );
    case 'circle':
    default:
      return (
        <Svg width={s} height={s}>
          <Circle cx={s / 2} cy={s / 2} r={s * 0.42} fill={color} />
        </Svg>
      );
  }
}

export const ShapeGlyph = React.memo(ShapeGlyphBase);
