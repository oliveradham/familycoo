import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type LangCode = string;

export const LANGUAGES: { code: LangCode; label: string }[] = [
  { code: "en-US", label: "English (United States)" },
  { code: "en-GB", label: "English (United Kingdom)" },
  { code: "en-AU", label: "English (Australia)" },
  { code: "en-CA", label: "English (Canada)" },
  { code: "es-ES", label: "Español (España)" },
  { code: "es-MX", label: "Español (México)" },
  { code: "es-AR", label: "Español (Argentina)" },
  { code: "fr-FR", label: "Français (France)" },
  { code: "fr-CA", label: "Français (Canada)" },
  { code: "de-DE", label: "Deutsch" },
  { code: "it-IT", label: "Italiano" },
  { code: "pt-BR", label: "Português (Brasil)" },
  { code: "pt-PT", label: "Português (Portugal)" },
  { code: "nl-NL", label: "Nederlands" },
  { code: "sv-SE", label: "Svenska" },
  { code: "no-NO", label: "Norsk" },
  { code: "da-DK", label: "Dansk" },
  { code: "fi-FI", label: "Suomi" },
  { code: "pl-PL", label: "Polski" },
  { code: "cs-CZ", label: "Čeština" },
  { code: "ro-RO", label: "Română" },
  { code: "hu-HU", label: "Magyar" },
  { code: "el-GR", label: "Ελληνικά" },
  { code: "tr-TR", label: "Türkçe" },
  { code: "ru-RU", label: "Русский" },
  { code: "uk-UA", label: "Українська" },
  { code: "ar-SA", label: "العربية (السعودية)" },
  { code: "ar-EG", label: "العربية (مصر)" },
  { code: "he-IL", label: "עברית" },
  { code: "fa-IR", label: "فارسی" },
  { code: "hi-IN", label: "हिन्दी" },
  { code: "bn-IN", label: "বাংলা" },
  { code: "ta-IN", label: "தமிழ்" },
  { code: "te-IN", label: "తెలుగు" },
  { code: "mr-IN", label: "मराठी" },
  { code: "gu-IN", label: "ગુજરાતી" },
  { code: "pa-IN", label: "ਪੰਜਾਬੀ" },
  { code: "ur-PK", label: "اردو" },
  { code: "th-TH", label: "ไทย" },
  { code: "vi-VN", label: "Tiếng Việt" },
  { code: "id-ID", label: "Bahasa Indonesia" },
  { code: "ms-MY", label: "Bahasa Melayu" },
  { code: "tl-PH", label: "Filipino" },
  { code: "zh-CN", label: "中文 (简体)" },
  { code: "zh-TW", label: "中文 (繁體)" },
  { code: "ja-JP", label: "日本語" },
  { code: "ko-KR", label: "한국어" },
  { code: "sw-KE", label: "Kiswahili" },
  { code: "am-ET", label: "አማርኛ" },
  { code: "zu-ZA", label: "isiZulu" },
  { code: "af-ZA", label: "Afrikaans" },
];

const RTL = new Set(["ar", "he", "fa", "ur"]);

// Translation keys used across the UI. Add more as needed.
type Dict = Record<string, string>;

const en: Dict = {
  "nav.today": "Today",
  "nav.inbox": "Inbox",
  "nav.ask": "Ask",
  "nav.week": "Week",
  "nav.review": "Review",
  "settings.title": "Settings",
  "settings.eyebrow": "Preferences",
  "settings.subtitle": "Adjust the times, tone, and permissions that shape how I run the household.",
  "settings.timeLocale": "Time & locale",
  "settings.language": "Language",
  "settings.languageHint": "Interface, briefings, and voice replies",
  "settings.timezone": "Timezone",
  "settings.timezoneHint": "Used for briefings, reminders, and departure times",
  "settings.clock24": "24-hour clock",
  "settings.weekStart": "Week starts on",
  "settings.household": "Household",
  "settings.manage": "Manage",
  "common.back": "Today",
};

