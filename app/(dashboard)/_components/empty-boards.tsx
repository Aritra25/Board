"use client"

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useOrganization } from "@clerk/nextjs";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const EmptyBoards = () => {

  const router = useRouter();

  const {organization} = useOrganization();
  const {pending,mutate} = useApiMutation(api.board.create);

  const onclick = () => {
    if(!organization)
      return;

    // setPending(true);
    
    mutate({
      orgId: organization.id,
      title: "Untitled"
    })
    .then((id) => {
      toast.success("Board created");
      router.push(`/board/${id}`);
    })
    .catch(() => toast.error("Failed to create board"))
  }

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <Image src="/empty-notes.png" alt="Empty" height={110} width={110} />
      <h2 className="text-2xl font-semibold mt-6">Create your first board</h2>
      <p className="text-muted-foreground text-sm mt-2">
        Start by creating a board for your organisation
      </p>
      <div className="mt-6">
        <Button size="lg" onClick={onclick} disabled={pending}>
            Create board
        </Button>
      </div>
    </div>
  );
};
