import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './chat/chat.module';
import { RagModule } from './rag/rag.module';

@Module({
  imports: [ChatModule, RagModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
