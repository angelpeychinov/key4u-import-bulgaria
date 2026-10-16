import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { CheckCircle2, Car, Shield, FileCheck } from "lucide-react";

export function WhyKey4USection() {
  const { t } = useLanguage();
  const [revealed, setRevealed] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = gridRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setRevealed(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const benefits = [
    {
      icon: CheckCircle2,
      title: t("features.endToEnd"),
      description: t("features.endToEndDesc"),
    },
    {
      icon: FileCheck,
      title: t("features.realKm"),
      description: t("features.realKmDesc"),
    },
    {
      icon: Car,
      title: t("features.affordable"),
      description: t("features.affordableDesc"),
    },
    {
      icon: Shield,
      title: t("features.trust"),
      description: t("features.trustDesc"),
    },
  ];

  return (
    <section className="relative overflow-hidden bg-background py-20 md:py-28">
      {/* Decorative layers: hairline grid + soft brand glows */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "var(--pattern-grid)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse at center, black 35%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 35%, transparent 80%)",
        }}
      />
      <div className="pointer-events-none absolute -right-28 -top-24 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-1/4 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />

      <div className="container relative mx-auto px-4">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
          {/* Heading column */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <div className="mb-5 flex items-center gap-3">
                <span className="h-px w-10 bg-accent" />
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  {t("features.eyebrow")}
                </span>
              </div>
              <h2 className="text-3xl font-bold leading-tight text-primary md:text-[42px]">
                {t("features.title")}
              </h2>
              <p className="mt-5 max-w-sm text-base leading-relaxed text-muted-foreground">
                {t("features.lead")}
              </p>
            </div>
          </div>

          {/* Benefits grid */}
          <div ref={gridRef} className="grid gap-5 sm:grid-cols-2 lg:col-span-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <article
                  key={benefit.title}
                  className={`transition-all duration-700 ease-out ${
                    revealed ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                  }`}
                  style={{ transitionDelay: revealed ? `${index * 90}ms` : "0ms" }}
                >
                  <div className="group relative h-full overflow-hidden rounded-2xl border bg-card p-7 shadow-card transition-smooth hover:-translate-y-1 hover:shadow-elegant">
                    <span className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-gradient-accent transition-transform duration-500 group-hover:scale-x-100" />
                    <span className="pointer-events-none absolute -right-1 -top-6 select-none text-[78px] font-black leading-none text-foreground/5 transition-smooth group-hover:text-accent/20">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="relative">
                      <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-elegant transition-smooth group-hover:bg-gradient-accent group-hover:text-accent-foreground">
                        <Icon className="h-7 w-7" />
                      </div>
                      <h3 className="mt-6 text-lg font-semibold text-card-foreground">
                        {benefit.title}
                      </h3>
                      <span className="mt-3 block h-px w-8 bg-accent/60 transition-smooth group-hover:w-16" />
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
