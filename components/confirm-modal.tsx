import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogTrigger,
  } from "@radix-ui/react-alert-dialog";
  import { AlertDialogFooter, AlertDialogHeader } from "./ui/alert-dialog";
  
  interface ConfirmModalProps {
    children: React.ReactNode;
    onConfirm: () => void;
    disabled: boolean;
    header: string;
    description?: string;
  }
  
  export const ConfirmModal = ({
    children,
    onConfirm,
    disabled,
    header,
    description,
  }: ConfirmModalProps) => {
    const handleConfirm = () => {
      onConfirm();
    };
  
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
        <AlertDialogContent className="bg-white text-black border border-gray-300 rounded-lg p-6 shadow-lg w-full">
          <AlertDialogHeader className="text-lg font-semibold">
            {header}
          </AlertDialogHeader>
          {description && (
            <AlertDialogDescription className="text-sm text-gray-600">
              {description}
            </AlertDialogDescription>
          )}
          <AlertDialogFooter className="flex justify-end space-x-4 mt-4">
            <AlertDialogCancel
              className="px-4 py-2 bg-gray-200 text-black rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={disabled}
              className={`px-4 py-2 rounded-lg text-white transition-colors ${
                disabled
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-black hover:bg-gray-800"
              }`}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };
  