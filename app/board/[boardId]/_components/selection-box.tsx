"use client";

import { useSelectionBounds } from "@/hooks/use-selection-boards";
import { LayerType, Side, XYWH } from "@/types/canvas";
import { useSelf, useStorage } from "@liveblocks/react";
import { memo } from "react";

interface SelectionBoxProps {
  onResizeHandlerPointerDown: (side: Side, initialBounds: XYWH) => void;
}
const HANDLE_WIDTH = 8;

export const SelectionBox = memo(
  ({ onResizeHandlerPointerDown }: SelectionBoxProps) => {
    const soleLayerId = useSelf((me) =>
      me.presence.selection.length === 1 ? me.presence.selection[0] : null
    );

    const isShowingHandles = useStorage(
      (root) =>
        soleLayerId && root.layers.get(soleLayerId)?.type !== LayerType.Path
    );

    const bounds = useSelectionBounds();

    if (!bounds) {
      return null;
    }

    const handles = [
      // Top-left
      {
        x: bounds.x - HANDLE_WIDTH / 2,
        y: bounds.y - HANDLE_WIDTH / 2,
        cursor: "nwse-resize",
        side: Side.Top + Side.Left,
      },
      // Top-center
      {
        x: bounds.x + bounds.width / 2 - HANDLE_WIDTH / 2,
        y: bounds.y - HANDLE_WIDTH / 2,
        cursor: "ns-resize",
        side: Side.Top,
      },
      // Top-right
      {
        x: bounds.x + bounds.width - HANDLE_WIDTH / 2,
        y: bounds.y - HANDLE_WIDTH / 2,
        cursor: "nesw-resize",
        side: Side.Top + Side.Right,
      },
      // Right-center
      {
        x: bounds.x + bounds.width - HANDLE_WIDTH / 2,
        y: bounds.y + bounds.height / 2 - HANDLE_WIDTH / 2,
        cursor: "ew-resize",
        side: Side.Right,
      },
      // Bottom-right
      {
        x: bounds.x + bounds.width - HANDLE_WIDTH / 2,
        y: bounds.y + bounds.height - HANDLE_WIDTH / 2,
        cursor: "nwse-resize",
        side: Side.Bottom + Side.Right,
      },
      // Bottom-center
      {
        x: bounds.x + bounds.width / 2 - HANDLE_WIDTH / 2,
        y: bounds.y + bounds.height - HANDLE_WIDTH / 2,
        cursor: "ns-resize",
        side: Side.Bottom,
      },
      // Bottom-left
      {
        x: bounds.x - HANDLE_WIDTH / 2,
        y: bounds.y + bounds.height - HANDLE_WIDTH / 2,
        cursor: "nesw-resize",
        side: Side.Bottom + Side.Left,
      },
      // Left-center
      {
        x: bounds.x - HANDLE_WIDTH / 2,
        y: bounds.y + bounds.height / 2 - HANDLE_WIDTH / 2,
        cursor: "ew-resize",
        side: Side.Left,
      },
    ];

    return (
      <>
        <rect
          className="fill-transparent stroke-blue-500 stroke-1 pointer-events-none"
          style={{ transform: `translate(${bounds.x}px, ${bounds.y}px)` }}
          x={0}
          y={0}
          width={bounds.width}
          height={bounds.height}
        />
        {isShowingHandles &&
          handles.map((handle, index) => (
            <rect
              key={index}
              className="fill-white stroke-1 stroke-blue-500"
              x={handle.x}
              y={handle.y}
              width={HANDLE_WIDTH}
              height={HANDLE_WIDTH}
              style={{
                cursor: handle.cursor,
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeHandlerPointerDown(handle.side, bounds);
              }}
            />
          ))}
      </>
    );
  }
);

SelectionBox.displayName = "SelectionBox";
