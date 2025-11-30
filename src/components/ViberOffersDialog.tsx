import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import logo from "@/assets/logo.png";

export const ViberOffersDialog = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Show dialog after 2 seconds if not shown in this session
    const hasShown = sessionStorage.getItem("viber-offers-shown");
    if (!hasShown) {
      const timer = setTimeout(() => {
        setOpen(true);
        sessionStorage.setItem("viber-offers-shown", "true");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleViberClick = () => {
    window.open('https://invite.viber.com/?g2=AQBBYt8YUvNSclPkalAfJbQHTCgsYQCUoqTYEaki53CW%2FthpASyMvSk9yxEHGBS7', '_blank');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <img src={logo} alt="KEY4U Logo" className="h-24 w-auto" />
          </div>
          <DialogTitle className="text-2xl font-bold text-center">
            Get our latest offers
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <Button
            onClick={handleViberClick}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-smooth flex items-center gap-2 py-6 text-lg font-semibold shadow-elegant"
          >
            <MessageCircle size={24} />
            Join Viber Group
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
