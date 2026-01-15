import { Controller, Post, Body, Res } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import type { Response } from 'express';
import { SseService } from '../common/sse/sse.service';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly sseService: SseService,
  ) {}

  // simple respuesta
  @Post()
  async chat(@Body() createChatDto: CreateChatDto) {
    return await this.chatService.getBasicResponse(createChatDto);
  }

  // CAMBIO 1: Usamos @Post en lugar de @Sse para poder recibir Body
  // CAMBIO 2: Agregamos el Header text/event-stream manualmente
  @Post('stream')
  async streamChat(@Body() createChatDto: CreateChatDto, @Res() res: Response) {
    const stream = await this.chatService.streamResponse(createChatDto);
    this.sseService.pipe(res, stream, (chunk) =>
      chunk ? { text: chunk } : null,
    );
  }
}
