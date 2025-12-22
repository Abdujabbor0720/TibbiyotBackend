import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Custom decorator to extract the authenticated user from the request.
 * Used after JwtAuthGuard has validated the token.
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // If a specific property is requested, return that property
    return data ? user?.[data] : user;
  },
);

/**
 * Custom decorator to extract the Telegram user from the request.
 * Used after TelegramWebAppGuard has validated the initData.
 */
export const TelegramUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const telegramUser = request.telegramUser;

    return data ? telegramUser?.[data] : telegramUser;
  },
);

/**
 * Custom decorator to extract the verified Telegram initData from the request.
 */
export const TelegramInitData = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const initData = request.telegramInitData;

    return data ? initData?.[data] : initData;
  },
);
