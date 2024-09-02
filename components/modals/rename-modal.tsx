"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogClose,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRenameModal } from "@/store/use-rename-modal";
import { FormEventHandler, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

export const RenameModal = () => {
  const { mutate, pending } = useApiMutation(api.board.update);

  const { isOpen, onClose, title, id } = useRenameModal();
  const [title1, setTitle1] = useState(title || "");

  useEffect(() => {
    if (title) {
      setTitle1(title);
    }
  }, [title]);

  const onSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    if (!id || !title1.trim()) {
      toast.error("Invalid board ID or title.");
      return;
    }

    try {
      await mutate({
        id,
        title: title1.trim(), // Trim whitespace to ensure a valid title
      });
      toast.success("Board renamed successfully!");
      onClose();
    } catch (error) {
      console.error("Rename failed:", error);
      toast.error("Failed to rename the board. Please try again.");
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Board Title</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Enter a new title for this board. The title should be concise and descriptive.
        </DialogDescription>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            disabled={pending}
            required
            maxLength={60}
            value={title1}
            placeholder="Board title"
            onChange={(e) => setTitle1(e.target.value)}
            aria-label="Board Title"
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={pending}>
                Cancel
              </Button>
            </DialogClose>
            <Button disabled={pending} type="submit">
              {pending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
