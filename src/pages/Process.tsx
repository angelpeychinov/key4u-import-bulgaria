import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList, Search, Wrench, FileCheck } from "lucide-react";

export default function Process() {
  const { t } = useLanguage();

  const steps = [
    {
      icon: <ClipboardList className="w-16 h-16 text-primary" />,
      title: t('process.step1'),
      description: t('process.step1desc'),
      number: "01",
    },
    {
      icon: <Search className="w-16 h-16 text-primary" />,
      title: t('process.step2'),
      description: t('process.step2desc'),
      number: "02",
    },
    {
      icon: <Wrench className="w-16 h-16 text-primary" />,
      title: t('process.step3'),
      description: t('process.step3desc'),
      number: "03",
    },
    {
      icon: <FileCheck className="w-16 h-16 text-primary" />,
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

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <Card
              key={index}
              className="relative shadow-card hover:shadow-elegant transition-smooth"
            >
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center relative z-10">
                  <div className="mb-4">{step.icon}</div>
                  <h3 className="text-2xl font-semibold mb-3 text-card-foreground">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 bg-card rounded-lg p-8 max-w-4xl mx-auto shadow-card">
          <h2 className="text-3xl font-bold mb-6 text-center text-card-foreground">
            {t('features.trust')}
          </h2>
          <div className="space-y-4 text-muted-foreground">
            <p className="text-center">
              {t('features.trustDesc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
