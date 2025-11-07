import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Car, Shield, MapPin } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Autoplay from "embla-carousel-autoplay";
import heroImage from "@/assets/hero-car.jpg";
import bmwLogo from "@/assets/brands/bmw-logo.png";
import audiLogo from "@/assets/brands/audi-logo.png";
import mercedesLogo from "@/assets/brands/mercedes-logo.png";
import volvoLogo from "@/assets/brands/volvo-logo.png";
import volkswagenLogo from "@/assets/brands/volkswagen-logo.png";
import porscheLogo from "@/assets/brands/porsche-logo.png";
import dodgeLogo from "@/assets/brands/dodge-logo.png";
import toyotaLogo from "@/assets/brands/toyota-logo.png";
import jeepLogo from "@/assets/brands/jeep-logo.png";
import kiaLogo from "@/assets/brands/kia-logo.png";

export default function Home() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const features = [
    {
      icon: <CheckCircle2 className="w-12 h-12 text-primary" />,
      title: t('features.endToEnd'),
      description: t('features.endToEndDesc'),
    },
    {
      icon: <Car className="w-12 h-12 text-primary" />,
      title: t('features.affordable'),
      description: t('features.affordableDesc'),
    },
    {
      icon: <Shield className="w-12 h-12 text-primary" />,
      title: t('features.trust'),
      description: t('features.trustDesc'),
    },
    {
      icon: <MapPin className="w-12 h-12 text-primary" />,
      title: t('features.local'),
      description: t('features.localDesc'),
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/85" />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-7 text-primary">
            {t('hero.title')}
          </h1>
          <p className="text-lg md:text-xl text-foreground font-medium mb-12 max-w-2xl mx-auto bg-background/50 backdrop-blur-sm px-3 py-2 rounded-lg inline-block">
            {t('hero.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" onClick={() => navigate('/find-car')}>
              {t('hero.cta')}
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/process')}>
              {t('hero.learn')}
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-primary">
            {t('features.title')}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="shadow-card hover:shadow-elegant transition-smooth">
                <CardContent className="pt-6 text-center">
                  <div className="flex justify-center mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2 text-card-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Car Brands Carousel */}
      <section className="py-20 bg-background">
...
      </section>

      {/* Our Listings Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-primary">
            {language === 'bg' ? 'Нашите Обяви' : 'Our Listings'}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="shadow-card hover:shadow-elegant transition-smooth overflow-hidden">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-card-foreground">BMW 528 528i xDrive</h3>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">НОВА</span>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  <p>🗓️ Януари 2014 г.</p>
                  <p>📍 207 633 км</p>
                  <p>⛽ Бензинов • Седан • 245 к.с.</p>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">14 400 лв.</p>
                    <p className="text-sm text-muted-foreground">7 362.60 €</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => window.open('https://key4u.mobile.bg', '_blank')}>
                    Детайли
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-elegant transition-smooth overflow-hidden">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-card-foreground">Mercedes-Benz GLB 35 AMG</h3>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">НОВА</span>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  <p>🗓️ Август 2022 г.</p>
                  <p>📍 104 000 км</p>
                  <p>⛽ Бензинов • Джип • 302 к.с.</p>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">54 200 лв.</p>
                    <p className="text-sm text-muted-foreground">27 712.02 €</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => window.open('https://key4u.mobile.bg', '_blank')}>
                    Детайли
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-elegant transition-smooth overflow-hidden">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-card-foreground">Audi Q8 3.0T S-LINE</h3>
                  <span className="text-xs bg-green-500/10 text-green-600 px-2 py-1 rounded">🔋</span>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  <p>🗓️ Април 2019 г.</p>
                  <p>📍 126 000 км</p>
                  <p>⛽ Бензинов • Джип • 335 к.с.</p>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">49 300 лв.</p>
                    <p className="text-sm text-muted-foreground">25 206.69 €</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => window.open('https://key4u.mobile.bg', '_blank')}>
                    Детайли
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="text-center mt-12">
            <Button 
              variant="default" 
              size="lg" 
              onClick={() => window.open('https://key4u.mobile.bg', '_blank')}
            >
              {language === 'bg' ? 'Виж Всички Обяви' : 'View All Listings'}
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Preview Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-primary">
              {t('faq.title')}
            </h2>
          </div>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="border rounded-lg px-6 shadow-card hover:shadow-elegant transition-smooth bg-card">
                <AccordionTrigger className="text-lg font-semibold text-card-foreground hover:no-underline">
                  {t('faq.q1')}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {t('faq.a1')}
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2" className="border rounded-lg px-6 shadow-card hover:shadow-elegant transition-smooth bg-card">
                <AccordionTrigger className="text-lg font-semibold text-card-foreground hover:no-underline">
                  {t('faq.q2')}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {t('faq.a2')}
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3" className="border rounded-lg px-6 shadow-card hover:shadow-elegant transition-smooth bg-card">
                <AccordionTrigger className="text-lg font-semibold text-card-foreground hover:no-underline">
                  {t('faq.q3')}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {t('faq.a3')}
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4" className="border rounded-lg px-6 shadow-card hover:shadow-elegant transition-smooth bg-card">
                <AccordionTrigger className="text-lg font-semibold text-card-foreground hover:no-underline">
                  {t('faq.q4')}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {t('faq.a4')}
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5" className="border rounded-lg px-6 shadow-card hover:shadow-elegant transition-smooth bg-card">
                <AccordionTrigger className="text-lg font-semibold text-card-foreground hover:no-underline">
                  {t('faq.q5')}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {t('faq.a5')}
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-6" className="border rounded-lg px-6 shadow-card hover:shadow-elegant transition-smooth bg-card">
                <AccordionTrigger className="text-lg font-semibold text-card-foreground hover:no-underline">
                  {t('faq.q6')}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {t('faq.a6')}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto shadow-elegant hover:shadow-2xl transition-all duration-300 animate-fade-in">
            <CardContent className="pt-16 pb-16 px-8 text-center">
              <div className="mb-6 flex justify-center">
                <div className="bg-primary/10 p-4 rounded-full">
                  <CheckCircle2 className="w-16 h-16 text-primary" />
                </div>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
                {t('contact.subtitle')}
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                {t('hero.description') || 'Let us handle everything from finding your perfect car to delivering it to your doorstep in Bulgaria.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  variant="default" 
                  size="lg" 
                  onClick={() => navigate('/find-car')}
                  className="hover-scale shadow-lg"
                >
                  {t('hero.cta')}
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={() => navigate('/process')}
                  className="hover-scale"
                >
                  {t('hero.learn')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
