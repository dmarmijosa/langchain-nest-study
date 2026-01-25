import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { RagDbService } from './rag-db.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { RagDbDto } from './dtos/rag-db.dto';

@Controller('rag-db')
export class RagDbController {
  constructor(private readonly ragDbService: RagDbService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) =>
          cb(null, `${Date.now()}-${file.originalname}`),
      }),
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File is required');
    return await this.ragDbService.ingestPDF(file.path);
  }

  @Post('chat')
  async chat(@Body() body: RagDbDto) {
    const response = await this.ragDbService.chatStream(body.question);
    return response;
  }
}
