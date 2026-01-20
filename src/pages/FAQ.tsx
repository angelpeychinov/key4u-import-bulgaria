import { SEO, FAQSchema } from "@/components/SEO";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQ() {
  const { t } = useLanguage();

  const faqs = [
    { q: 'faq.q1', a: 'faq.a1' },
    { q: 'faq.q2', a: 'faq.a2' },
    { q: 'faq.q3', a: 'faq.a3' },
    { q: 'faq.q4', a: 'faq.a4' },
    { q: 'faq.q5', a: 'faq.a5' },
  ];

  // Prepare FAQ data for schema
  const faqSchemaData = faqs.map(faq => ({
    question: t(faq.q),
    answer: t(faq.a)
  }));

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background">
      <SEO 
        title="Често задавани въпроси за внос на автомобили"
        description="Отговори на най-честите въпроси за внос на автомобили от Канада и САЩ в България. Цени, срокове, гаранции и процес на доставка от Key4U."
        canonicalUrl="https://key4u.bg/faq"
      />
      <FAQSchema faqs={faqSchemaData} />
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 text-foreground text-left">
            {t('faq.title')}
          </h1>
        </div>

        <div className="max-w-3xl mx-auto px-2 md:px-0">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card rounded-lg px-4 md:px-6 shadow-card"
              >
                <AccordionTrigger className="text-base md:text-lg font-semibold text-card-foreground hover:text-primary text-left">
                  {t(faq.q)}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-left">
                  {t(faq.a)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}
