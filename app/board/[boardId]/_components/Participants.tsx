"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useOthers, useSelf } from "@liveblocks/react";
import { UserAvatar } from "./user-avatar";
import { connectionIdToColor } from "@/lib/utils";

const MAX_SHOWN_USERS = 2;

export const Participations = () => {
  const users = useOthers();
  const currentUser = useSelf();
  const hasMoreUsers = users.length > MAX_SHOWN_USERS;

  return (
    <div className="absolute h-12 top-2 right-2 bg-white rounded-md p-3 flex items-center shadow-md">
      <div className="flex gap-x-2">
        {users.slice(0, MAX_SHOWN_USERS).map(({ connectionId, info }) => (
          <UserAvatar
            key={connectionId}
            src={info?.picture || ""}
            name={info?.name || "Unknown User"}
            fallback={info?.name?.[0] || "T"}
            borderColor={connectionIdToColor(connectionId)}
          />
        ))}
        {currentUser && (
          <UserAvatar
            borderColor={connectionIdToColor(currentUser.connectionId)}
            src={currentUser.info?.picture || ""}
            name={`${currentUser.info?.name || "You"} (You)`}
            fallback={currentUser.info?.name?.[0] || "Y"}
          />
        )}
      </div>
      {hasMoreUsers && (
        <UserAvatar
          name={`${users.length - MAX_SHOWN_USERS} more`}
          fallback={`+${users.length - MAX_SHOWN_USERS}`}
        />
      )}
    </div>
  );
};

export const ParticipationsSkeleton = () => {
  return (
    <div className="absolute h-12 top-2 right-2 bg-white rounded-md flex items-center shadow-md w-[100px]">
      <Skeleton className="w-8 h-8 rounded-full mr-2" />
      <Skeleton className="w-20 h-4 rounded-md" />
    </div>
  );
};
