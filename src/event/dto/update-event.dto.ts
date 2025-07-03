import { IsString, IsOptional, MaxLength, IsDateString } from 'class-validator';

export class UpdateEventDto {
  @IsString()
  @IsOptional()
  @MaxLength(150)
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  location?: string;
}
