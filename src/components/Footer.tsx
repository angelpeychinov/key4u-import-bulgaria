import { Facebook, Instagram, MessageCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import logoFooter from "@/assets/logo-footer.png";

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-primary text-primary-foreground py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <img src={logoFooter} alt="Key4U" className="h-24 w-auto mb-4" />
            <div className="flex gap-4">
              <a href="https://www.facebook.com/Key4UCarImport/" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-smooth">
                <Facebook size={24} />
              </a>
              <a href="https://www.instagram.com/key4u_carimport?igsh=MWUzd3gzMGJrYmlqNQ==" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-smooth">
                <Instagram size={24} />
              </a>
              <a href="viber://chat?number=%2B359898252434" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-smooth">
                <MessageCircle size={24} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="opacity-90 hover:opacity-100 transition-smooth">{t('nav.home')}</a></li>
              <li><a href="/process" className="opacity-90 hover:opacity-100 transition-smooth">{t('nav.process')}</a></li>
              <li><a href="/find-car" className="opacity-90 hover:opacity-100 transition-smooth">{t('nav.findCar')}</a></li>
              <li><a href="/faq" className="opacity-90 hover:opacity-100 transition-smooth">{t('nav.faq')}</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.contacts')}</h3>
            <ul className="space-y-2 text-sm opacity-90">
              <li>{t('footer.emailLabel')} key4u.import@gmail.com</li>
              <li>{t('footer.phoneLabel')} 0898 252 434</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-6 text-center text-sm opacity-90">
          <p>&copy; {new Date().getFullYear()} Key4U. {t('footer.allRightsReserved')}</p>
        </div>
      </div>
    </footer>
  );
};
