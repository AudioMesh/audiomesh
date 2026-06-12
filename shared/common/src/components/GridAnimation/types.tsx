export type CanvasStrokeStyle = string | CanvasGradient | CanvasPattern;

export interface GridOffset {
  x: number;
  y: number;
}

export interface GridAnimationProps {
  direction?: 'diagonal' | 'up' | 'right' | 'down' | 'left';
  speed?: number;
  borderColor?: CanvasStrokeStyle;
  squareSize?: number;
  hoverFillColor?: CanvasStrokeStyle;
  shape?: 'square' | 'hexagon' | 'circle' | 'triangle';
  hoverTrailAmount?: number;
}
