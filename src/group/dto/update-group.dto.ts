import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateGroupDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}
