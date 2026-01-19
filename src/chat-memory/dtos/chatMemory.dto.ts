import { IsNotEmpty, IsString } from 'class-validator';

export class ChatMemoryDto {
  @IsNotEmpty()
  @IsString()
  question: string;

  @IsNotEmpty()
  @IsString()
  sessionId: string;
}
