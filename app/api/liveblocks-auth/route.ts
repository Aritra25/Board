import { Liveblocks } from "@liveblocks/node";
import { ConvexHttpClient } from "convex/browser";

import { api } from "@/convex/_generated/api";
import { auth, currentUser } from "@clerk/nextjs/server";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const liveblocks = new Liveblocks({
  secret: process.env.LIVE_BLOCKS_SECRET_KEY!,
});

export async function POST(request: Request) {
    // try {
      // Authenticate the user using Clerk
      const authorization = await auth();
      const user = await currentUser();
  
      if (!authorization || !user) {
        return new Response("Unauthorized", { status: 403 });
      }
  
      const { room } = await request.json();
  
      // Fetch the board information using Convex
      const board = await convex.query(api.board.get, { id: room });

    //   console.log("Auth Info")
  
      // Check if the board's organization ID matches the user's organization ID
      if (board?.orgId !== authorization.orgId) {
        return new Response("Unauthorized", { status: 403 });
      }
  
      // Prepare the user info for Liveblocks
      const userInfo = {
        name: user.firstName || "anonymous",
        picture: user.imageUrl,
      };
  
      // Create a session in Liveblocks
      const session = liveblocks.prepareSession(user.id, { userInfo });
  
      // Allow the user full access to the room
    //   if (room) {
        session.allow(room, session.FULL_ACCESS);
    //   }
  
      // Authorize the session and return the response
      const { status, body } = await session.authorize();
      return new Response(body, { status });
  
    // } catch (error) {
    //   console.error("Error in POST handler:", error);
    //   return new Response("Internal Server Error", { status: 500 });
    // }
  }