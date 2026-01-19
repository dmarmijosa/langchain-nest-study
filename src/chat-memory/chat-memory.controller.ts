import { Body, Controller, Post, Res } from '@nestjs/common';
import { ChatMemoryService } from './chat-memory.service';
import { ChatMemoryDto } from './dtos/chatMemory.dto';
import { SseService } from 'src/common/sse/sse.service';
import type { Response } from 'express';
@Controller('chat-memory')
export class ChatMemoryController {
  constructor(
    private readonly chatMemoryService: ChatMemoryService,
    private readonly sseService: SseService,
  ) {}

  @Post()
  async chat(@Body() body: ChatMemoryDto, @Res() res: Response) {
    const response = await this.chatMemoryService.chatWithMemory(
      body.question,
      body.sessionId,
    );

    this.sseService.pipe(res, response, (chunks) =>
      chunks ? { text: chunks } : null,
    );

    //return { response };
  }
}
