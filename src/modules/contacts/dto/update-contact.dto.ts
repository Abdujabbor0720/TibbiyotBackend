import {
  IsString,
  IsOptional,
  MaxLength,
  MinLength,
  Matches,
  IsBoolean,
  IsInt,
  Min,
  IsEnum,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ContactStatus } from '../../../database/enums';

/**
 * DTO for updating a contact person.
 * Admin only.
 */
export class UpdateContactDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  fullName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d+$/, { message: 'telegramUserId must be a numeric string' })
  telegramUserId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  position?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  department?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  description?: string | null;

  @IsOptional()
  @IsEnum(ContactStatus)
  status?: ContactStatus;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
