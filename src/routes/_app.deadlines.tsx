import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DEADLINES } from "@/data/deadlines";
import { cn } from "@/lib/utils";
import { useI18n, type Lang } from "@/lib/i18n";

export const Route = createFileRoute("/_app/deadlines")({
  component: DeadlinesPage,
});

const MONTHS: Record<Lang, string[]> = {
  ru: ["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"],
  en: ["January","February","March","April","May","June","July","August","September","October","November","December"],
  kk: ["қаңтар","ақпан","наурыз","сәуір","мамыр","маусым","шілде","тамыз","қыркүйек","қазан","қараша","желтоқсан"],
};

function formatDate(iso: string, lang: Lang) {
  const d = new Date(iso);
  const months = MONTHS[lang];
  return lang === "en"
    ? `${months[d.getMonth()]} ${d.getDate()}`
    : `${d.getDate()} ${months[d.getMonth()]}`;
}

function daysLeft(iso: string) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const d = new Date(iso);
  return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function DeadlinesPage() {
  const { t, lang, tRegion, tDeadlineTitle } = useI18n();
  const sorted = [...DEADLINES].sort((a, b) => a.date.localeCompare(b.date));
  // Compute "days left" only after mount to avoid SSR/CSR hydration drift
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-3xl px-8 pb-16 pt-12">
        <header className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight">{t("dl.title")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("dl.subtitle")}
          </p>
        </header>

        <ol className="relative space-y-1">
          {sorted.map((d) => {
            const left = daysLeft(d.date);
            const urgent = left >= 0 && left <= 7;
            const past = left < 0;
            return (
              <li
                key={d.id}
                className="grid grid-cols-[110px_1fr_auto] items-baseline gap-6 border-b border-border/50 py-5 last:border-b-0"
              >
                <time className="text-sm font-medium text-foreground">
                  {formatDate(d.date, lang)}
                </time>
                <div className="min-w-0">
                  <p className="text-[15px] leading-snug text-foreground">
                    {tDeadlineTitle(d.id, d.title)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{tRegion(d.region)}</p>
                </div>
                <span
                  suppressHydrationWarning
                  className={cn(
                    "shrink-0 text-xs",
                    mounted && past
                      ? "text-muted-foreground/60"
                      : mounted && urgent
                        ? "font-medium text-destructive"
                        : "text-muted-foreground",
                  )}
                >
                  {!mounted
                    ? ""
                    : past
                      ? t("dl.past")
                      : left === 0
                        ? t("dl.today")
                        : lang === "ru"
                          ? `${t("dl.left")} ${left} ${plural(left)}`
                          : lang === "kk"
                            ? `${left} ${kkDay(left)} ${t("dl.left")}`
                            : `${left} ${left === 1 ? "day" : "days"} ${t("dl.left").toLowerCase()}`}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

function plural(n: number) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "день";
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return "дня";
  return "дней";
}

function kkDay(_n: number) {
  return "күн";
}