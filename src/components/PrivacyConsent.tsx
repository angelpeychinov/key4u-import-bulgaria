import { useId } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export function PrivacyConsent({ checked, onChange, error, disabled }: {
  checked: boolean; onChange: (checked: boolean) => void; error: boolean; disabled?: boolean;
}) {
  const { t } = useLanguage();
  const id = useId();
  return (
    <div>
      <div className="flex min-h-11 items-start gap-3 text-sm leading-relaxed">
        <input id={id} type="checkbox" checked={checked} disabled={disabled}
          onChange={(event) => onChange(event.target.checked)} aria-required="true"
          aria-invalid={error} aria-describedby={error ? `${id}-error` : undefined}
          className="mt-3 h-5 w-5 shrink-0 accent-primary" />
        <div className="min-w-0">
          <label htmlFor={id} className="inline-block min-h-11 cursor-pointer py-2">{t("privacy.consent")}</label>{" "}
          <a href="/poveritelnost" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4">{t("privacy.title")}</a>
        </div>
      </div>
      {error && <p id={`${id}-error`} role="alert" className="mt-1 text-sm text-destructive">{t("privacy.required")}</p>}
    </div>
  );
}
