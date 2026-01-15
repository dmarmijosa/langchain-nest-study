import { Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { ChatOpenAI } from '@langchain/openai';
import { envs } from 'src/config/envs';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';

@Injectable()
export class ChatService {
  private model: ChatOpenAI;
  constructor() {
    console.log(envs.OPENAI_API_KEY);
    this.model = new ChatOpenAI({
      openAIApiKey: envs.OPENAI_API_KEY,
      temperature: 0.7,
      modelName: 'gpt-4.1',
    });
  }

  async getBasicResponse(createChatDto: CreateChatDto) {
    // 1. Definir el Prompt Template
    // Usamos 'fromMessages' para estructurar roles (system, user)
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', 'Eres un experto en programación backend con NestJS.'],
      ['user', '{input}'],
    ]);

    // 2. Output Parser
    // Transforma la respuesta compleja del LLM en un simple string
    const outputParser = new StringOutputParser();

    // 3. Crear la cadena (Chain) usando LCEL (pipes)
    // Prompt --> Modelo --> Salida limpia
    const chain = prompt.pipe(this.model).pipe(outputParser);

    // 4. Ejecutar la cadena
    const response = await chain.invoke({
      input: createChatDto.message,
    });

    return response;
  }
}
