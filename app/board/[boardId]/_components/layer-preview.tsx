"use client";

import { LayerType } from "@/types/canvas";
import { useStorage } from "@liveblocks/react";
import React, { memo } from "react";
import { Rectangle } from "./rectangle";
import { Ellipse } from "./ellipse";
import { Text } from "./text";
import { Note } from "./note";
import { Path } from "./path";
import { colorToCss } from "@/lib/utils";

interface LayerPreviewProps {
  id: string;
  onLayerPointerDown: (e: React.PointerEvent, layerId: string) => void;
  selectionColor?: string; // Optional with a default value in the component
}

export const LayerPreview = memo(
  ({ id, onLayerPointerDown, selectionColor = "#000" }: LayerPreviewProps) => {
    const layer = useStorage((root) => root.layers.get(id));

    if (!layer) return null;

    const handlePointerDown = (e: React.PointerEvent) => onLayerPointerDown(e, id);

    switch (layer.type) {
      case LayerType.Path:
        return (
          <Path
            points={layer.points}
            onPointerDown={handlePointerDown}
            stroke={selectionColor}
            x={layer.x}
            y={layer.y}
            fill={layer.fill ? colorToCss(layer.fill) : "#000"}
          />
        );
      case LayerType.Note:
        return (
          <Note
            id={id}
            layer={layer}
            onPointerDown={handlePointerDown}
            selectionColor={selectionColor}
          />
        );
      case LayerType.Text:
        return (
          <Text
            id={id}
            layer={layer}
            onPointerDown={handlePointerDown}
            selectionColor={selectionColor}
          />
        );
      case LayerType.Ellipse:
        return (
          <Ellipse
            id={id}
            layer={layer}
            onPointerDown={handlePointerDown}
            selectionColor={selectionColor}
          />
        );
      case LayerType.Rectangle:
        return (
          <Rectangle
            id={id}
            layer={layer}
            onPointerDown={handlePointerDown}
            selectionColor={selectionColor}
          />
        );
      default:
        console.warn("Unknown layer type:", layer.type);
        return null;
    }
  },
  (prevProps, nextProps) => {
    return (
      prevProps.id === nextProps.id &&
      prevProps.selectionColor === nextProps.selectionColor
    );
  }
);

LayerPreview.displayName = "LayerPreview";
