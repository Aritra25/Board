"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Circle,
  MousePointer2,
  Pencil,
  Redo2,
  Square,
  StickyNote,
  Type,
  Undo2,
} from "lucide-react";
import { ToolButton } from "./tool-button";
import { CanvasMode, CanvaState, LayerType } from "@/types/canvas";
import { Caveat } from "next/font/google";

interface ToolbarProps {
  canvaState: CanvaState;
  setCanvaState: (newState: CanvaState) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const Toolbar = ({
  canvaState,
  setCanvaState,
  undo,
  redo,
  canRedo,
  canUndo,
}: ToolbarProps) => {
  return (
    <div className="absolute top-[50%] -translate-y-[50%] left-2 flex flex-col gap-y-4">
      <div className="bg-white rounded-md p-1.5 flex gap-y-1 flex-col shadow-md">
        <ToolButton
          label="Select"
          icon={MousePointer2}
          onClick={() => setCanvaState({ mode: CanvasMode.None })}
          isActive={
            canvaState.mode === CanvasMode.None ||
            canvaState.mode === CanvasMode.Translating ||
            canvaState.mode === CanvasMode.SelectionNet ||
            canvaState.mode === CanvasMode.Pressing ||
            canvaState.mode === CanvasMode.Resizing
          }
        />
        <ToolButton
          label="Text"
          icon={Type}
          onClick={() =>
            setCanvaState({
              mode: CanvasMode.Inserting,
              layerType: LayerType.Text,
            })
          }
          isActive={
            canvaState.mode === CanvasMode.Inserting &&
            canvaState.layerType === LayerType.Text
          }
        />
        <ToolButton
          label="Sticky Note"
          icon={StickyNote}
          onClick={() =>
            setCanvaState({
              mode: CanvasMode.Inserting,
              layerType: LayerType.Note,
            })
          }
          isActive={
            canvaState.mode === CanvasMode.Inserting &&
            canvaState.layerType === LayerType.Note
          }
        />
        <ToolButton
          label="Rectangle"
          icon={Square}
          onClick={() =>
            setCanvaState({
              mode: CanvasMode.Inserting,
              layerType: LayerType.Rectangle,
            })
          }
          isActive={
            canvaState.mode === CanvasMode.Inserting &&
            canvaState.layerType === LayerType.Rectangle
          }
        />
        <ToolButton
          label="Ellipse"
          icon={Circle}
          onClick={() =>
            setCanvaState({
              mode: CanvasMode.Inserting,
              layerType: LayerType.Ellipse,
            })
          }
          isActive={
            canvaState.mode === CanvasMode.Inserting &&
            canvaState.layerType === LayerType.Ellipse
          }
        />

        <ToolButton
          label="Pen"
          icon={Pencil}
          onClick={() =>
            setCanvaState({
              mode: CanvasMode.Pencil
            })
          }
          isActive={
            canvaState.mode === CanvasMode.Pencil
          }
        />
      </div>
      <div className="bg-white rounded-md p-1.5 flex flex-col items-center shadow-md">
        <ToolButton
          label="Undo"
          icon={Undo2}
          onClick={undo}
          isDisabled={!canUndo}
        />
        <ToolButton
          label="Redo"
          icon={Redo2}
          onClick={redo}
          isDisabled={!canRedo}
        />
      </div>
    </div>
  );
};

export const ToolbarSkeleton = () => {
  return (
    <div className="absolute top-[50%] -translate-y-[50%] left-2 flex flex-col gap-y-4 bg-white h-[360px] w-[52px] shadow-md" />
  );
};
