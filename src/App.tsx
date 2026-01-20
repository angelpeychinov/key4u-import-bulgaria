import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ViberButton } from "@/components/ViberButton";
import { ViberOffersDialog } from "@/components/ViberOffersDialog";
import { CookieConsent } from "@/components/CookieConsent";
import { LocalBusinessSchema, CarImportServiceSchema } from "@/components/SEO";
import Home from "./pages/Home";
import Process from "./pages/Process";
import FindCar from "./pages/FindCar";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <LocalBusinessSchema />
          <CarImportServiceSchema />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="flex flex-col min-h-screen">
              <Navigation />
              <ViberButton />
              <ViberOffersDialog />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/process" element={<Process />} />
                <Route path="/find-car" element={<FindCar />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/contact" element={<Contact />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Footer />
              <CookieConsent />
            </div>
          </BrowserRouter>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
