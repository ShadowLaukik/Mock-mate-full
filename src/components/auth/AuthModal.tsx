
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import SignInForm from "./SignInForm";
import SignUpForm from "./SignUpForm";
import { UserRole } from "@/context/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView: "signin" | "signup";
  initialRole?: UserRole;
}

const AuthModal = ({
  isOpen,
  onClose,
  initialView = "signin",
  initialRole
}: AuthModalProps) => {
  const [view, setView] = useState<"signin" | "signup">(initialView);

  const switchView = (newView: "signin" | "signup") => {
    setView(newView);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        {view === "signin" ? (
          <SignInForm onSwitchView={() => switchView("signup")} onSuccess={onClose} />
        ) : (
          <SignUpForm onSwitchView={() => switchView("signin")} onSuccess={onClose} initialRole={initialRole} />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
