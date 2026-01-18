import { Module } from '@nestjs/common';
import { MultimodalService } from './multimodal.service';
import { MultimodalController } from './multimodal.controller';

@Module({
  controllers: [MultimodalController],
  providers: [MultimodalService],
})
export class MultimodalModule {}
