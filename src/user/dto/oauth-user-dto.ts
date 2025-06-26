import { IsEmail, IsOptional, IsString, IsBoolean } from 'class-validator';

export class OauthUserDto {
  @IsEmail()
  email: string;

  // This will be used as the initial displayName
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsString()
  providerId?: string;

  @IsOptional()
  @IsBoolean()
  emailVerified?: boolean;
}
