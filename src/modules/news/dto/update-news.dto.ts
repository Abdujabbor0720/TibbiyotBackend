import {
  IsString,
  IsOptional,
  MaxLength,
  MinLength,
  IsBoolean,
  IsDateString,
  IsArray,
  IsUUID,
} from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO for updating a news post.
 * Admin only.
 */
export class UpdateNewsDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  titleUzLat?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  titleUzCyr?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  titleRu?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(50000)
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  bodyUzLat?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(50000)
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  bodyUzCyr?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(50000)
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  bodyRu?: string;

  @IsOptional()
  @IsBoolean()
  isDraft?: boolean;

  @IsOptional()
  @IsDateString()
  publishedAt?: string | null;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  mediaAssetIds?: string[];
}
