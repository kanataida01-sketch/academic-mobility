import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Lang = "ru" | "en" | "kk";

export const LANGUAGES: { code: Lang; label: string; short: string }[] = [
  { code: "ru", label: "Русский", short: "RU" },
  { code: "en", label: "English", short: "EN" },
  { code: "kk", label: "Қазақша", short: "KZ" },
];

type Dict = Record<string, string>;

const COMMON: Record<Lang, Dict> = {
  ru: {
    "brand": "Mobility",
    "nav.chat": "Чат-ассистент",
    "nav.universities": "Вузы-партнёры",
    "nav.calculator": "Калькулятор шансов",
    "nav.deadlines": "Календарь дедлайнов",
    "sidebar.collapse": "Свернуть",
    "sidebar.theme.light": "Светлая тема",
    "sidebar.theme.dark": "Тёмная тема",
    "sidebar.language": "Язык",

    "chat.title": "Makhambet «AI Academic Mobility»",
    "chat.subtitle.role": "ИНТЕЛЛЕКТУАЛЬНЫЙ КОНСУЛЬТАНТ ПО АКАДЕМИЧЕСКОЙ МОБИЛЬНОСТИ",
    "chat.subtitle.heading": "Автоматизированный поиск информации по программам внешнего и внутреннего обмена",
    "chat.subtitle.desc": "Сервис предназначен для оперативного консультирования студентов и преподавателей по вопросам академической мобильности. База данных содержит актуальные критерии отбора, перечень необходимых документов для участия в программах Erasmus+, DAAD, Mevlana, Orhun.",
    "chat.you": "Вы",
    "chat.assistant": "Ассистент",
    "chat.placeholder": "Спросите что-нибудь...",
    "chat.send": "Отправить",
    "chat.starter.1": "Какие документы нужны для академической мобильности?",
    "chat.starter.2": "Дедлайны в Южную Корею на весенний семестр",
    "chat.starter.3": "Как получить стипендию Erasmus+?",

    "uni.title": "Вузы-партнёры",
    "uni.subtitle": "{n} зарубежных университетов открыты для академической мобильности",
    "uni.minGPA": "Мин. GPA",
    "uni.language": "Язык",
    "uni.discuss": "Обсудить в чате",
    "uni.discussPrompt":
      "Расскажи подробнее про {name} ({country}): сроки подачи, требования к поступлению, необходимые документы и мои шансы поступить.",

    "calc.title": "Калькулятор шансов",
    "calc.subtitle": "Подберите вузы под ваши академические показатели",
    "calc.major": "Специальность",
    "calc.gpa": "Текущий GPA",
    "calc.lang": "Уровень языка",
    "calc.submit": "Подобрать программы",
    "calc.high": "Высокий шанс",
    "calc.maybe": "Можно попробовать",
    "calc.empty.high": "Нет полностью подходящих программ. Посмотрите «Можно попробовать».",
    "calc.empty.maybe": "Близких по требованиям программ не найдено.",

    "dl.title": "Календарь дедлайнов",
    "dl.subtitle": "Ключевые даты академической мобильности — от ближайших к дальним",
    "dl.past": "Прошло",
    "dl.today": "Сегодня",
    "dl.left": "Осталось",
  },
  en: {
    "brand": "Mobility",
    "nav.chat": "AI Assistant",
    "nav.universities": "Partner Universities",
    "nav.calculator": "Chances Calculator",
    "nav.deadlines": "Deadlines Calendar",
    "sidebar.collapse": "Collapse",
    "sidebar.theme.light": "Light theme",
    "sidebar.theme.dark": "Dark theme",
    "sidebar.language": "Language",

    "chat.title": "Makhambet «AI Academic Mobility»",
    "chat.subtitle.heading": "Automated Information Search for External and Internal Exchange Programs",
    "chat.subtitle.desc": "The service is designed for prompt counseling of students and faculty members on academic mobility issues. The database contains current selection criteria, the list of required documents for participation in Erasmus+, DAAD, Mevlana, and Orhun programs.",
    "chat.you": "You",
    "chat.assistant": "Assistant",
    "chat.placeholder": "Ask anything...",
    "chat.send": "Send",
    "chat.starter.1": "What documents do I need for academic mobility?",
    "chat.starter.2": "Spring semester deadlines for South Korea",
    "chat.starter.3": "How do I get an Erasmus+ scholarship?",

    "uni.title": "Partner Universities",
    "uni.subtitle": "{n} universities abroad open for academic mobility",
    "uni.minGPA": "Min. GPA",
    "uni.language": "Language",
    "uni.discuss": "Discuss in chat",
    "uni.discussPrompt":
      "Tell me more about {name} ({country}): application deadlines, admission requirements, documents needed and my chances of getting in.",

    "calc.title": "Chances Calculator",
    "calc.subtitle": "Find universities that match your academic profile",
    "calc.major": "Major",
    "calc.gpa": "Current GPA",
    "calc.lang": "Language level",
    "calc.submit": "Find programs",
    "calc.high": "High chance",
    "calc.maybe": "Worth trying",
    "calc.empty.high": "No fully matching programs. Check \u201CWorth trying\u201D.",
    "calc.empty.maybe": "No close-fit programs found.",

    "dl.title": "Deadlines Calendar",
    "dl.subtitle": "Key academic mobility dates — from nearest to farthest",
    "dl.past": "Passed",
    "dl.today": "Today",
    "dl.left": "Left",
  },
  kk: {
    "brand": "Mobility",
    "nav.chat": "Чат-көмекші",
    "nav.universities": "Серіктес ЖОО-лар",
    "nav.calculator": "Мүмкіндік калькуляторы",
    "nav.deadlines": "Мерзімдер күнтізбесі",
    "sidebar.collapse": "Жию",
    "sidebar.theme.light": "Ашық тақырып",
    "sidebar.theme.dark": "Қараңғы тақырып",
    "sidebar.language": "Тіл",

    "chat.title": "Makhambet «AI Academic Mobility»",
    "chat.subtitle.heading": "Сыртқы және ішкі алмасу бағдарламалары бойынша ақпаратты автоматты түрде іздеу",
    "chat.subtitle.desc": "Сервис студенттер мен оқытушыларға академиялық ұтқырлық мәселелері бойынша жедел кеңес беруге арналған. Мәліметтер базасында іріктеудің өзекті критерийлері, Erasmus+, DAAD, Mevlana, Orhun бағдарламаларына қатысу үшін қажетті құжаттар тізбесі.",
    "chat.you": "Сіз",
    "chat.assistant": "Көмекші",
    "chat.placeholder": "Бірдеңе сұраңыз...",
    "chat.send": "Жіберу",
    "chat.starter.1": "Академиялық ұтқырлық үшін қандай құжаттар қажет?",
    "chat.starter.2": "Көктемгі семестрге Оңтүстік Кореяға мерзімдер",
    "chat.starter.3": "Erasmus+ стипендиясын қалай алуға болады?",

    "uni.title": "Серіктес ЖОО-лар",
    "uni.subtitle": "Академиялық ұтқырлыққа {n} шетелдік университет ашық",
    "uni.minGPA": "Мин. GPA",
    "uni.language": "Тіл",
    "uni.discuss": "Чатта талқылау",
    "uni.discussPrompt":
      "{name} ({country}) туралы толығырақ айтыңыз: өтінім мерзімдері, түсу талаптары, қажетті құжаттар және менің түсу мүмкіндігім.",

    "calc.title": "Мүмкіндік калькуляторы",
    "calc.subtitle": "Академиялық көрсеткіштеріңізге сай ЖОО таңдаңыз",
    "calc.major": "Мамандық",
    "calc.gpa": "Ағымдағы GPA",
    "calc.lang": "Тіл деңгейі",
    "calc.submit": "Бағдарламаларды табу",
    "calc.high": "Жоғары мүмкіндік",
    "calc.maybe": "Сынап көруге болады",
    "calc.empty.high": "Толық сәйкес бағдарлама жоқ. «Сынап көруге болады» қараңыз.",
    "calc.empty.maybe": "Жақын талаптағы бағдарламалар табылмады.",

    "dl.title": "Мерзімдер күнтізбесі",
    "dl.subtitle": "Академиялық ұтқырлықтың негізгі мерзімдері — жақыннан алысқа",
    "dl.past": "Өтіп кетті",
    "dl.today": "Бүгін",
    "dl.left": "Қалды",
  },
};

