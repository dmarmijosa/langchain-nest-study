import { Module } from '@nestjs/common';
import { ChatMemoryService } from './chat-memory.service';
import { ChatMemoryController } from './chat-memory.controller';
import { SseService } from 'src/common/sse/sse.service';

@Module({
  controllers: [ChatMemoryController],
  providers: [ChatMemoryService, SseService],
})
export class ChatMemoryModule {}
