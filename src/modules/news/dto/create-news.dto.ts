import {
  IsString,
  IsNotEmpty,
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
 * DTO for creating a news post.
 * Admin only.
 */
export class CreateNewsDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(500)
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  titleUzLat: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(500)
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  titleUzCyr: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(500)
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  titleRu: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  titleEn?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(50000)
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  bodyUzLat: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(50000)
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  bodyUzCyr: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  @MaxLength(50000)
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  bodyRu: string;

  @IsOptional()
  @IsString()
  @MaxLength(50000)
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  bodyEn?: string;

  @IsOptional()
  @IsBoolean()
  isDraft?: boolean;

  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  mediaAssetIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaUrls?: string[];
}
