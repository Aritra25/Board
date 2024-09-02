"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  useHistory,
  useCanRedo,
  useCanUndo,
  useMutation,
  useStorage,
  useOthersMapped,
} from "@liveblocks/react";
import { nanoid } from "nanoid";
import { Info } from "./Info";
import { Participations } from "./Participants";
import { Toolbar } from "./toolbar";
import { useSelf } from "@liveblocks/react";
import {
  CanvasMode,
  CanvaState,
  Color,
  LayerType,
  Point,
  Side,
  XYWH,
} from "@/types/canvas";
import { CursorsPresence } from "./cursors-presence";
import {
  colorToCss,
  connectionIdToColor,
  findIntersectingLayersWithRectangle,
  penPointsToPathLayer,
  pointerEventToCanvasPoint,
  resizeBounds,
} from "@/lib/utils";
import { LiveObject } from "@liveblocks/client";
import { LayerPreview } from "./layer-preview";
import { SelectionBox } from "./selection-box";
import { SelectionTools } from "./selection-tools";
import { Path } from "./path";
import { useDisableScrollBounce } from "@/hooks/use-disable-bounce";
import { useDeleteLayers } from "@/hooks/use-delete-layers";

const MAX_LAYERS = 100;

interface CanvasProps {
  boardId: string;
}

