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
            <img src={logoFooter} alt="KEY4U" className="h-24 w-auto mb-4" />
            <p className="text-sm opacity-90">
              {t('footer.description') || 'Luxury car import from Canada and USA to Bulgaria'}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="opacity-90 hover:opacity-100 transition-smooth">{t('nav.home')}</a></li>
              <li><a href="/process" className="opacity-90 hover:opacity-100 transition-smooth">{t('nav.process')}</a></li>
              <li><a href="/find-car" className="opacity-90 hover:opacity-100 transition-smooth">{t('nav.findCar')}</a></li>
              <li><a href="/faq" className="opacity-90 hover:opacity-100 transition-smooth">{t('nav.faq')}</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.contact') || 'Contact'}</h3>
            <ul className="space-y-2 text-sm opacity-90">
              <li>Email: info@key4u.bg</li>
              <li>Phone: +359 XXX XXX XXX</li>
              <li>Sofia, Bulgaria</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-6 text-center text-sm opacity-90">
          <p>&copy; {new Date().getFullYear()} KEY4U. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