const dicts: Record<string, Dict> = {
  en,
  es: {
    "nav.today": "Hoy",
    "nav.inbox": "Bandeja",
    "nav.ask": "Preguntar",
    "nav.week": "Semana",
    "nav.review": "Revisión",
    "settings.title": "Ajustes",
    "settings.eyebrow": "Preferencias",
    "settings.subtitle": "Ajusta los horarios, el tono y los permisos que definen cómo gestiono el hogar.",
    "settings.timeLocale": "Hora e idioma",
    "settings.language": "Idioma",
    "settings.languageHint": "Interfaz, resúmenes y respuestas de voz",
    "settings.timezone": "Zona horaria",
    "settings.timezoneHint": "Usada para resúmenes, recordatorios y horas de salida",
    "settings.clock24": "Reloj de 24 horas",
    "settings.weekStart": "La semana empieza en",
    "settings.household": "Hogar",
    "settings.manage": "Gestionar",
    "common.back": "Hoy",
  },
  fr: {
    "nav.today": "Aujourd'hui",
    "nav.inbox": "Boîte",
    "nav.ask": "Demander",
    "nav.week": "Semaine",
    "nav.review": "Bilan",
    "settings.title": "Réglages",
    "settings.eyebrow": "Préférences",
    "settings.subtitle": "Ajustez les horaires, le ton et les autorisations qui définissent la gestion du foyer.",
    "settings.timeLocale": "Heure et langue",
    "settings.language": "Langue",
    "settings.languageHint": "Interface, briefings et réponses vocales",
    "settings.timezone": "Fuseau horaire",
    "settings.timezoneHint": "Utilisé pour les briefings, rappels et heures de départ",
    "settings.clock24": "Horloge 24 h",
    "settings.weekStart": "La semaine commence le",
    "settings.household": "Foyer",
    "settings.manage": "Gérer",
    "common.back": "Aujourd'hui",
  },
  de: {
    "nav.today": "Heute",
    "nav.inbox": "Posteingang",
    "nav.ask": "Fragen",
    "nav.week": "Woche",
    "nav.review": "Rückblick",
    "settings.title": "Einstellungen",
    "settings.eyebrow": "Präferenzen",
    "settings.subtitle": "Passe Zeiten, Tonfall und Berechtigungen an, mit denen ich den Haushalt führe.",
    "settings.timeLocale": "Zeit & Sprache",
    "settings.language": "Sprache",
    "settings.languageHint": "Oberfläche, Briefings und Sprachantworten",
    "settings.timezone": "Zeitzone",
    "settings.timezoneHint": "Für Briefings, Erinnerungen und Abfahrtszeiten",
    "settings.clock24": "24-Stunden-Uhr",
    "settings.weekStart": "Woche beginnt am",
    "settings.household": "Haushalt",
    "settings.manage": "Verwalten",
    "common.back": "Heute",
  },
  it: {
    "nav.today": "Oggi",
    "nav.inbox": "In arrivo",
    "nav.ask": "Chiedi",
    "nav.week": "Settimana",
    "nav.review": "Riepilogo",
    "settings.title": "Impostazioni",
    "settings.eyebrow": "Preferenze",
    "settings.subtitle": "Regola orari, tono e permessi con cui gestisco la famiglia.",
    "settings.timeLocale": "Ora e lingua",
    "settings.language": "Lingua",
    "settings.languageHint": "Interfaccia, briefing e risposte vocali",
    "settings.timezone": "Fuso orario",
    "settings.timezoneHint": "Usato per briefing, promemoria e orari di partenza",
    "settings.clock24": "Orologio 24 ore",
    "settings.weekStart": "La settimana inizia il",
    "settings.household": "Famiglia",
    "settings.manage": "Gestisci",
    "common.back": "Oggi",
  },
  pt: {
    "nav.today": "Hoje",
    "nav.inbox": "Caixa",
    "nav.ask": "Perguntar",
    "nav.week": "Semana",
    "nav.review": "Revisão",
    "settings.title": "Configurações",
    "settings.eyebrow": "Preferências",
    "settings.subtitle": "Ajuste horários, tom e permissões que definem como cuido da casa.",
    "settings.timeLocale": "Hora e idioma",
    "settings.language": "Idioma",
    "settings.languageHint": "Interface, resumos e respostas por voz",
    "settings.timezone": "Fuso horário",
    "settings.timezoneHint": "Usado para resumos, lembretes e horários de saída",
    "settings.clock24": "Relógio 24 h",
    "settings.weekStart": "A semana começa em",
    "settings.household": "Casa",
    "settings.manage": "Gerenciar",
    "common.back": "Hoje",
  },
  nl: {
    "nav.today": "Vandaag",
    "nav.inbox": "Inbox",
    "nav.ask": "Vraag",
    "nav.week": "Week",
    "nav.review": "Overzicht",
    "settings.title": "Instellingen",
    "settings.eyebrow": "Voorkeuren",
    "settings.subtitle": "Pas de tijden, toon en permissies aan die bepalen hoe ik het huishouden run.",
    "settings.timeLocale": "Tijd & taal",
    "settings.language": "Taal",
    "settings.languageHint": "Interface, briefings en spraakantwoorden",
    "settings.timezone": "Tijdzone",
    "settings.timezoneHint": "Gebruikt voor briefings, herinneringen en vertrektijden",
    "settings.clock24": "24-uursklok",
    "settings.weekStart": "Week begint op",
    "settings.household": "Huishouden",
    "settings.manage": "Beheren",
    "common.back": "Vandaag",
  },
  ja: {
    "nav.today": "今日",
    "nav.inbox": "受信箱",
    "nav.ask": "質問",
    "nav.week": "今週",
    "nav.review": "振り返り",
    "settings.title": "設定",
    "settings.eyebrow": "環境設定",
    "settings.subtitle": "家庭運営の時間・トーン・権限を調整します。",
    "settings.timeLocale": "時刻と言語",
    "settings.language": "言語",
    "settings.languageHint": "画面、ブリーフィング、音声応答",
    "settings.timezone": "タイムゾーン",
    "settings.timezoneHint": "ブリーフィング、リマインダー、出発時刻に使用",
    "settings.clock24": "24時間表示",
    "settings.weekStart": "週の開始曜日",
    "settings.household": "世帯",
    "settings.manage": "管理",
    "common.back": "今日",
  },
  zh: {
    "nav.today": "今天",
    "nav.inbox": "收件箱",
    "nav.ask": "询问",
    "nav.week": "本周",
    "nav.review": "回顾",
    "settings.title": "设置",
    "settings.eyebrow": "偏好",
    "settings.subtitle": "调整我管理家庭的时间、语气和权限。",
    "settings.timeLocale": "时间与语言",
    "settings.language": "语言",
    "settings.languageHint": "界面、简报和语音回复",
    "settings.timezone": "时区",
    "settings.timezoneHint": "用于简报、提醒和出发时间",
    "settings.clock24": "24小时制",
    "settings.weekStart": "每周开始于",
    "settings.household": "家庭",
    "settings.manage": "管理",
    "common.back": "今天",
  },
  ko: {
    "nav.today": "오늘",
    "nav.inbox": "받은편지함",
    "nav.ask": "질문",
    "nav.week": "이번 주",
    "nav.review": "리뷰",
    "settings.title": "설정",
    "settings.eyebrow": "환경설정",
    "settings.subtitle": "가정을 운영하는 시간, 어조, 권한을 조정하세요.",
    "settings.timeLocale": "시간 및 언어",
    "settings.language": "언어",
    "settings.languageHint": "인터페이스, 브리핑, 음성 응답",
    "settings.timezone": "시간대",
    "settings.timezoneHint": "브리핑, 알림, 출발 시간에 사용",
    "settings.clock24": "24시간 표시",
    "settings.weekStart": "주 시작 요일",
    "settings.household": "가정",
    "settings.manage": "관리",
    "common.back": "오늘",
  },
  ar: {
    "nav.today": "اليوم",
    "nav.inbox": "الوارد",
    "nav.ask": "اسأل",
    "nav.week": "الأسبوع",
    "nav.review": "المراجعة",
    "settings.title": "الإعدادات",
    "settings.eyebrow": "التفضيلات",
    "settings.subtitle": "اضبط الأوقات والنبرة والصلاحيات التي أدير بها المنزل.",
    "settings.timeLocale": "الوقت واللغة",
    "settings.language": "اللغة",
    "settings.languageHint": "الواجهة والملخصات والردود الصوتية",
    "settings.timezone": "المنطقة الزمنية",
    "settings.timezoneHint": "تُستخدم للملخصات والتذكيرات وأوقات المغادرة",
    "settings.clock24": "نظام 24 ساعة",
    "settings.weekStart": "يبدأ الأسبوع يوم",
    "settings.household": "الأسرة",
    "settings.manage": "إدارة",
    "common.back": "اليوم",
  },
  he: {
    "nav.today": "היום",
    "nav.inbox": "דואר נכנס",
    "nav.ask": "שאל",
    "nav.week": "השבוע",
    "nav.review": "סיכום",
    "settings.title": "הגדרות",
    "settings.eyebrow": "העדפות",
    "settings.subtitle": "התאם זמנים, טון והרשאות לניהול הבית.",
    "settings.timeLocale": "זמן ושפה",
    "settings.language": "שפה",
    "settings.languageHint": "ממשק, תדריכים ותגובות קוליות",
    "settings.timezone": "אזור זמן",
    "settings.timezoneHint": "לתדריכים, תזכורות וזמני יציאה",
    "settings.clock24": "שעון 24 שעות",
    "settings.weekStart": "השבוע מתחיל ביום",
    "settings.household": "משק בית",
    "settings.manage": "ניהול",
    "common.back": "היום",
  },
  hi: {
    "nav.today": "आज",
    "nav.inbox": "इनबॉक्स",
    "nav.ask": "पूछें",
    "nav.week": "सप्ताह",
    "nav.review": "समीक्षा",
    "settings.title": "सेटिंग्स",
    "settings.eyebrow": "प्राथमिकताएँ",
    "settings.subtitle": "घर चलाने के समय, लहजे और अनुमतियाँ समायोजित करें।",
    "settings.timeLocale": "समय और भाषा",
    "settings.language": "भाषा",
    "settings.languageHint": "इंटरफ़ेस, ब्रीफिंग और आवाज़ उत्तर",
    "settings.timezone": "समय क्षेत्र",
    "settings.timezoneHint": "ब्रीफिंग, अनुस्मारक और प्रस्थान समय के लिए",
    "settings.clock24": "24-घंटा घड़ी",
    "settings.weekStart": "सप्ताह शुरू होता है",
    "settings.household": "परिवार",
    "settings.manage": "प्रबंधन",
    "common.back": "आज",
  },
  ru: {
    "nav.today": "Сегодня",
    "nav.inbox": "Входящие",
    "nav.ask": "Спросить",
    "nav.week": "Неделя",
    "nav.review": "Итоги",
    "settings.title": "Настройки",
    "settings.eyebrow": "Предпочтения",
    "settings.subtitle": "Настройте время, тон и разрешения, с которыми я веду хозяйство.",
    "settings.timeLocale": "Время и язык",
    "settings.language": "Язык",
    "settings.languageHint": "Интерфейс, брифинги и голосовые ответы",
    "settings.timezone": "Часовой пояс",
    "settings.timezoneHint": "Для брифингов, напоминаний и времени выхода",
    "settings.clock24": "24-часовой формат",
    "settings.weekStart": "Неделя начинается с",
    "settings.household": "Семья",
    "settings.manage": "Управлять",
    "common.back": "Сегодня",
  },
  tr: {
    "nav.today": "Bugün",
    "nav.inbox": "Gelen",
    "nav.ask": "Sor",
    "nav.week": "Hafta",
    "nav.review": "Özet",
    "settings.title": "Ayarlar",
    "settings.eyebrow": "Tercihler",
    "settings.subtitle": "Evi nasıl yönettiğimi belirleyen saatleri, tonu ve izinleri ayarlayın.",
    "settings.timeLocale": "Saat ve dil",
    "settings.language": "Dil",
    "settings.languageHint": "Arayüz, brifingler ve sesli yanıtlar",
    "settings.timezone": "Saat dilimi",
    "settings.timezoneHint": "Brifingler, hatırlatıcılar ve çıkış saatleri için",
    "settings.clock24": "24 saat gösterimi",
    "settings.weekStart": "Hafta şu günden başlar",
    "settings.household": "Ev halkı",
    "settings.manage": "Yönet",
    "common.back": "Bugün",
  },
};

