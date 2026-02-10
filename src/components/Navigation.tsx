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
              <Button variant="ghost" size="sm" className="text-[#4CAF50] hover:text-[#388E3C] hover:bg-[#4CAF50]/10 gap-1.5 font-semibold">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M11.4 0C9.5.1 4.3.8 2 4.1.1 6.5-.2 9.9.2 14c.3 3 1.5 6.5 5 8.7l-.2 3.1s0 .8.5 1c.6.2 1-.4 1-.4l1.6-2c2.3.2 4.1-.2 4.3-.3.5-.1 3.4-.5 3.9-4.4.5-4 .3-6.6-.1-8.2C15.6 2.3 11.4 0 11.4 0zm.6 2c0 0 3.6 2 4 10 0 0 .3 3.4-2.9 3.8 0 0-.3 0-3.3.2l-1.4 1.6s-.2.2-.3.1c-.1-.1-.1-.4-.1-.4l.1-2.1c-3-.9-3.2-3.6-3.3-5.2C4.8 5 8.6 2.6 12 2z"/><path d="M11.5 5.3c-.2 0-.2.3 0 .3 1.5.1 2.8 1 3.3 2.5.1.2.4.1.3-.1-.6-1.7-1.9-2.7-3.6-2.7zM11.5 6.8c-.2 0-.2.3 0 .3.8 0 1.5.5 1.7 1.3.1.2.4.1.3-.1-.2-1-1.1-1.5-2-1.5zM11.6 8.3c-.2 0-.3.2-.1.3.3.2.5.5.5.9 0 .2.3.2.3 0 .1-.5-.2-1-.7-1.2zM8.2 7.3c0-.1-.2-.2-.3-.1L7 8.1c-.1.1-.2.3-.1.4.6 1.5 1.5 2.8 2.8 3.8 1 .8 2.2 1.5 3.5 1.8.1 0 .3 0 .4-.1l.8-.9c.1-.1.1-.3 0-.4l-1.6-1.2c-.1-.1-.3-.1-.4 0l-.5.5c-.1.1-.2.1-.3 0-.5-.3-1-.6-1.4-1-1.1-1-1.1-1-1.1-1-.1-.1-.1-.2 0-.3l.5-.6c.1-.1.1-.3 0-.4L8.2 7.3z"/></svg>
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
              <Button variant="ghost" size="sm" className="text-[#4CAF50] hover:text-[#388E3C] hover:bg-[#4CAF50]/10 gap-1.5 font-semibold w-full justify-start">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M11.4 0C9.5.1 4.3.8 2 4.1.1 6.5-.2 9.9.2 14c.3 3 1.5 6.5 5 8.7l-.2 3.1s0 .8.5 1c.6.2 1-.4 1-.4l1.6-2c2.3.2 4.1-.2 4.3-.3.5-.1 3.4-.5 3.9-4.4.5-4 .3-6.6-.1-8.2C15.6 2.3 11.4 0 11.4 0zm.6 2c0 0 3.6 2 4 10 0 0 .3 3.4-2.9 3.8 0 0-.3 0-3.3.2l-1.4 1.6s-.2.2-.3.1c-.1-.1-.1-.4-.1-.4l.1-2.1c-3-.9-3.2-3.6-3.3-5.2C4.8 5 8.6 2.6 12 2z"/><path d="M11.5 5.3c-.2 0-.2.3 0 .3 1.5.1 2.8 1 3.3 2.5.1.2.4.1.3-.1-.6-1.7-1.9-2.7-3.6-2.7zM11.5 6.8c-.2 0-.2.3 0 .3.8 0 1.5.5 1.7 1.3.1.2.4.1.3-.1-.2-1-1.1-1.5-2-1.5zM11.6 8.3c-.2 0-.3.2-.1.3.3.2.5.5.5.9 0 .2.3.2.3 0 .1-.5-.2-1-.7-1.2zM8.2 7.3c0-.1-.2-.2-.3-.1L7 8.1c-.1.1-.2.3-.1.4.6 1.5 1.5 2.8 2.8 3.8 1 .8 2.2 1.5 3.5 1.8.1 0 .3 0 .4-.1l.8-.9c.1-.1.1-.3 0-.4l-1.6-1.2c-.1-.1-.3-.1-.4 0l-.5.5c-.1.1-.2.1-.3 0-.5-.3-1-.6-1.4-1-1.1-1-1.1-1-1.1-1-.1-.1-.1-.2 0-.3l.5-.6c.1-.1.1-.3 0-.4L8.2 7.3z"/></svg>
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
