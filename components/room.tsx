"use client";

import { ReactNode } from "react";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react";
import { client } from "@/liveblocks.config"; // Ensure this path is correct
import { Loading } from "@/app/board/[boardId]/_components/loading";
import { LiveList, LiveMap, LiveObject } from "@liveblocks/client";
import { Layer } from "@/types/canvas";

interface RoomProps {
  children: ReactNode;
  roomId: string;
  fallback: NonNullable<ReactNode> | null;
}

const roomId = "liveblocks-tutorial-mAs1XtDnX6NBByo8xiXn4";
const publicApiKey =
  "pk_dev_T2IKGz999r-svrjenkbKTmhbLZNCDZgmBN7jhF2t1209IAAONPcwutNEXj4oQMR5";

export const Room = ({ children, roomId, fallback }: RoomProps) => {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth" throttle={16}>
      <RoomProvider
        id={roomId}
        initialPresence={{ cursor: null, selection: [],pencilColor: null, pencilDraft: null }}
        initialStorage={{
          layers: new LiveMap<string, LiveObject<Layer>>(),
          layerIds: new LiveList<string>([]),
        }}
      >
        <ClientSideSuspense fallback={fallback}>
          {() => children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
};
