import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationSettingsDto {
  @IsBoolean()
  @IsOptional()
  newFollower?: boolean;

  @IsBoolean()
  @IsOptional()
  newPostInGroup?: boolean;

  @IsBoolean()
  @IsOptional()
  eventReminder?: boolean;

  @IsBoolean()
  @IsOptional()
  directMessage?: boolean;
}
