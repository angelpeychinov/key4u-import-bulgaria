import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, Car, Shield, FileCheck, Search, Clock, ArrowRight, Phone } from "lucide-react";
import { AnimatedCounter } from "@/components/AnimatedCounter";
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
import logo from "@/assets/logo.png";
import mobileBgLogo from "@/assets/mobile-bg-logo.png";
import mobileBgSectionBg from "@/assets/mobile-bg-section-background.jpg";

export default function Home() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const features = [
    {
      icon: <CheckCircle2 className="w-12 h-12" />,
      title: t('features.endToEnd'),
      description: t('features.endToEndDesc'),
    },
    {
      icon: <FileCheck className="w-12 h-12" />,
      title: t('features.realKm'),
      description: t('features.realKmDesc'),
    },
    {
      icon: <Car className="w-12 h-12" />,
      title: t('features.affordable'),
      description: t('features.affordableDesc'),
    },
    {
      icon: <Shield className="w-12 h-12" />,
      title: t('features.trust'),
      description: t('features.trustDesc'),
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
            {language === 'bg' ? (
              <>Внос на автомобили<br />от Канада и САЩ</>
            ) : (
              <>Car Import<br />from Canada and USA</>
            )}
          </h1>
          <p className="text-lg md:text-xl text-foreground font-medium mb-12 max-w-2xl mx-auto bg-background/50 backdrop-blur-sm px-3 py-2 rounded-lg inline-block">
            {t('hero.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="default" size="lg" onClick={() => navigate('/find-car')} className="bg-primary/90">
              {t('hero.cta')}
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
              <Card key={index} className="bg-primary shadow-card hover:shadow-elegant transition-smooth border-primary">
                <CardContent className="pt-6 text-center">
                  <div className="flex justify-center mb-4 text-primary-foreground">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2 text-primary-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-primary-foreground/90">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>


      {/* Stats Section */}
      <section className="py-24 bg-primary relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border-2 border-primary-foreground rounded-full" />
          <div className="absolute bottom-10 right-10 w-48 h-48 border-2 border-primary-foreground rounded-full" />
          <div className="absolute top-1/2 left-1/4 w-20 h-20 border-2 border-primary-foreground rounded-full" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              {language === 'bg' ? 'Нашият опит в цифри' : 'Our Experience in Numbers'}
            </h2>
            <p className="text-lg text-primary-foreground/80">
              {language === 'bg' ? 'Доверие, което се доказва с всеки внесен автомобил' : 'Trust proven with every imported vehicle'}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Stat 1 - Cars Imported */}
            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-8 text-center border border-primary-foreground/20 hover:bg-primary-foreground/15 transition-all duration-300 group">
              <div className="w-16 h-16 bg-primary-foreground/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Car className="w-8 h-8 text-primary-foreground" />
              </div>
              <div className="text-5xl md:text-6xl font-bold text-primary-foreground mb-3">
                <AnimatedCounter end={100} suffix="+" />
              </div>
              <p className="text-primary-foreground/90 text-lg font-medium">
                {language === 'bg' ? 'Внесени автомобила' : 'Cars Imported'}
              </p>
              <p className="text-primary-foreground/70 text-sm mt-2">
                {language === 'bg' ? 'за последната година' : 'in the last year'}
              </p>
            </div>
            
            {/* Stat 2 - Happy Clients */}
            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-8 text-center border border-primary-foreground/20 hover:bg-primary-foreground/15 transition-all duration-300 group">
              <div className="w-16 h-16 bg-primary-foreground/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-8 h-8 text-primary-foreground" />
              </div>
              <div className="text-5xl md:text-6xl font-bold text-primary-foreground mb-3">
                <AnimatedCounter end={100} suffix="%" />
              </div>
              <p className="text-primary-foreground/90 text-lg font-medium">
                {language === 'bg' ? 'Доволни клиенти' : 'Happy Clients'}
              </p>
              <p className="text-primary-foreground/70 text-sm mt-2">
                {language === 'bg' ? 'ни препоръчват' : 'recommend us'}
              </p>
            </div>
            
            {/* Stat 3 - Delivery Time */}
            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-8 text-center border border-primary-foreground/20 hover:bg-primary-foreground/15 transition-all duration-300 group">
              <div className="w-16 h-16 bg-primary-foreground/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-8 h-8 text-primary-foreground" />
              </div>
              <div className="text-5xl md:text-6xl font-bold text-primary-foreground mb-3">
                <AnimatedCounter end={60} suffix=" дни" />
              </div>
              <p className="text-primary-foreground/90 text-lg font-medium">
                {language === 'bg' ? 'Средно време' : 'Average Time'}
              </p>
              <p className="text-primary-foreground/70 text-sm mt-2">
                {language === 'bg' ? 'за доставка' : 'for delivery'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Transparency Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-[43px] md:text-[54px] font-bold text-primary mb-6">
              {language === 'bg' ? 'Предоставяме 100% от информацията, която притежаваме.' : 'We provide 100% of the information we have.'}
            </h2>
            <p className="text-xl text-muted-foreground">
              {language === 'bg' ? 'Без празни обещания за "здрави" автомобили' : 'Without empty promises of "healthy" cars'}
            </p>
          </div>
        </div>
      </section>

      {/* Mobile.bg Listings Section */}
      <section className="py-20 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${mobileBgSectionBg})` }}
        >
          <div className="absolute inset-0 bg-background/55 backdrop-blur-[2px]" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-none border-none bg-transparent">
              <CardContent className="p-12 text-center">
                <div className="flex items-center justify-center gap-6 mb-8 flex-wrap">
                  <img 
                    src={logo} 
                    alt="Key4U Logo" 
                    className="h-[143px] w-auto translate-y-[5%]"
                  />
                  <div className="text-3xl font-bold text-primary">×</div>
                  <img 
                    src={mobileBgLogo} 
                    alt="Mobile.bg Logo" 
                    className="h-[114px] w-auto"
                  />
                </div>
                
                <div className="bg-white/90 backdrop-blur-sm rounded-lg px-6 py-4 mb-6 inline-block">
                  <p className="text-[18px] text-card-foreground font-medium">
                    {language === 'bg' ? 'Тук може да намерите нашите актуални предложения.' : 'Here you can find our current offers.'}
                  </p>
                </div>

                <Button
                  variant="outline" 
                  size="lg"
                  onClick={() => window.open('https://key4u.mobile.bg/', '_blank')}
                  className="hover-scale shadow-lg text-lg px-8 py-6 uppercase bg-white text-primary border-white hover:bg-white/90 hover:text-primary font-bold"
                >
                  <Search className="mr-2 h-5 w-5" />
                  {language === 'bg' ? 'Виж Обявите в Mobile.bg' : 'View Listings on Mobile.bg'}
                </Button>
              </CardContent>
            </Card>
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
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        {/* Background with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80" />
        
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary-foreground/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-primary-foreground/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-primary-foreground/10 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-primary-foreground/10 rounded-full" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Icon */}
            <div className="mb-8 inline-flex">
              <div className="relative">
                <div className="absolute inset-0 bg-primary-foreground/20 rounded-full blur-xl scale-150" />
                <div className="relative bg-primary-foreground/10 backdrop-blur-sm p-6 rounded-full border border-primary-foreground/20">
                  <Car className="w-12 h-12 text-primary-foreground" />
                </div>
              </div>
            </div>
            
            {/* Headline */}
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-primary-foreground leading-tight">
              {language === 'bg' ? (
                <>Готови ли сте за<br /><span className="text-primary-foreground/80">мечтания автомобил?</span></>
              ) : (
                <>Ready for your<br /><span className="text-primary-foreground/80">dream car?</span></>
              )}
            </h2>
            
            {/* Subtitle */}
            <p className="text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
              {language === 'bg' 
                ? 'Ние се грижим за всичко - от намирането до доставката на вашия перфектен автомобил.' 
                : 'We handle everything - from finding to delivering your perfect car.'}
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/find-car')}
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-2xl hover:shadow-primary-foreground/25 hover:scale-105 transition-all duration-300 text-lg px-8 py-6 rounded-full font-semibold group"
              >
                {t('hero.cta')}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <a 
                href="tel:0898252434"
                className="inline-flex items-center gap-2 text-primary-foreground/90 hover:text-primary-foreground transition-colors text-lg font-medium group"
              >
                <Phone className="w-5 h-5" />
                <span className="border-b border-primary-foreground/30 group-hover:border-primary-foreground transition-colors">
                  0898 252 434
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
