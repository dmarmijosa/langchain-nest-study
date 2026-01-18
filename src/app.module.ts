import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './chat/chat.module';
import { RagModule } from './rag/rag.module';
import { RagDinamicModule } from './rag-dinamic/rag-dinamic.module';

@Module({
  imports: [ChatModule, RagModule, RagDinamicModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