// Country / city translations keyed by Russian source value
const COUNTRY: Record<Lang, Dict> = {
  ru: {},
  en: {
    "Южная Корея": "South Korea",
    "Германия": "Germany",
    "Франция": "France",
    "Канада": "Canada",
    "Сингапур": "Singapore",
    "Швеция": "Sweden",
    "Новая Зеландия": "New Zealand",
    "Нидерланды": "Netherlands",
  },
  kk: {
    "Южная Корея": "Оңтүстік Корея",
    "Германия": "Германия",
    "Франция": "Франция",
    "Канада": "Канада",
    "Сингапур": "Сингапур",
    "Швеция": "Швеция",
    "Новая Зеландия": "Жаңа Зеландия",
    "Нидерланды": "Нидерланд",
  },
};

const CITY: Record<Lang, Dict> = {
  ru: {},
  en: {
    "Сеул": "Seoul",
    "Мюнхен": "Munich",
    "Париж": "Paris",
    "Торонто": "Toronto",
    "Сингапур": "Singapore",
    "Стокгольм": "Stockholm",
    "Окленд": "Auckland",
    "Амстердам": "Amsterdam",
  },
  kk: {
    "Сеул": "Сеул",
    "Мюнхен": "Мюнхен",
    "Париж": "Париж",
    "Торонто": "Торонто",
    "Сингапур": "Сингапур",
    "Стокгольм": "Стокгольм",
    "Окленд": "Окленд",
    "Амстердам": "Амстердам",
  },
};