export const Canvas = ({ boardId }: CanvasProps) => {
  const [canvasState, setCanvasState] = useState<CanvaState>({
    mode: CanvasMode.None,
  });

  const layerIds = useStorage((root) => root.layerIds);
  const pencilDrafts = useSelf((me) => me.presence.pencilDraft)
  const [camera, setCamera] = useState({ x: 0, y: 0 });
  const [lastUsedColor, setLastUsedColor] = useState<Color>({
    r: 0,
    g: 0,
    b: 0,
  });

  useDisableScrollBounce();
  const history = useHistory();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  const insertLayer = useMutation(
    (
      { storage, setMyPresence },
      layerType:
        | LayerType.Ellipse
        | LayerType.Rectangle
        | LayerType.Text
        | LayerType.Note,
      position: Point
    ) => {
      const liveLayers = storage.get("layers");

      if (liveLayers.size >= MAX_LAYERS) return;

      const liveLayerIds = storage.get("layerIds");
      const layerId = nanoid();
      const layer = new LiveObject({
        type: layerType,
        x: position.x,
        y: position.y,
        height: 100,
        width: 100,
        fill: lastUsedColor,
      });

      liveLayerIds.push(layerId);
      liveLayers.set(layerId, layer);

      setMyPresence({ selection: [layerId] }, { addToHistory: true });
      setCanvasState({ mode: CanvasMode.None });
    },
    [lastUsedColor]
  );

  const translateSelectLayers = useMutation(
    ({ storage, self }, point: Point) => {
      if (canvasState.mode !== CanvasMode.Translating) {
        return;
      }

      const offset = {
        x: point.x - canvasState.current!.x,
        y: point.y - canvasState.current!.y,
      };

      const liveLayers = storage.get("layers");

      for (const id of self.presence.selection) {
        const layer = liveLayers.get(id);

        if (layer) {
          layer.update({
            x: layer.get("x") + offset.x,
            y: layer.get("y") + offset.y,
          });
        }
      }
      setCanvasState({ mode: CanvasMode.Translating, current: point });
    },
    [canvasState]
  );

  const unSelectLayers = useMutation(({ self, setMyPresence }) => {
    if (self.presence.selection.length > 0) {
      setMyPresence({ selection: [] }, { addToHistory: true });
    }
  }, []);

  const updateSelectionNet = useMutation(
    ({ storage, setMyPresence }, current: Point, origin: Point) => {
      const layers = storage.get("layers").toImmutable();

      setCanvasState({
        mode: CanvasMode.SelectionNet,
        origin,
        current,
      });

      const ids = findIntersectingLayersWithRectangle(
        layerIds!,
        layers,
        origin,
        current
      );

      setMyPresence({ selection: ids });
    },
    [layerIds]
  );

  const startMultiSelection = useCallback((current: Point, origin: Point) => {
    if (Math.abs(current.x - origin.x) + Math.abs(current.y + origin.y) > 5) {
      setCanvasState({
        mode: CanvasMode.SelectionNet,
        origin,
        current,
      });
    }
  }, []);

  const continueDrawing = useMutation(
    ({ self, setMyPresence }, point: Point, e: React.PointerEvent) => {
      const { pencilDraft } = self.presence;
  
      if (
        canvasState.mode !== CanvasMode.Pencil ||
        e.buttons !== 1 ||  // Allow drawing while the left button is pressed
        pencilDraft == null
      ) {
        return;
      }
  
      setMyPresence({
        cursor: point,
        pencilDraft:
          pencilDraft.length === 1 &&
          pencilDraft[0][0] === point.x &&
          pencilDraft[0][1] === point.y
            ? pencilDraft
            : [...pencilDraft, [point.x, point.y, e.pressure]],
      });
    },
    [canvasState.mode]
  );
  

  const insertPath = useMutation(
    ({ storage, self, setMyPresence }) => {
      const liveLayers = storage.get("layers");
      const { pencilDraft } = self.presence;
  
      if (
        pencilDraft == null ||
        pencilDraft.length < 2 ||
        liveLayers.size >= MAX_LAYERS
      ) {
        setMyPresence({ pencilDraft: null });
        return;
      }
  
      const id = nanoid();
      const pathLayer = penPointsToPathLayer(pencilDraft, lastUsedColor);
  
      liveLayers.set(id, new LiveObject(pathLayer));
  
      const liveLayerIds = storage.get("layerIds");
      liveLayerIds.push(id);
  
      setMyPresence({ pencilDraft: null });
      setCanvasState({ mode: CanvasMode.Pencil });
    },
    [lastUsedColor]
  );
  
  const startDrawing = useMutation(
    ({ setMyPresence }, point: Point, pressure: number) => {
      setMyPresence({
        pencilDraft: [[point.x, point.y, pressure]],
        pencilColor: lastUsedColor,
      });
    },
    [lastUsedColor]
  );

  const resizeSelectedLayer = useMutation(
    ({ storage, self }, point: Point) => {
      if (canvasState.mode !== CanvasMode.Resizing) return;

      const bounds = resizeBounds(
        canvasState.initialBounds!,
        canvasState.corner!,
        point
      );

      const liveLayers = storage.get("layers");
      const layer = liveLayers.get(self.presence.selection[0]);

      if (layer) {
        layer.update(bounds);
      }
    },
    [canvasState]
  );

  const onResizeHandlerPointerDown = useCallback(
    (corner: Side, initialBounds: XYWH) => {
      history.pause();
      setCanvasState({
        mode: CanvasMode.Resizing,
        initialBounds,
        corner,
      });
    },
    [history]
  );

  const onWheel = useCallback((e: React.WheelEvent) => {
    setCamera((camera) => ({
      x: camera.x - e.deltaX,
      y: camera.y - e.deltaY,
    }));
  }, []);

  const onPointerMove = useMutation(
    ({ setMyPresence }, e: React.PointerEvent) => {
      e.preventDefault();

      const current = pointerEventToCanvasPoint(e, camera);

      if (canvasState.mode === CanvasMode.Pressing) {
        startMultiSelection(current, canvasState.origin!);
      } else if (canvasState.mode === CanvasMode.SelectionNet) {
        updateSelectionNet(current, canvasState.origin!);
      } else if (canvasState.mode === CanvasMode.Translating) {
        translateSelectLayers(current);
      } else if (canvasState.mode === CanvasMode.Resizing) {
        resizeSelectedLayer(current);
      } else if (canvasState.mode === CanvasMode.Pencil) {
        continueDrawing(current, e);
      }

      setMyPresence({ cursor: current });
    },
    [
      canvasState,
      resizeSelectedLayer,
      translateSelectLayers,
      camera,
      startMultiSelection,
      updateSelectionNet,
      continueDrawing,
    ]
  );

  const onPointerLeave = useMutation(({ setMyPresence }) => {
    setMyPresence({ cursor: null });
  }, []);

  const onPointerUp = useMutation(
    ({}, e: React.PointerEvent) => {
      const point = pointerEventToCanvasPoint(e, camera);

      if (
        canvasState.mode === CanvasMode.None ||
        canvasState.mode === CanvasMode.Pressing
      ) {
        unSelectLayers();

        setCanvasState({
          mode: CanvasMode.None,
        });
      } else if (canvasState.mode === CanvasMode.Pencil) {
        insertPath();
      } else if (canvasState.mode === CanvasMode.Inserting) {
        insertLayer(canvasState.layerType!, point);
      } else {
        setCanvasState({ mode: CanvasMode.None });
      }
      history.resume();
    },
    [camera, canvasState, history, insertLayer, unSelectLayers]
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      const point = pointerEventToCanvasPoint(e, camera);

      switch (canvasState.mode) {
        case CanvasMode.Pressing:
          // No action needed when pressing
          return;

        case CanvasMode.Inserting:
          // Start inserting a new layer at the clicked position
          insertLayer(canvasState.layerType, point);
          break;

        // Additional modes can be handled here
        // Example: Case for drawing (uncomment and implement if needed)
        case CanvasMode.Pencil:
          // setCanvasState({ origin: point, mode: CanvasMode.Drawing });
          // console.log("Drawing")
          startDrawing(point, e.pressure);
          break;

        default:
          // Handle other modes (e.g., starting selection, translating)
          setCanvasState({ origin: point, mode: CanvasMode.Pressing });
          break;
      }
    },
    [camera, canvasState.mode, insertLayer, setCanvasState, startDrawing]
  );

  const selections = useOthersMapped((other) => other.presence.selection);

  const onLayerPointerDown = useMutation(
    ({ self, setMyPresence }, e: React.PointerEvent, layerId: string) => {
      if (
        canvasState.mode === CanvasMode.Pencil ||
        canvasState.mode === CanvasMode.Inserting
      )
        return;

      history.pause();
      e.stopPropagation();

      const point = pointerEventToCanvasPoint(e, camera);

      if (!self.presence.selection.includes(layerId)) {
        setMyPresence({ selection: [layerId] }, { addToHistory: true });
      }
      setCanvasState({ mode: CanvasMode.Translating, current: point });
    },
    [canvasState.mode, camera, history]
  );

  const layerIdsToColorSelection = useMemo(() => {
    const layerIdsToColorSelection: Record<string, string> = {};
    for (const user of selections) {
      const [connectionId, selection] = user;

      for (const layerId of selection) {
        layerIdsToColorSelection[layerId] = connectionIdToColor(connectionId);
      }
    }
    return layerIdsToColorSelection;
  }, [selections]);

  const deleteLayers = useDeleteLayers();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent){
      switch (e.key) {
        // case "Backspace":
        //   deleteLayers(); 
        //   break
        case "z": {
          if(e.ctrlKey || e.metaKey){
            if(e.shiftKey){
              history.redo()
            }else{
              history.undo();
            }
            break
          }
        }
      }
    }
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    }
  },[deleteLayers, history])

  return (
    <main className="h-full w-full relative bg-neutral-100 touch-none">
      <Info boardId={boardId} />
      <Participations />
      <Toolbar
        canvaState={canvasState}
        setCanvaState={setCanvasState}
        canRedo={canRedo}
        canUndo={canUndo}
        undo={history.undo}
        redo={history.redo}
      />
      <SelectionTools camera={camera} setLastUsedColor={setLastUsedColor} />
      <svg
        className="h-[100vh] w-[100vw]"
        onWheel={onWheel}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <g style={{ transform: `translate(${camera.x}px, ${camera.y}px)` }}>
          {layerIds?.map((layerId) => (
            <LayerPreview
              key={layerId}
              id={layerId}
              onLayerPointerDown={onLayerPointerDown}
              selectionColor={layerIdsToColorSelection[layerId]}
            />
          ))}
          <SelectionBox
            onResizeHandlerPointerDown={onResizeHandlerPointerDown}
          />
          <CursorsPresence />
          {
            pencilDrafts !== null && pencilDrafts.length > 0 && (
              <Path 
              x={0}
              y={0}
              points={pencilDrafts}
              fill={colorToCss(lastUsedColor)}
              />
            )
          }
        </g>
      </svg>
    </main>
  );
};
