import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { ChatModule } from './chat/chat.module';
// import { RagModule } from './rag/rag.module';
// import { RagDinamicModule } from './rag-dinamic/rag-dinamic.module';
//import { MultimodalModule } from './multimodal/multimodal.module';
import { ChatMemoryModule } from './chat-memory/chat-memory.module';

@Module({
  imports: [
    //ChatModule,
    //RagModule,
    //RagDinamicModule,
    //MultimodalModule,
    ChatMemoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
