import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description: string;
}
