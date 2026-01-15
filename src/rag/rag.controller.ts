import { Body, Controller, Post } from '@nestjs/common';
import { RagService } from './rag.service';
import { RagDto } from './dto/rag.dto';

@Controller('rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}
  @Post('static')
  async askPdf(@Body() ragDto: RagDto) {
    const answer = await this.ragService.chatWithStaticPdf(ragDto.question);
    return { answer };
  }
}
