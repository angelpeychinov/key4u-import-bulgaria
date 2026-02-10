import { useLanguage } from "@/contexts/LanguageContext";
import { BadgeCheck } from "lucide-react";
import manheimLogo from "@/assets/brands/manheim-logo.png";
import openlaneLogo from "@/assets/brands/openlane-logo.svg";
import autotraderLogo from "@/assets/brands/autotrader-logo.png";
import cargurusLogo from "@/assets/brands/cargurus-logo.jpg";

const platforms = [
  { name: "Manheim", logo: manheimLogo },
  { name: "OPENLANE", logo: openlaneLogo },
  { name: "AutoTrader", logo: autotraderLogo },
  { name: "CarGurus", logo: cargurusLogo },
];

export const LicensedImporterSection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
            <BadgeCheck className="w-5 h-5" />
            <span className="text-sm font-semibold uppercase tracking-wide">
              {t('licensed.badge')}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            {t('licensed.title')}
          </h2>

          {/* Subtitle */}
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            {t('licensed.subtitle')}
          </p>

          {/* Logos Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 items-center">
            {platforms.map((platform) => (
              <div
                key={platform.name}
                className="bg-card rounded-xl p-4 md:p-6 flex items-center justify-center h-24 md:h-28 border border-border/50 hover:shadow-elegant transition-smooth"
              >
                <img
                  src={platform.logo}
                  alt={`${platform.name} logo`}
                  className="max-h-12 md:max-h-16 w-auto max-w-[140px] md:max-w-[160px] object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
