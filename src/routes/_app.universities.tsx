import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MessageSquare, Globe, Building2, LayoutGrid, ExternalLink } from "lucide-react";
import { useState, useMemo } from "react";
import { UNIVERSITIES } from "@/data/universities";
import { useApp } from "@/lib/app-context";
import { useI18n } from "@/lib/i18n";


export const Route = createFileRoute("/_app/universities")({
  component: UniversitiesPage,
});

type FilterCategory = "all" | "kz" | "ru" | "other";

export function UniversitiesPage() {
  const navigate = useNavigate();
  const { setPendingPrompt } = useApp();
  const { t, tCountry, tCity } = useI18n();

  // Состояния
  const [filter, setFilter] = useState<FilterCategory>("all");
  const [displayCount, setDisplayCount] = useState(12);

  const discuss = (uniName: string, country: string) => {
    const prompt = t("uni.discussPrompt", { name: uniName, country });
    setPendingPrompt(prompt);
    navigate({ to: "/" });
  };

  // Определение категории страны
  const getCategory = (countryStr: string): "kz" | "ru" | "other" => {
    const c = countryStr.toLowerCase();
    if (c === "kazakhstan" || c === "kz" || c === "казахстан") return "kz";
    if (c === "russia" || c === "ru" || c === "россия" || c === "рф") return "ru";
    return "other";
  };

  // Фильтрация списка по категориям
  const filteredUniversities = useMemo(() => {
    return UNIVERSITIES.filter((u) => {
      const category = getCategory(u.country);
      if (filter !== "all" && category !== filter) return false;
      return true;
    });
  }, [filter]);

  // Подсчет количества для каждой вкладки
  const counts = useMemo(() => {
    let kz = 0, ru = 0, other = 0;
    UNIVERSITIES.forEach((u) => {
      const cat = getCategory(u.country);
      if (cat === "kz") kz++;
      else if (cat === "ru") ru++;
      else other++;
    });
    return { all: UNIVERSITIES.length, kz, ru, other };
  }, []);

  const visibleUniversities = filteredUniversities.slice(0, displayCount);

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-6xl px-8 pb-16 pt-12">
        
        {/* Заголовок и Вкладки */}
        <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{t("uni.title")}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Показано: {visibleUniversities.length} из {filteredUniversities.length}
            </p>
          </div>

          {/* Вкладки: Все / Казахстан / Россия / Другие страны */}
          <div className="inline-flex flex-wrap rounded-xl bg-secondary/80 p-1.5 backdrop-blur gap-1">
            <button
              type="button"
              onClick={() => { setFilter("all"); setDisplayCount(12); }}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                filter === "all"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Все ({counts.all})
            </button>

            <button
              type="button"
              onClick={() => { setFilter("kz"); setDisplayCount(12); }}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                filter === "kz"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Building2 className="h-3.5 w-3.5" />
              Казахстан ({counts.kz})
            </button>

            <button
              type="button"
              onClick={() => { setFilter("ru"); setDisplayCount(12); }}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                filter === "ru"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="text-xs">🇷🇺</span>
              Россия ({counts.ru})
            </button>

            <button
              type="button"
              onClick={() => { setFilter("other"); setDisplayCount(12); }}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                filter === "other"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Globe className="h-3.5 w-3.5" />
              Другие страны ({counts.other})
            </button>
          </div>
        </header>

        {/* Список вузов */}
        {filteredUniversities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
            <p>В этой категории пока нет университетов.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibleUniversities.map((u) => (
                <article
    key={u.id}
    className="flex flex-col gap-4 rounded-2xl bg-secondary/60 p-6 transition-colors hover:bg-secondary"
  >
    {/* Шапка карточки */}
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h3
          className="line-clamp-3 text-base font-semibold leading-snug text-foreground"
          title={u.name}
        >
          {u.name}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {tCity(u.city)}, {tCountry(u.country)}
        </p>
      </div>
      <span className="text-2xl leading-none">{u.flag}</span>
    </div>

    {/* Специальности (показываем, только если они указаны) */}
    {u.majors && u.majors.length > 0 && (
      <div className="flex flex-wrap gap-1.5">
        {u.majors.map((m) => (
          <span
            key={m}
            className="rounded-full bg-background px-2.5 py-1 text-[11px] text-muted-foreground"
          >
            {m}
          </span>
        ))}
      </div>
    )}

    {/* GPA и Язык (показываем, только если есть хотя бы одно значение) */}
    {(u.minGPA !== undefined || u.languageLabel) && (
      <dl className="grid grid-cols-2 gap-3 text-xs">
        {u.minGPA !== undefined && (
          <div>
            <dt className="text-muted-foreground">{t("uni.minGPA")}</dt>
            <dd className="mt-0.5 text-sm font-medium text-foreground">
              {u.minGPA.toFixed(1)}
            </dd>
          </div>
        )}
        {u.languageLabel && (
          <div>
            <dt className="text-muted-foreground">{t("uni.language")}</dt>
            <dd className="mt-0.5 text-sm font-medium text-foreground">
              {u.languageLabel}
            </dd>
          </div>
        )}
      </dl>
    )}

    {/* Кнопки действия */}
    <div className="mt-auto flex items-center gap-2 pt-2">
      <button
        type="button"
        onClick={() => discuss(u.name, tCountry(u.country))}
        className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        <MessageSquare className="h-3.5 w-3.5" strokeWidth={1.75} />
        {t("uni.discuss")}
      </button>

      {/* Если у казахстанского (или любого другого) вуза есть сайт — появится иконка-ссылка */}
      {u.website && (
        <a
          href={u.website}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-full bg-background p-2 text-muted-foreground hover:text-foreground transition-colors"
          title="Перейти на сайт университета"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      )}
    </div>
  </article>
))}
            </div>

            {/* Подгрузка новых карточек */}
            {visibleUniversities.length < filteredUniversities.length && (
              <div className="mt-10 flex justify-center">
                <button
                  type="button"
                  onClick={() => setDisplayCount((prev) => prev + 12)}
                  className="rounded-xl bg-secondary px-6 py-2.5 text-xs font-medium text-foreground hover:bg-secondary/80 transition-colors"
                >
                  Показать еще ({filteredUniversities.length - visibleUniversities.length})
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}