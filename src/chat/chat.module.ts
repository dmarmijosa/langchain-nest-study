import { Logger, Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { SseService } from '../common/sse/sse.service';

@Module({
  controllers: [ChatController],
  providers: [ChatService, SseService],
})
export class ChatModule {
  logger = new Logger('ChatModule');

  constructor() {
    this.logger.log('ChatModule initialized');
  }
}
