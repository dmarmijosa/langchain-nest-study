import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RagDinamicService } from './rag-dinamic.service';
import { SseService } from 'src/common/sse/sse.service';
import { diskStorage } from 'multer';
import { QuestionDto } from './dtos/questions.dto';
import type { Response } from 'express';
@Controller('rag-dinamic')
export class RagDinamicController {
  constructor(
    private readonly ragDinamicService: RagDinamicService,
    private readonly sseService: SseService,
  ) {}

  @Post('upload')
  // Interceptor para manejar la subida de archivos
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        // Configurar el nombre del archivo
        filename: (req, file, cb) => {
          // Generar un nombre único para el archivo
          cb(null, `${Date.now()}-${file.originalname}`);
        },
      }),
    }),
  )
  async uploadPdf(@UploadedFile() file: Express.Multer.File) {
    if (!file)
      throw new BadRequestException('File is required has to be a PDF');

    return await this.ragDinamicService.ingestPdf(file.path);
  }

  @Post('chat')
  async chatWithPdfKnowledge(
    @Body() body: QuestionDto,
    // res: Response, para sse
    //@Res() res: Response
  ) {
    const stream = await this.ragDinamicService.chatStream(body.question);

    // Enviar la respuesta como SSE
    // this.sseService.pipe(res, stream, (chunks: any) => {
    //   return chunks.answer ? chunks.answer : 'No answer found';
    // });

    // Enviar la respuesta como texto plano

    return stream.answer;
  }
}
