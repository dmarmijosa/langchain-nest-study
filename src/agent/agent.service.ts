import { ChatOpenAI } from '@langchain/openai';
import { Injectable } from '@nestjs/common';
import { envs } from 'src/config/envs';
import { calculatorTool } from './tools/calculator.tools';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import {
  AgentExecutor,
  createToolCallingAgent,
} from '@langchain/classic/agents';
import { pokemonTool } from './tools/pokemon.tool';

@Injectable()
export class AgentService {
  private model: ChatOpenAI;

  constructor() {
    this.model = new ChatOpenAI({
      apiKey: envs.OPENAI_API_KEY,
      model: envs.OPENAI_MODEL_NAME,
    });
  }

  async runAgent(question: string) {
    // Herramientas que el agente puede usar
    const tools = [calculatorTool, pokemonTool];

    // prompt del agente
    const prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        'Eres un asistente útil. Tienes acceso a una calculadora y a una base de datos de Pokémon.',
      ],
      ['human', '{input}'],
      ['placeholder', '{agent_scratchpad}'],
    ]);

    // Crear el agente
    const agent = createToolCallingAgent({
      llm: this.model,
      tools,
      prompt,
    });

    // Ejecutar el agente con la pregunta del usuario
    const agenteExtuctor = new AgentExecutor({
      agent,
      tools,
    });

    // Ejecutar el agente con la pregunta del usuario
    const response = await agenteExtuctor.invoke({
      input: question,
    });
    return response;
  }
}
