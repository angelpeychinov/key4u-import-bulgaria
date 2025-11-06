import { MessageCircle } from "lucide-react";

export const ViberButton = () => {
  const handleViberClick = () => {
    // Replace with actual Viber contact link
    window.open('viber://chat?number=%2B359XXXXXXXXX', '_blank');
  };

  return (
    <button
      onClick={handleViberClick}
      className="fixed bottom-6 right-6 z-50 bg-gradient-accent text-accent-foreground p-4 rounded-full shadow-elegant hover:opacity-90 transition-smooth flex items-center gap-2"
      aria-label="Chat on Viber"
    >
      <MessageCircle size={24} />
      <span className="hidden sm:inline font-semibold">Viber</span>
    </button>
  );
};
