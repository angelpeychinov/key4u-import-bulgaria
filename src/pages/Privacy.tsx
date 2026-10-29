import { SEO } from "@/components/SEO";
import { useLanguage } from "@/contexts/LanguageContext";

const sections = ["who", "data", "use", "legal", "sharing", "retention", "rights", "cookies", "changes"];

export default function Privacy() {
  const { t } = useLanguage();
  return (
    <main className="min-h-screen bg-background px-4 pb-16 pt-28 text-foreground">
      <SEO title={t("privacy.title")} description={t("privacy.data.text")} canonicalUrl="https://key4u.bg/poveritelnost" />
      <article className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold sm:text-4xl">{t("privacy.title")}</h1>
        <p className="mb-10 mt-4 text-sm text-muted-foreground">{t("privacy.updated")}</p>
        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section}>
              <h2 className="mb-3 text-xl font-semibold">{t(`privacy.${section}.title`)}</h2>
              {section === "use" && <ul className="mb-3 list-disc space-y-2 pl-6 text-base leading-7">
                <li>{t("privacy.use.first")}</li><li>{t("privacy.use.second")}</li>
              </ul>}
              <p className="break-words text-base leading-7">{t(`privacy.${section}.text`)}</p>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
