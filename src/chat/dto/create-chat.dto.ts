import { IsString, IsNotEmpty } from 'class-validator';
export class CreateChatDto {
  @IsNotEmpty()
  @IsString()
  message: string;
}