function dictFor(code: LangCode): Dict {
  const base = code.split("-")[0];
  return { ...en, ...(dicts[base] ?? {}) };
}

type Ctx = {
  lang: LangCode;
  setLang: (c: LangCode) => void;
  t: (key: keyof typeof en | string) => string;
  dir: "ltr" | "rtl";
};

const LanguageContext = createContext<Ctx | null>(null);
const STORAGE_KEY = "familycoo.lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Start with "en-US" on both server and initial client render to avoid hydration mismatch.
  const [lang, setLangState] = useState<LangCode>("en-US");

  // Hydrate from localStorage after mount.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setLangState(saved);
    } catch {
      // ignore
    }
  }, []);

  const dir: "ltr" | "rtl" = RTL.has(lang.split("-")[0]) ? "rtl" : "ltr";

  // Apply to <html> so the whole document reflects the choice.
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const setLang = useCallback((c: LangCode) => {
    setLangState(c);
    try {
      window.localStorage.setItem(STORAGE_KEY, c);
    } catch {
      // ignore
    }
  }, []);

  const dict = useMemo(() => dictFor(lang), [lang]);
  const t = useCallback((key: string) => dict[key] ?? en[key] ?? key, [dict]);

  const value = useMemo(() => ({ lang, setLang, t, dir }), [lang, setLang, t, dir]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Safe fallback so components can render outside the provider (e.g. error boundaries).
    return {
      lang: "en-US" as LangCode,
      setLang: () => {},
      t: (k: string) => en[k] ?? k,
      dir: "ltr" as const,
    };
  }
  return ctx;
}
