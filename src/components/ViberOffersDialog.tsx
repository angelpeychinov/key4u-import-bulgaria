import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

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
    window.open('viber://chat?number=%2B359898252434', '_blank');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Get our latest offers
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            Join our Viber group to receive exclusive deals and updates on available cars.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <Button
            onClick={handleViberClick}
            className="w-full bg-gradient-accent text-accent-foreground hover:opacity-90 transition-smooth flex items-center gap-2 py-6 text-lg font-semibold"
          >
            <MessageCircle size={24} />
            Join Viber Group
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
