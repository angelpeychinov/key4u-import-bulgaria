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
          <h1 className="text-5xl md:text-7xl font-bold mb-4 text-primary">
            {t('hero.title')}
          </h1>
          <p className="text-lg md:text-xl text-foreground font-medium mb-8 max-w-2xl mx-auto">
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
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-primary">
            {language === 'bg' ? 'Поддържани марки автомобили' : 'Supported Car Brands'}
          </h2>
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            plugins={[
              Autoplay({
                delay: 3000,
              }),
            ]}
            className="w-full max-w-5xl mx-auto"
          >
            <CarouselContent>
              {[
                { name: "BMW", logo: bmwLogo },
                { name: "Audi", logo: audiLogo },
                { name: "Mercedes", logo: mercedesLogo },
                { name: "Volvo", logo: volvoLogo },
                { name: "Volkswagen", logo: volkswagenLogo },
                { name: "Porsche", logo: porscheLogo },
                { name: "Dodge", logo: dodgeLogo },
                { name: "Toyota", logo: toyotaLogo },
                { name: "Jeep", logo: jeepLogo },
                { name: "Kia", logo: kiaLogo },
              ].map((brand, index) => (
                <CarouselItem key={index} className="md:basis-1/3 lg:basis-1/4">
                  <Card className="shadow-card hover:shadow-elegant transition-smooth">
                    <CardContent className="flex flex-col items-center justify-center p-8 h-40">
                      <img 
                        src={brand.logo} 
                        alt={`${brand.name} logo`}
                        className="w-20 h-20 object-contain mb-2"
                      />
                      <p className="text-lg font-bold text-foreground">{brand.name}</p>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
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
          <div className="max-w-3xl mx-auto space-y-6">
            <Card className="shadow-card hover:shadow-elegant transition-smooth">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-2 text-card-foreground">
                  {t('faq.q1')}
                </h3>
                <p className="text-muted-foreground">{t('faq.a1')}</p>
              </CardContent>
            </Card>
            <Card className="shadow-card hover:shadow-elegant transition-smooth">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-2 text-card-foreground">
                  {t('faq.q2')}
                </h3>
                <p className="text-muted-foreground">{t('faq.a2')}</p>
              </CardContent>
            </Card>
            <Card className="shadow-card hover:shadow-elegant transition-smooth">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-2 text-card-foreground">
                  {t('faq.q3')}
                </h3>
                <p className="text-muted-foreground">{t('faq.a3')}</p>
              </CardContent>
            </Card>
            <Card className="shadow-card hover:shadow-elegant transition-smooth">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-2 text-card-foreground">
                  {t('faq.q4')}
                </h3>
                <p className="text-muted-foreground">{t('faq.a4')}</p>
              </CardContent>
            </Card>
            <Card className="shadow-card hover:shadow-elegant transition-smooth">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-2 text-card-foreground">
                  {t('faq.q5')}
                </h3>
                <p className="text-muted-foreground">{t('faq.a5')}</p>
              </CardContent>
            </Card>
            <Card className="shadow-card hover:shadow-elegant transition-smooth">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-2 text-card-foreground">
                  {t('faq.q6')}
                </h3>
                <p className="text-muted-foreground">{t('faq.a6')}</p>
              </CardContent>
            </Card>
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
