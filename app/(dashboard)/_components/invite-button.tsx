import { Button } from "@/components/ui/button";
import { OrganizationProfile } from "@clerk/nextjs";
import { Dialog, DialogContent, DialogTrigger } from "@radix-ui/react-dialog";
import { Plus } from "lucide-react";

const InviteButton = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Invite Mambers
        </Button>
      </DialogTrigger>
      <DialogContent className="p-0 bg-transparent border-none max-w-[880px]">
        {/* <OrganizationProfile /> */}
        <OrganizationProfile routing="hash" />
      </DialogContent>
    </Dialog>
  );
};

export default InviteButton;
