import { IsNotEmpty, IsString } from 'class-validator';

export class RagDbDto {
  @IsNotEmpty()
  @IsString()
  question: string;
}
