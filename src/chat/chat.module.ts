import { Logger, Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';

@Module({
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {
  logger = new Logger('ChatModule');

  constructor() {
    this.logger.log('ChatModule initialized');
  }
}
