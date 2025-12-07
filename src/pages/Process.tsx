import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { ClipboardList, Search, Wrench, FileCheck, Phone, ArrowRight, CheckCircle2 } from "lucide-react";

export default function Process() {
  const { t } = useLanguage();

  const steps = [
    {
      icon: ClipboardList,
      title: t('process.step1'),
      description: t('process.step1desc'),
      number: "01",
      accent: "primary" as const,
    },
    {
      icon: Search,
      title: t('process.step2'),
      description: t('process.step2desc'),
      number: "02",
      accent: "accent" as const,
    },
    {
      icon: Wrench,
      title: t('process.step3'),
      description: t('process.step3desc'),
      number: "03",
      accent: "primary" as const,
    },
    {
      icon: FileCheck,
      title: t('process.step4'),
      description: t('process.step4desc'),
      number: "04",
      accent: "accent" as const,
    },
  ];

  return (
    <div className="min-h-screen pt-20 pb-16 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      <div className="absolute top-40 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-40 -right-20 w-96 h-96 bg-accent/15 rounded-full blur-3xl" />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--primary)/0.02)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--primary)/0.02)_1px,transparent_1px)] bg-[size:80px_80px]" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <CheckCircle2 className="w-4 h-4" />
            Лесен и прозрачен процес
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-foreground/80 to-foreground bg-clip-text">
            {t('process.title')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('process.subtitle')}
          </p>
        </div>

        {/* Timeline */}
        <div className="max-w-5xl mx-auto relative">
          {/* Central timeline line - hidden on mobile */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-accent/50 to-primary/50" />

          {steps.map((step, index) => {
            const Icon = step.icon;
            const isEven = index % 2 === 0;
            const isPrimary = step.accent === "primary";
            
            return (
              <div key={index} className="relative mb-12 last:mb-0">
                {/* Timeline dot - centered on desktop */}
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 top-8 z-20">
                  <div className={`w-5 h-5 rounded-full border-4 ${isPrimary ? 'bg-primary border-primary/30' : 'bg-accent border-accent/30'} shadow-lg`} />
                </div>

                {/* Content wrapper - alternating sides on desktop */}
                <div className={`flex flex-col md:flex-row ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8`}>
                  {/* Card side */}
                  <div className={`w-full md:w-1/2 ${isEven ? 'md:pr-16 md:text-right' : 'md:pl-16 md:text-left'}`}>
                    <div className="
                      relative p-8 rounded-2xl border backdrop-blur-sm
                      bg-accent/5 border-accent/20 hover:border-accent/40
                      transition-all duration-300 hover:shadow-lg group
                    ">
                      {/* Number badge */}
                      <div className="
                        absolute -top-4 left-8
                        w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm
                        bg-accent text-accent-foreground
                        shadow-lg
                      ">
                        {step.number}
                      </div>

                      {/* Icon - mobile only */}
                      <div className="md:hidden w-14 h-14 rounded-xl flex items-center justify-center mb-4 bg-primary/10">
                        <Icon className="w-7 h-7 text-primary" />
                      </div>

                      <h3 className="text-2xl font-bold mb-3 text-primary">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>

                      {/* Arrow indicator */}
                      {index !== steps.length - 1 && (
                        <div className="md:hidden mt-6 flex justify-center">
                          <ArrowRight className="w-5 h-5 text-muted-foreground/50 rotate-90" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Icon side - desktop only */}
                  <div className={`hidden md:flex w-1/2 ${isEven ? 'pl-16 justify-start' : 'pr-16 justify-end'}`}>
                    <div className="
                      w-24 h-24 rounded-2xl flex items-center justify-center
                      bg-gradient-to-br from-primary to-primary/80
                      shadow-xl group-hover:scale-105 transition-transform duration-300
                    ">
                      <Icon className="w-12 h-12 text-primary-foreground" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="inline-flex flex-col items-center gap-6 p-10 rounded-3xl bg-gradient-to-br from-primary to-primary/90 shadow-elegant relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/20 rounded-full blur-2xl" />
            
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-2">
                Готови ли сте да започнете?
              </h2>
              <p className="text-primary-foreground/80 mb-6">
                Обадете се сега и нека намерим мечтания ви автомобил
              </p>
              <Button
                asChild
                size="lg"
                className="bg-white hover:bg-white/90 text-primary font-bold text-lg px-10 py-7 rounded-full shadow-lg hover:shadow-xl transition-all group"
              >
                <a href="tel:0898252434" className="flex items-center gap-3">
                  <Phone className="w-5 h-5 group-hover:animate-pulse" />
                  ОБАДИ СЕ СЕГА
                  <span className="text-primary/70">0898252434</span>
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Trust Section */}
        <div className="mt-20 max-w-4xl mx-auto">
          <div className="relative p-10 rounded-3xl bg-card/50 backdrop-blur-sm border border-border/50 shadow-card">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full bg-accent text-accent-foreground font-semibold text-sm">
              {t('features.trust')}
            </div>
            <p className="text-center text-muted-foreground text-lg leading-relaxed pt-4">
              {t('features.trustDesc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
