/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import type { Response } from 'express';
import { from, map } from 'rxjs';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // simple respuesta
  @Post()
  async chat(@Body() createChatDto: CreateChatDto) {
    return await this.chatService.getBasicResponse(createChatDto);
  }

  // CAMBIO 1: Usamos @Post en lugar de @Sse para poder recibir Body
  // CAMBIO 2: Agregamos el Header text/event-stream manualmente
  @Post('stream')
  async streamChat(@Body() createChatDto: CreateChatDto, @Res() res: Response) {
    // 1. Configuración de Headers (Igual que antes)
    res.status(HttpStatus.OK);
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // 2. Obtenemos el generador
    const stream = await this.chatService.streamResponse(createChatDto);

    // 3. MAGIA RXJS ✨
    // 'from' convierte el AsyncGenerator de LangChain en un flujo RxJS
    from(stream)
      .pipe(
        // Transformamos el texto crudo a formato SSE
        map((chunk) => {
          if (!chunk) return null;
          return `data: ${JSON.stringify({ text: chunk })}\n\n`;
        }),
      )
      .subscribe({
        // 'next': Se ejecuta cada vez que llega un pedacito de texto
        next: (message) => {
          if (message) res.write(message);
        },
        // 'error': Manejo de errores automático
        error: (err) => {
          console.error('Error en stream:', err);
          res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
          res.end();
        },
        // 'complete': Se ejecuta cuando la IA termina de hablar
        complete: () => {
          res.end();
        },
      });
  }
}
