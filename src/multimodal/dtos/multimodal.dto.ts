import { IsNotEmpty, IsString } from 'class-validator';

export class MultimodalDto {
  @IsString()
  @IsNotEmpty()
  question: string;
}
