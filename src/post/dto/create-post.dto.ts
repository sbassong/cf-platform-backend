import { IsNotEmpty, IsString, IsOptional, IsUrl } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}
