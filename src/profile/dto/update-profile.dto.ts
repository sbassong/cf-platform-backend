import {
  IsString,
  IsOptional,
  IsArray,
  IsUrl,
  ArrayMinSize,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  interests?: string[];

  @IsOptional()
  @IsString()
  @IsUrl()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  bannerUrl?: string;
}
