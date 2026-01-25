import { IsNotEmpty, IsString } from 'class-validator';

export class VoiceDto {
  @IsNotEmpty()
  @IsString()
  text: string;
}
