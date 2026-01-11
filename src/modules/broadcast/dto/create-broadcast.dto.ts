import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsArray,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO for creating a broadcast message.
 * 
 * REQUIRED: messageUzLat (Uzbek Latin) - this is the primary message
 * OPTIONAL: messageUzCyr, messageRu, messageEn - fallback to messageUzLat if not provided
 * 
 * Fallback chain: user's language -> uz-lat (always available)
 */
export class CreateBroadcastDto {
  // Primary message in Uzbek Latin (REQUIRED)
  @IsString()
  @IsNotEmpty({ message: 'Uzbek Latin message is required' })
  @MaxLength(4096)
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  messageUzLat: string;

  // Optional: Uzbek Cyrillic
  @IsOptional()
  @IsString()
  @MaxLength(4096)
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  messageUzCyr?: string;

  // Optional: Russian
  @IsOptional()
  @IsString()
  @MaxLength(4096)
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  messageRu?: string;

  // Optional: English
  @IsOptional()
  @IsString()
  @MaxLength(4096)
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  messageEn?: string;

  // Legacy field (deprecated, use messageUzLat instead)
  @IsOptional()
  @IsString()
  @MaxLength(4096)
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  message?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  mediaAssetIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaUrls?: string[];
}