const REGION: Record<Lang, Dict> = {
  ru: {},
  en: {
    "Европа": "Europe",
    "Южная Корея": "South Korea",
    "Канада": "Canada",
    "Международное": "International",
    "Азия": "Asia",
    "Германия": "Germany",
  },
  kk: {
    "Европа": "Еуропа",
    "Южная Корея": "Оңтүстік Корея",
    "Канада": "Канада",
    "Международное": "Халықаралық",
    "Азия": "Азия",
    "Германия": "Германия",
  },
};

// Deadline titles keyed by id
const DEADLINE_TITLES: Record<Lang, Dict> = {
  ru: {},
  en: {
    "1": "Applications open for spring semester in Europe",
    "2": "Document submission deadline for Seoul National University",
    "3": "Erasmus+ program application closes",
    "4": "Motivation letters due for Canadian universities",
    "5": "IELTS registration for summer programs",
    "6": "Applications open for summer semester in Singapore and NUS",
    "7": "Final document submission for DAAD scholarships",
    "8": "Application deadline for fall semester in Europe",
  },
  kk: {
    "1": "Еуропаға көктемгі семестрге өтінім қабылдау",
    "2": "Сеул ұлттық университетіне құжат тапсыру мерзімі",
    "3": "Erasmus+ бағдарламасына қабылдау жабылады",
    "4": "Канада ЖОО-ларына мотивациялық хаттар тапсыру",
    "5": "Жазғы бағдарламаларға IELTS тіркеуі",
    "6": "Сингапур мен NUS-қа жазғы семестрге қабылдау",
    "7": "DAAD стипендиясына құжаттарды соңғы тапсыру",
    "8": "Еуропада күзгі семестрге өтінім мерзімі",
  },
};

type I18nValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  tCountry: (s: string) => string;
  tCity: (s: string) => string;
  tRegion: (s: string) => string;
  tDeadlineTitle: (id: string, fallback: string) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

function format(s: string, vars?: Record<string, string | number>) {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ru");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("mobility-lang") as Lang | null;
      if (stored && ["ru", "en", "kk"].includes(stored)) setLangState(stored);
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    try {
      localStorage.setItem("mobility-lang", l);
    } catch {}
    setLangState(l);
  }, []);

  const value = useMemo<I18nValue>(() => {
    const dict = COMMON[lang];
    return {
      lang,
      setLang,
      t: (key, vars) => format(dict[key] ?? COMMON.ru[key] ?? key, vars),
      tCountry: (s) => COUNTRY[lang][s] ?? s,
      tCity: (s) => CITY[lang][s] ?? s,
      tRegion: (s) => REGION[lang][s] ?? s,
      tDeadlineTitle: (id, fallback) => DEADLINE_TITLES[lang][id] ?? fallback,
    };
  }, [lang, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}