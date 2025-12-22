import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bot, Context, InlineKeyboard, session, SessionFlavor } from 'grammy';
import { User } from '../../database/entities';
import { Language } from '../../database/enums';

// Session data - minimal for language selection only
interface SessionData {
  language?: Language;
}

type MyContext = Context & SessionFlavor<SessionData>;

// Language names for display
const languageNames: Record<Language, string> = {
  [Language.UZ_LAT]: "O'zbek (Lotin)",
  [Language.UZ_CYR]: "Ўзбек (Кирилл)",
  [Language.RU]: "Русский",
  [Language.EN]: "English",
};

// Translations - only what's needed
const translations = {
  selectLanguage: {
    [Language.UZ_LAT]: "🌐 Tilni tanlang / Выберите язык / Select language:",
    [Language.UZ_CYR]: "🌐 Тилни танланг / Tilni tanlang / Select language:",
    [Language.RU]: "🌐 Выберите язык / Tilni tanlang / Select language:",
    [Language.EN]: "🌐 Select language / Tilni tanlang / Выберите язык:",
  },
  welcomeWithApp: {
    [Language.UZ_LAT]: "✅ Til saqlandi!\n\n🎓 TDTU talabalari uchun axborot tizimiga xush kelibsiz!\n\n📱 Quyidagi tugmani bosib ilovani oching:",
    [Language.UZ_CYR]: "✅ Тил сақланди!\n\n🎓 ТДТУ талабалари учун ахборот тизимига хуш келибсиз!\n\n📱 Қуйидаги тугмани босиб иловани очинг:",
    [Language.RU]: "✅ Язык сохранен!\n\n🎓 Добро пожаловать в информационную систему для студентов ТГСУ!\n\n📱 Нажмите кнопку ниже, чтобы открыть приложение:",
    [Language.EN]: "✅ Language saved!\n\n🎓 Welcome to the information system for TSSU students!\n\n📱 Click the button below to open the app:",
  },
  openApp: {
    [Language.UZ_LAT]: "📱 Ilovani ochish",
    [Language.UZ_CYR]: "📱 Иловани очиш",
    [Language.RU]: "📱 Открыть приложение",
    [Language.EN]: "📱 Open App",
  },
  changeLanguage: {
    [Language.UZ_LAT]: "🌐 Tilni o'zgartirish",
    [Language.UZ_CYR]: "🌐 Тилни ўзгартириш",
    [Language.RU]: "🌐 Изменить язык",
    [Language.EN]: "🌐 Change language",
  },
  languageChanged: {
    [Language.UZ_LAT]: "✅ Til o'zgartirildi",
    [Language.UZ_CYR]: "✅ Тил ўзгартирилди",
    [Language.RU]: "✅ Язык изменен",
    [Language.EN]: "✅ Language changed",
  },
  useAppMessage: {
    [Language.UZ_LAT]: "📱 Barcha funksiyalar ilovada mavjud. Quyidagi tugmani bosing:",
    [Language.UZ_CYR]: "📱 Барча функциялар иловада мавжуд. Қуйидаги тугмани босинг:",
    [Language.RU]: "📱 Все функции доступны в приложении. Нажмите кнопку ниже:",
    [Language.EN]: "📱 All features are available in the app. Click the button below:",
  },
};

function t(key: keyof typeof translations, language: Language): string {
  return translations[key][language] || translations[key][Language.UZ_LAT];
}

