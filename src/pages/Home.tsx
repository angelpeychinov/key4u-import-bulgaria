import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Truck, Shield, MapPin } from "lucide-react";
import heroImage from "@/assets/hero-car.jpg";
import bmwImage from "@/assets/car-bmw.jpg";
import audiImage from "@/assets/car-audi.jpg";
import teslaImage from "@/assets/car-tesla.jpg";

export default function Home() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const features = [
    {
      icon: <CheckCircle2 className="w-12 h-12 text-primary" />,
      title: t('features.endToEnd'),
      description: t('features.endToEndDesc'),
    },
    {
      icon: <Truck className="w-12 h-12 text-primary" />,
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
          <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background/95" />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 text-foreground">
            {t('hero.title')}
          </h1>
          <p className="text-2xl md:text-3xl text-accent font-semibold mb-6">
            {t('hero.subtitle')}
          </p>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
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
          <h2 className="text-4xl font-bold text-center mb-12 text-foreground">
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

      {/* Showcase Cars */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { img: bmwImage, name: "BMW" },
              { img: audiImage, name: "Audi" },
              { img: teslaImage, name: "Tesla" },
            ].map((car, index) => (
              <div
                key={index}
                className="relative overflow-hidden rounded-lg shadow-card hover:shadow-elegant transition-smooth group"
              >
                <img
                  src={car.img}
                  alt={`${car.name} luxury car`}
                  className="w-full h-80 object-cover group-hover:scale-110 transition-smooth"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent flex items-end">
                  <p className="text-primary-foreground text-2xl font-bold p-6">
                    {car.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6 text-primary-foreground">
            {t('contact.subtitle')}
          </h2>
          <Button variant="accent" size="lg" onClick={() => navigate('/find-car')}>
            {t('hero.cta')}
          </Button>
        </div>
      </section>
    </div>
  );
}
