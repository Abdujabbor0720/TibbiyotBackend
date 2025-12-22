import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsArray,
  IsUUID,
} from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO for creating a broadcast message.
 */
export class CreateBroadcastDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(4096)
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  message: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  mediaAssetIds?: string[];
}
