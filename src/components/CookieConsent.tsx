import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Cookie, X, Shield } from "lucide-react";

const COOKIE_CONSENT_KEY = "key4u-cookie-consent";

type ConsentStatus = "accepted" | "declined" | null;

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
        setTimeout(() => setIsAnimating(true), 50);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConsent = (status: ConsentStatus) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, status || "declined");
    setIsAnimating(false);
    setTimeout(() => setIsVisible(false), 300);

    // If accepted, you could initialize analytics here
    if (status === "accepted") {
      console.log("Cookie consent accepted - analytics can be initialized");
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-50 p-3 transition-all duration-300 ease-out ${
        isAnimating ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      }`}
    >
      <div className="container mx-auto max-w-3xl">
        <div className="relative bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-elegant overflow-hidden">
          {/* Decorative gradient */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-accent to-primary" />
          
          <div className="p-4 md:p-5">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              {/* Icon */}
              <div className="flex-shrink-0 hidden md:flex">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Cookie className="w-5 h-5 text-primary" />
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-grow">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  <Cookie className="w-4 h-4 text-primary inline mr-1.5 md:hidden" />
                  Този сайт използва бисквитки за подобряване на потребителското изживяване.
                </p>
              </div>
              
              {/* Actions */}
              <div className="flex gap-2 w-full md:w-auto flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleConsent("declined")}
                  className="text-muted-foreground hover:text-foreground text-xs"
                >
                  Отказвам
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleConsent("accepted")}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs"
                >
                  Приемам
                </Button>
              </div>
            </div>
          </div>
          
          {/* Close button */}
          <button
            onClick={() => handleConsent("declined")}
            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-muted/50"
            aria-label="Затвори"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook to check consent status
export function useCookieConsent() {
  const [consent, setConsent] = useState<ConsentStatus>(null);

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY) as ConsentStatus;
    setConsent(stored);
  }, []);

  return consent;
}
