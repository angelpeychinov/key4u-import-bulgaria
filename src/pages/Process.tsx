import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, Search, Wrench, FileCheck, Phone } from "lucide-react";

export default function Process() {
  const { t } = useLanguage();

  const steps = [
    {
      icon: <ClipboardList className="w-16 h-16" />,
      title: t('process.step1'),
      description: t('process.step1desc'),
      number: "01",
    },
    {
      icon: <Search className="w-16 h-16" />,
      title: t('process.step2'),
      description: t('process.step2desc'),
      number: "02",
    },
    {
      icon: <Wrench className="w-16 h-16" />,
      title: t('process.step3'),
      description: t('process.step3desc'),
      number: "03",
    },
    {
      icon: <FileCheck className="w-16 h-16" />,
      title: t('process.step4'),
      description: t('process.step4desc'),
      number: "04",
    },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 text-foreground">
            {t('process.title')}
          </h1>
          <p className="text-xl text-muted-foreground">
            {t('process.subtitle')}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Timeline line */}
              {index !== steps.length - 1 && (
                <div className="absolute left-8 top-24 w-0.5 h-full bg-primary/30 -z-10" />
              )}
              
              {/* Timeline step */}
              <div className="flex gap-6 pb-12">
                {/* Icon circle */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg relative z-10">
                    <div className="text-primary-foreground scale-75">
                      {step.icon}
                    </div>
                  </div>
                </div>
                
                {/* Content card */}
                <Card className="flex-1 bg-primary border-primary shadow-card hover:shadow-elegant transition-smooth">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <span className="text-4xl font-bold text-primary-foreground/30">
                        {step.number}
                      </span>
                      <div className="flex-1">
                        <h3 className="text-2xl font-semibold mb-3 text-primary-foreground">
                          {step.title}
                        </h3>
                        <p className="text-primary-foreground/90">{step.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center max-w-4xl mx-auto">
          <Button
            asChild
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
          >
            <a href="tel:0898252434" className="flex items-center gap-3">
              <Phone className="w-5 h-5" />
              0898252434
            </a>
          </Button>
        </div>

        <div className="mt-16 bg-primary rounded-lg p-8 max-w-4xl mx-auto shadow-card border-primary">
          <h2 className="text-3xl font-bold mb-6 text-center text-primary-foreground">
            {t('features.trust')}
          </h2>
          <div className="space-y-4 text-primary-foreground/90">
            <p className="text-center">
              {t('features.trustDesc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
