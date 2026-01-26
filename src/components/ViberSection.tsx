import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

export const ViberSection = () => {
  const handleViberClick = () => {
    window.open('https://invite.viber.com/?g2=AQBBYt8YUvNSclPkalAfJbQHTCgsYQCUoqTYEaki53CW%2FthpASyMvSk9yxEHGBS7', '_blank');
  };

  return (
    <section className="py-16 bg-gradient-to-br from-[#7360F2] via-[#59267c] to-[#7360F2] relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-60 h-60 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src={logo} alt="Key4U Logo" className="h-20 w-auto" />
          </div>

          {/* Title */}
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Получавайте най-новите оферти
          </h2>

          {/* Description */}
          <p className="text-white/80 text-lg mb-8">
            Присъединете се към нашата Viber група за ексклузивни оферти и новини за автомобили
          </p>

          {/* CTA Button */}
          <Button
            onClick={handleViberClick}
            size="lg"
            className="bg-white text-[#59267c] hover:bg-white/90 shadow-2xl hover:scale-105 transition-all duration-300 text-lg px-8 py-6 rounded-full font-semibold group"
          >
            <MessageCircle className="mr-2 h-6 w-6" />
            Присъедини се към Viber групата
          </Button>
        </div>
      </div>
    </section>
  );
};
