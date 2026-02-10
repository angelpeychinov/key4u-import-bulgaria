import { NavLink } from "@/components/NavLink";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo.png";

export const Navigation = () => {
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: "/", label: t('nav.home') },
    { to: "/process", label: t('nav.process') },
    { to: "/find-car", label: t('nav.findCar') },
    { to: "/faq", label: t('nav.faq') },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink to="/" className="flex items-center mt-4">
            <img src={logo} alt="Key4U - Car Import" className="h-24 w-auto" />
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className="text-foreground hover:text-primary transition-smooth"
                activeClassName="text-primary font-semibold"
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Viber Group + Language Switcher */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="https://invite.viber.com/?g2=AQBJMj4Hv5lEfCLDNrlMz%2BNhJIH8B6XTKOY%2Ftk1MrCIQlHgSMLZNwjd%2FXAI5gnxD"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="ghost" size="sm" className="text-[#1a472a] hover:text-[#0f2d1a] hover:bg-[#1a472a]/10 font-semibold">
                Key4U VIBER
              </Button>
            </a>
            <Button
              variant={language === 'en' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setLanguage('en')}
            >
              EN
            </Button>
            <Button
              variant={language === 'bg' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setLanguage('bg')}
            >
              BG
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className="block py-2 text-foreground hover:text-primary transition-smooth"
                activeClassName="text-primary font-semibold"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
            <a
              href="https://invite.viber.com/?g2=AQBJMj4Hv5lEfCLDNrlMz%2BNhJIH8B6XTKOY%2Ftk1MrCIQlHgSMLZNwjd%2FXAI5gnxD"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button variant="ghost" size="sm" className="text-[#1a472a] hover:text-[#0f2d1a] hover:bg-[#1a472a]/10 font-semibold w-full justify-start">
                Key4U VIBER
              </Button>
            </a>
            <div className="flex gap-2 pt-2">
              <Button
                variant={language === 'en' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setLanguage('en')}
              >
                EN
              </Button>
              <Button
                variant={language === 'bg' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setLanguage('bg')}
              >
                BG
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
