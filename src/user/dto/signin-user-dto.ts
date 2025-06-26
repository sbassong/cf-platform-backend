import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  Matches,
} from 'class-validator';

export class SigninUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3)
  displayName: string;

  @IsString()
  @MinLength(3)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores.',
  })
  username: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  // @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/, {
  //   message:
  //     'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
  // })
  password: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsString()
  providerId?: string;
}
