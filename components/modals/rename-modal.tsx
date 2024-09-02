"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogClose, DialogTitle } from "@/components/ui/dialog";
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
    const [title1, setTitle1] = useState(title);

    useEffect(() => {
        setTitle1(title);
    }, [title]);

    const onSubmit: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();

        mutate({
            id,
            title: title1 // Use title1 here to send the updated title
        }).then(() => {
            toast.success("Board renamed");
            onClose();
        }).catch(() => toast.error("Failed to rename board"));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit board title</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                    Enter a new title for this board
                </DialogDescription>
                <form onSubmit={onSubmit} className="space-y-4">
                    <Input 
                        disabled={false}
                        required
                        maxLength={60}
                        value={title1} // Bind the input value to title1 state
                        placeholder="Board title"
                        onChange={(e) => setTitle1(e.target.value)} // Update title1 state on input change
                    />
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button disabled={pending} type="submit">
                            Save
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
