import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

/**
 * DTO for development-only authentication.
 * Only works when NODE_ENV !== 'production'
 */
export class DevAuthDto {
  @IsString()
  @IsNotEmpty()
  telegramUserId: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  languageCode?: string;
}
