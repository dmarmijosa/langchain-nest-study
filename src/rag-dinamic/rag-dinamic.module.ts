import { Module } from '@nestjs/common';
import { RagDinamicService } from './rag-dinamic.service';
import { RagDinamicController } from './rag-dinamic.controller';
import { SseService } from 'src/common/sse/sse.service';

@Module({
  controllers: [RagDinamicController],
  providers: [RagDinamicService, SseService],
})
export class RagDinamicModule {}
