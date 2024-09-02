import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import React from "react";

import {
  Camera,
  Color,
  Layer,
  LayerType,
  PathLayer,
  Point,
  Side,
  XYWH,
} from "@/types/canvas";

const COLORS = ["#DC2626", "#D97706", "#059669", "#7C3AED", "#DB2777"];

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function connectionIdToColor(connectionId: number): string {
  return COLORS[connectionId % COLORS.length];
}

export function pointerEventToCanvasPoint(
  e: React.PointerEvent,
  camera: Camera
) {
  return {
    x: Math.round(e.clientX) - camera.x,
    y: Math.round(e.clientY) - camera.y,
  };
}

export function colorToCss(color: Color) {
  return `#${color.r.toString(16).padStart(2, "0")}${color.g.toString(16).padStart(2, "0")}${color.b.toString(16).padStart(2, "0")}`;
}

export function resizeBounds(bounds: XYWH, corner: Side, point: Point): XYWH {
  const result = {
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
  };

  if ((corner & Side.Left) === Side.Left) {
    const newRight = bounds.x + bounds.width;
    result.x = Math.min(point.x, newRight);
    result.width = Math.abs(newRight - point.x);
  }

  if ((corner & Side.Top) === Side.Top) {
    const newBottom = bounds.y + bounds.height;
    result.y = Math.min(point.y, newBottom);
    result.height = Math.abs(newBottom - point.y);
  }

  if ((corner & Side.Right) === Side.Right) {
    result.width = Math.abs(point.x - bounds.x);
  }

  if ((corner & Side.Bottom) === Side.Bottom) {
    result.height = Math.abs(point.y - bounds.y);
  }

  return result;
}

export function findIntersectingLayersWithRectangle(
  layerIds: readonly string[],
  layers: ReadonlyMap<string, Layer>,
  a: Point,
  b: Point
) {
  const rect = {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    width: Math.abs(a.x - b.x),
    height: Math.abs(a.y - b.y),
  };

  const ids: string[] = [];

  for (const layerId of layerIds) {
    const layer = layers.get(layerId);

    if (layer == null) {
      continue;
    }

    const { x, y, height, width } = layer;

    if (
      rect.x + rect.width > x &&
      rect.x < x + width &&
      rect.y + rect.height > y &&
      rect.y < y + height
    ) {
      ids.push(layerId);
    }
  }

  return ids;
}

export function getContrastingTextColor(color: Color) {
  const luminance = 0.299 * color.r + 0.587 * color.g + 0.114 * color.b;

  return luminance > 182 ? "black" : "white";
}

// import { LayerType, PathLayer, Color } from "@/types/canvas";

export function penPointsToPathLayer(
  points: [number, number, number?][], // Assuming points could optionally have pressure
  color: Color
): PathLayer {
  if (points.length < 2) {
    throw new Error("Can't transform points with less than 2 points");
  }

  let left = Number.POSITIVE_INFINITY;
  let right = Number.NEGATIVE_INFINITY;
  let top = Number.POSITIVE_INFINITY;
  let bottom = Number.NEGATIVE_INFINITY;

  for (const [x, y] of points) {
    if (x < left) left = x;
    if (x > right) right = x;
    if (y < top) top = y;
    if (y > bottom) bottom = y;
  }

  return {
    type: LayerType.Path,
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
    fill: color,
    points: points.map(([x, y, pressure = 1]) => [x - left, y - top, pressure]), // Default pressure to 1 if not provided
  };
}


export function getSvgPathFromStroke(stroke: number[][]) {
  if (!stroke.length) return "";

  // Start path with "M" command to move to the first point
  const d = stroke.reduce<string[]>((acc, [x0, y0], i, arr) => {
    if (i === 0) {
      acc.push("M", x0.toString(), y0.toString()); // Move to the first point
    } else {
      const [x1, y1] = arr[i];
      const midX = (x0 + x1) / 2;
      const midY = (y0 + y1) / 2;

      // Add quadratic curve command "Q"
      acc.push("Q", x0.toString(), y0.toString(), midX.toString(), midY.toString());
    }
    return acc;
  }, []);

  d.push("Z"); // Close the path if needed
  return d.join(" ");
}
