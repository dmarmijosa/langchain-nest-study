import { IsNotEmpty, IsString } from 'class-validator';

export class RagDto {
  @IsNotEmpty({
    message: 'La pregunta no puede estar vacía',
  })
  @IsString({
    message: 'La pregunta debe ser una cadena de texto de tipo question',
  })
  question: string;
}
