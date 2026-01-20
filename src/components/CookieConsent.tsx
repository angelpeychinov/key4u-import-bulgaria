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
      className={`fixed bottom-0 left-0 right-0 z-50 p-4 transition-all duration-300 ease-out ${
        isAnimating ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      }`}
    >
      <div className="container mx-auto max-w-4xl">
        <div className="relative bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-elegant overflow-hidden">
          {/* Decorative gradient */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
          
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Icon */}
              <div className="flex-shrink-0 hidden md:flex">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Cookie className="w-7 h-7 text-primary" />
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-grow space-y-2">
                <div className="flex items-center gap-2 md:hidden mb-3">
                  <Cookie className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Бисквитки</h3>
                </div>
                <h3 className="hidden md:block font-semibold text-lg text-foreground">
                  Използваме бисквитки
                </h3>
                <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                  Този сайт използва бисквитки за подобряване на потребителското изживяване. 
                  Използваме само функционални бисквитки, които са необходими за правилната работа на сайта.
                  <a 
                    href="/privacy" 
                    className="text-primary hover:underline ml-1"
                    onClick={(e) => {
                      e.preventDefault();
                      // Could navigate to privacy policy
                    }}
                  >
                    Научете повече
                  </a>
                </p>
              </div>
              
              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-shrink-0">
                <Button
                  variant="outline"
                  onClick={() => handleConsent("declined")}
                  className="order-2 sm:order-1 text-muted-foreground hover:text-foreground"
                >
                  Само необходимите
                </Button>
                <Button
                  onClick={() => handleConsent("accepted")}
                  className="order-1 sm:order-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Приемам всички
                </Button>
              </div>
            </div>
          </div>
          
          {/* Close button */}
          <button
            onClick={() => handleConsent("declined")}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-muted/50"
            aria-label="Затвори"
          >
            <X className="w-5 h-5" />
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
