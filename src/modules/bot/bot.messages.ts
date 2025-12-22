/**
 * Bot messages for multiple languages
 */

export const BotMessages = {
  uz: {
    welcome: "Assalomu alaykum! 👋\n\nTilni tanlang:",
    languageSelected: "O'zbek tili tanlandi ✅",
    openWebApp: "📱 Ilovani ochish",
    selectLanguage: "Tilni tanlang:",
  },
  ru: {
    welcome: "Здравствуйте! 👋\n\nВыберите язык:",
    languageSelected: "Выбран русский язык ✅",
    openWebApp: "📱 Открыть приложение",
    selectLanguage: "Выберите язык:",
  },
  en: {
    welcome: "Hello! 👋\n\nSelect language:",
    languageSelected: "English language selected ✅",
    openWebApp: "📱 Open App",
    selectLanguage: "Select language:",
  },
} as const;

export type SupportedLanguage = keyof typeof BotMessages;

export const LanguageButtons = {
  uz: "🇺🇿 O'zbek",
  ru: "🇷🇺 Русский",
  en: "🇺🇸 English",
} as const;

export function getMessages(lang: SupportedLanguage) {
  return BotMessages[lang] || BotMessages.uz;
}

export function getLanguageFromCallback(callback: string): SupportedLanguage | null {
  if (callback === 'lang:uz') return 'uz';
  if (callback === 'lang:ru') return 'ru';
  if (callback === 'lang:en') return 'en';
  return null;
}
