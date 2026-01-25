import { IsNotEmpty, IsString } from 'class-validator';

export class AgentDto {
  @IsNotEmpty()
  @IsString()
  question: string;
}
