import { createClient, LiveList , LiveMap, LiveObject,} from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";
import { Color, Layer } from "./types/canvas";
// const client = createClient({
//   authEndpoint: "/api/liveblocks-auth", // Ensure this endpoint is correctly configured
// });

declare global {
  interface Liveblocks {
    // Each user's Presence, for useMyPresence, useOthers, etc.
    Presence: {
      cursor?: { x: number; y: number } | null; // Example: real-time cursor coordinates
      selection: string[];
      pencilDraft: [x: number, y: number, pressure: number][] | null;
      pencilColor: Color | null
    };

    // The Storage tree for the room, for useMutation, useStorage, etc.
    Storage: {
      layers: LiveMap<string,LiveObject<Layer>>; // Example: a conflict-free list
      layerIds: LiveList<string>;
    };

    // Custom user info set when authenticating with a secret key
    UserMeta: {
      id: string; // User ID
      info: {
        name: string; // User's name
        picture?: string; // Optional: User's picture
      };
    };

    // Custom events, for useBroadcastEvent, useEventListener, etc.
    RoomEvent:
      | { type: "PLAY" }
      | { type: "REACTION"; emoji: "🔥" }; // Example: Union of custom events

    // Custom metadata set on threads, for useThreads, useCreateThread, etc.
    ThreadMetadata: {
      x: number; // Example: X coordinate
      y: number; // Example: Y coordinate
    };

    // Custom room info set with resolveRoomsInfo, for useRoomInfo, etc.
    RoomInfo: {
      title: string; // Example: Room title
      url: string;   // Example: Room URL
    };
  }
}

export {};
