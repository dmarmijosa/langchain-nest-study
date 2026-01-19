/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { InMemoryChatMessageHistory } from '@langchain/core/chat_history';
import { StringOutputParser } from '@langchain/core/output_parsers';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import { RunnableWithMessageHistory } from '@langchain/core/runnables';
import { ChatOpenAI } from '@langchain/openai';
import { Injectable } from '@nestjs/common';
import { envs } from 'src/config/envs';

@Injectable()
export class ChatMemoryService {
  private model: ChatOpenAI;

  // Store message histories for different sessions
  private messageHistories: Record<string, InMemoryChatMessageHistory> = {};
  constructor() {
    this.model = new ChatOpenAI({
      apiKey: envs.OPENAI_API_KEY,
      model: envs.OPENAI_MODEL_NAME,
    });
  }

  // Get or create message history for a session
  private getMessageHistoryForSession(sessionId: string) {
    if (this.messageHistories[sessionId] === undefined) {
      this.messageHistories[sessionId] = new InMemoryChatMessageHistory();
    }
    return this.messageHistories[sessionId];
  }

  // Chat with memory for a specific session
  async chatWithMemory(question: string, sessionId: string) {
    // 1. Prompt con placeholder para el historial de mensajes
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', 'Eres un asistente con buena memoria.'],
      new MessagesPlaceholder('chat_history'), // AQUÍ se inyectan los mensajes viejos
      ['human', '{input}'],
    ]);

    // 2. crear la cadena de mensajes con el historial
    const chain = prompt.pipe(this.model).pipe(new StringOutputParser());

    // 3. Obtener el historial de mensajes para la sesión actual
    const withHistory = new RunnableWithMessageHistory({
      runnable: chain,
      getMessageHistory: (sessionId) =>
        this.getMessageHistoryForSession(sessionId),
      inputMessagesKey: 'input',
      historyMessagesKey: 'chat_history',
    });

    // 4. Ejecutar la cadena con el historial de mensajes
    // return await withHistory.invoke(
    //   { input: question },
    //   { configurable: { sessionId } },
    // );

    // 4.  Ejecutar la cadena con el historial de mensajes streaming
    return await withHistory.stream(
      { input: question },
      { configurable: { sessionId } },
    );
  }
}
