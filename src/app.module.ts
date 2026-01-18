import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './chat/chat.module';
import { RagModule } from './rag/rag.module';
import { RagDinamicModule } from './rag-dinamic/rag-dinamic.module';
import { MultimodalModule } from './multimodal/multimodal.module';

@Module({
  imports: [ChatModule, RagModule, RagDinamicModule, MultimodalModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
