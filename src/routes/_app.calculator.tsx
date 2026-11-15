import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { LANGUAGE_OPTIONS, MAJORS } from "@/data/universities";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
// Импортируем клиент Supabase (проверь, чтобы этот путь существовал)
import { supabase } from "@/lib/supabase"; 

export const Route = createFileRoute("/_app/calculator")({
  component: CalculatorPage,
});

// Переписываем тип Университета под структуру нашей таблицы в Supabase
type DBUniversity = {
  id: number;
  name_ru: string;
  country: string;
  min_ielts: number | null;
  min_gpa: number | null;
  link: string | null;
};

type Result = { high: DBUniversity[]; maybe: DBUniversity[] } | null;

function CalculatorPage() {
  const { t, tCountry } = useI18n();
  const [major, setMajor] = useState<string>(MAJORS[0] ?? "");
  const [gpa, setGpa] = useState<string>("3.5");
  const [lang, setLang] = useState<number>(6.5);
  const [result, setResult] = useState<Result>(null);
  const [loading, setLoading] = useState<boolean>(false); // Состояние загрузки данных

const compute = async () => {
    setLoading(true);
    
    // Безопасная обработка GPA с запятой
    const safeGpaString = gpa.replace(",", ".");
    const gpaNum = parseFloat(safeGpaString);

    if (isNaN(gpaNum)) {
      console.error("Введено некорректное значение GPA");
      setLoading(false);
      return;
    }

    // Делаем сложный запрос к Supabase с фильтрацией по связанной таблице
    const { data, error } = await supabase
      .from("universities")
      .select(`
        id,
        name_ru,
        country,
        min_gpa,
        min_ielts,
        link,
        university_majors!inner (
          major_id,
          majors!inner (
            name
          )
        )
      `)
      .eq("university_majors.majors.name", major); // Фильтр по специальности ("Economics", "Architecture" и т.д.)

    if (error) {
      console.error("Ошибка при получении вузов из Supabase:", error);
      setLoading(false);
      return;
    }

    // Так как тип данных изменился из-за вложенного запроса, приводим его к любому для простоты обхода циклом
    const fetchedUniversities = (data || []) as any[];
    const high: any[] = [];
    const maybe: any[] = [];

    fetchedUniversities.forEach((u) => {
      const minGPA = u.min_gpa ?? 0;
      const minLang = u.min_ielts ?? 0;

      const gpaOk = gpaNum >= minGPA;
      const gpaClose = gpaNum >= minGPA - 0.3 && gpaNum < minGPA;
      const langOk = lang >= minLang;
      const langClose = lang >= minLang - 0.5 && lang < minLang;

      if (gpaOk && langOk) {
        high.push(u);
      } else if ((gpaOk || gpaClose) && (langOk || langClose)) {
        maybe.push(u);
      }
    });

    setResult({ high, maybe });
    setLoading(false);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-4xl px-8 pb-16 pt-12">
        <header className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight">{t("calc.title")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("calc.subtitle")}
          </p>
        </header>

        <div className="rounded-2xl bg-secondary/60 p-6">
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label={t("calc.major")}>
              <select
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                className="w-full rounded-xl bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
              >
                {MAJORS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t("calc.gpa")}>
              <input
                type="number"
                step="0.1"
                min="0"
                max="4"
                value={gpa}
                onChange={(e) => setGpa(e.target.value)}
                className="w-full rounded-xl bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
            </Field>
            <Field label={t("calc.lang")}>
              <select
                value={lang}
                onChange={(e) => setLang(parseFloat(e.target.value))}
                className="w-full rounded-xl bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
              >
                {LANGUAGE_OPTIONS.map((l) => (
                  <option key={l.label} value={l.score}>
                    {l.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={compute}
            className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Вычисление..." : t("calc.submit")}
          </button>
        </div>

        {result && !loading && (
          <div className="mt-10 space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <ResultSection
              title={t("calc.high")}
              tone="high"
              items={result.high}
              emptyText={t("calc.empty.high")}
              tCountry={tCountry}
            />
            <ResultSection
              title={t("calc.maybe")}
              tone="maybe"
              items={result.maybe}
              emptyText={t("calc.empty.maybe")}
              tCountry={tCountry}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function ResultSection({
  title,
  tone,
  items,
  emptyText,
  tCountry,
}: {
  title: string;
  tone: "high" | "maybe";
  items: DBUniversity[];
  emptyText: string;
  tCountry: (s: string) => string;
}) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <span
          className={cn(
            "h-2 w-2 rounded-full",
            tone === "high" ? "bg-foreground" : "bg-muted-foreground/50",
          )}
        />
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        <span className="text-xs text-muted-foreground">{items.length}</span>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      ) : (
        <ul className="divide-y divide-border/60">
          {items.map((u) => (
            <li key={u.id} className="flex items-center justify-between gap-4 py-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg leading-none">🏛️</span> {/* Универсальная иконка здания вуза */}
                  <h3 className="truncate text-sm font-medium">
                    {u.link ? (
                      <a href={u.link} target="_blank" rel="noreferrer" className="hover:underline text-primary">
                        {u.name_ru}
                      </a>
                    ) : (
                      u.name_ru
                    )}
                  </h3>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{tCountry(u.country)}</p>
              </div>
              <div className="shrink-0 text-right text-xs text-muted-foreground">
                GPA ≥ {u.min_gpa ? u.min_gpa.toFixed(1) : "0.0"} · IELTS ≥ {u.min_ielts ? u.min_ielts.toFixed(1) : "—"}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}