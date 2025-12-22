import {
  IsString,
  IsNotEmpty,
} from 'class-validator';

/**
 * DTO for Telegram WebApp authentication.
 */
export class TelegramAuthDto {
  @IsString()
  @IsNotEmpty()
  initData: string;
}