@Injectable()
export class BotService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BotService.name);
  private bot: Bot<MyContext>;
  private isRunning = false;
  private webAppUrl: string;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {
    this.webAppUrl = this.configService.get<string>('telegram.webAppUrl') || 'https://localhost:3000';
  }

  async onModuleInit() {
    const token = this.configService.get<string>('telegram.botToken');
    if (!token) {
      this.logger.error('Telegram bot token not configured');
      return;
    }

    this.bot = new Bot<MyContext>(token);

    // Initialize session middleware
    this.bot.use(session({
      initial: (): SessionData => ({}),
      getSessionKey: (ctx) => ctx.from?.id.toString(),
    }));

    // Setup handlers
    this.setupHandlers();

    // Start the bot
    try {
      this.bot.start({
        onStart: (botInfo) => {
          this.logger.log(`Bot started: @${botInfo.username}`);
          this.isRunning = true;
        },
      });
    } catch (error) {
      this.logger.error('Failed to start bot', error);
    }
  }

  async onModuleDestroy() {
    if (this.isRunning) {
      await this.bot.stop();
      this.isRunning = false;
      this.logger.log('Bot stopped');
    }
  }

  /**
   * Setup all bot handlers - simplified for WebApp only.
   */
  private setupHandlers() {
    // Start command - show language selection
    this.bot.command('start', this.handleStart.bind(this));

    // Language command
    this.bot.command('language', this.showLanguageSelection.bind(this));

    // Callback queries (inline keyboard buttons)
    this.bot.on('callback_query:data', this.handleCallback.bind(this));

    // Any text message - redirect to WebApp
    this.bot.on('message:text', this.handleText.bind(this));

    // Error handler
    this.bot.catch((err) => {
      this.logger.error('Bot error:', err);
    });
  }

  /**
   * Handle /start command - show language selection.
   */
  private async handleStart(ctx: MyContext) {
    const telegramUserId = ctx.from!.id.toString();
    
    // Check if user exists
    let user = await this.userRepository.findOne({
      where: { telegramUserId },
    });

    if (!user) {
      // New user - show language selection
      await this.showLanguageSelection(ctx);
      return;
    }

    // Existing user - show WebApp button
    ctx.session.language = user.language;
    await this.showWebAppButton(ctx, user.language);
  }

  /**
   * Show language selection keyboard.
   */
  private async showLanguageSelection(ctx: MyContext) {
    const keyboard = new InlineKeyboard()
      .text("🇺🇿 O'zbek (Lotin)", 'lang_uz_lat')
      .text("🇺🇿 Ўзбек (Кирилл)", 'lang_uz_cyr')
      .row()
      .text("🇷🇺 Русский", 'lang_ru')
      .text("🇬🇧 English", 'lang_en');

    const language = ctx.session.language || Language.UZ_LAT;
    await ctx.reply(t('selectLanguage', language), {
      reply_markup: keyboard,
    });
  }

  /**
   * Show WebApp button.
   */
  private async showWebAppButton(ctx: MyContext, language: Language, isWelcome = false) {
    // Check if WebApp URL is valid (not localhost)
    const isLocalhost = this.webAppUrl.includes('localhost') || this.webAppUrl.includes('127.0.0.1');
    
    if (isLocalhost) {
      // In development with localhost, show message without WebApp button
      const devMessage = isWelcome
        ? `${t('welcomeWithApp', language)}\n\n⚠️ Development mode: WebApp URL is localhost. Use ngrok for testing.`
        : `${t('useAppMessage', language)}\n\n⚠️ WebApp: ${this.webAppUrl}`;
      
      const keyboard = new InlineKeyboard()
        .text(t('changeLanguage', language), 'change_language');
      
      await ctx.reply(devMessage, {
        reply_markup: keyboard,
      });
      return;
    }

    const keyboard = new InlineKeyboard()
      .webApp(t('openApp', language), this.webAppUrl)
      .row()
      .text(t('changeLanguage', language), 'change_language');

    const message = isWelcome 
      ? t('welcomeWithApp', language)
      : t('useAppMessage', language);

    await ctx.reply(message, {
      reply_markup: keyboard,
    });
  }

  /**
   * Handle callback queries.
   */
  private async handleCallback(ctx: MyContext) {
    const data = ctx.callbackQuery?.data;
    if (!data) return;
    
    const telegramUserId = ctx.from!.id.toString();

    // Language selection
    if (data.startsWith('lang_')) {
      const langMap: Record<string, Language> = {
        'lang_uz_lat': Language.UZ_LAT,
        'lang_uz_cyr': Language.UZ_CYR,
        'lang_ru': Language.RU,
        'lang_en': Language.EN,
      };
      const language = langMap[data];
      
      if (language) {
        ctx.session.language = language;
        
        // Find or create user
        let user = await this.userRepository.findOne({
          where: { telegramUserId },
        });

        if (!user) {
          // Create new user with selected language
          user = this.userRepository.create({
            telegramUserId,
            language,
            firstName: ctx.from?.first_name || 'User',
            lastName: ctx.from?.last_name,
            username: ctx.from?.username,
            botStartedAt: new Date(),
          });
          await this.userRepository.save(user);
          this.logger.log(`New user created: ${telegramUserId}`);
        } else {
          // Update language for existing user
          user.language = language;
          await this.userRepository.save(user);
        }

        await ctx.answerCallbackQuery(t('languageChanged', language));
        
        // Delete the language selection message
        try {
          await ctx.deleteMessage();
        } catch (e) {
          // Ignore if can't delete
        }
        
        // Show WebApp button
        await this.showWebAppButton(ctx, language, true);
      }
      return;
    }

    // Change language
    if (data === 'change_language') {
      await ctx.answerCallbackQuery();
      await this.showLanguageSelection(ctx);
      return;
    }

    await ctx.answerCallbackQuery();
  }

  /**
   * Handle text messages - redirect to WebApp.
   */
  private async handleText(ctx: MyContext) {
    const telegramUserId = ctx.from!.id.toString();
    
    // Get user's language
    const user = await this.userRepository.findOne({
      where: { telegramUserId },
    });

    const language = user?.language || ctx.session.language || Language.UZ_LAT;
    
    if (!user) {
      // No user - show language selection
      await this.showLanguageSelection(ctx);
      return;
    }

    // Redirect to WebApp
    await this.showWebAppButton(ctx, language);
  }

  /**
   * Send a message to a user (for notifications/broadcasts).
   */
  async sendMessage(telegramUserId: string, message: string): Promise<boolean> {
    try {
      await this.bot.api.sendMessage(telegramUserId, message);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send message to ${telegramUserId}`, error);
      return false;
    }
  }

  /**
   * Send WebApp button to a user.
   */
  async sendWebAppButton(telegramUserId: string, language: Language, message?: string): Promise<boolean> {
    try {
      const keyboard = new InlineKeyboard()
        .webApp(t('openApp', language), this.webAppUrl);

      await this.bot.api.sendMessage(
        telegramUserId, 
        message || t('useAppMessage', language),
        { reply_markup: keyboard }
      );
      return true;
    } catch (error) {
      this.logger.error(`Failed to send WebApp button to ${telegramUserId}`, error);
      return false;
    }
  }
}
