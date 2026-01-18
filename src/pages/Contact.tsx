import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";

export default function Contact() {
  const { t } = useLanguage();

  const contactInfo = [
    {
      icon: <Phone className="w-8 h-8 text-primary" />,
      label: t('contact.phone'),
      value: "0898 252 434",
      href: "tel:+359898252434",
    },
    {
      icon: <Mail className="w-8 h-8 text-primary" />,
      label: t('contact.email'),
      value: "key4u.import@gmail.com",
      href: "mailto:key4u.import@gmail.com",
    },
    {
      icon: <MapPin className="w-8 h-8 text-primary" />,
      label: t('contact.location'),
      value: "Sofia, Bulgaria",
      href: "https://maps.google.com",
    },
  ];

  const handleViber = () => {
    window.open('viber://chat?number=%2B359898252434', '_blank');
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-foreground">
            {t('contact.title')}
          </h1>
          <p className="text-xl text-muted-foreground">
            {t('contact.subtitle')}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {contactInfo.map((item, index) => (
              <Card key={index} className="shadow-card hover:shadow-elegant transition-smooth">
                <CardContent className="pt-6 text-center">
                  <div className="flex justify-center mb-4">{item.icon}</div>
                  <h3 className="text-lg font-semibold mb-2 text-card-foreground">
                    {item.label}
                  </h3>
                  <a
                    href={item.href}
                    className="text-muted-foreground hover:text-primary transition-smooth"
                  >
                    {item.value}
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center space-y-6">
            <Button
              variant="hero"
              size="lg"
              onClick={handleViber}
              className="w-full md:w-auto"
            >
              <MessageCircle className="mr-2" />
              {t('contact.viber')}
            </Button>

            <div className="bg-card rounded-lg p-8 shadow-card">
              <h2 className="text-2xl font-bold mb-4 text-card-foreground">
                {t('features.local')}
              </h2>
              <p className="text-muted-foreground mb-6">
                {t('features.localDesc')}
              </p>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  <strong className="text-card-foreground">Facebook:</strong>{" "}
                  <a
                    href="https://facebook.com/key4u"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-smooth"
                  >
                    @Key4U
                  </a>
                </p>
                <p>
                  <strong className="text-card-foreground">Instagram:</strong>{" "}
                  <a
                    href="https://instagram.com/key4u"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-smooth"
                  >
                    @Key4U
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
