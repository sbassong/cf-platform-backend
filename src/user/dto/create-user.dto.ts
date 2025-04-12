export class CreateUserDto {
  email: string;
  name: string;
  avatarUrl?: string;
  provider: string;
  providerId: string;
  emailVerified?: boolean;
}
