import {
  BadRequestException,
  Body,
  Controller,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { MultimodalService } from './multimodal.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { MultimodalDto } from './dtos/multimodal.dto';

@Controller('multimodal')
export class MultimodalController {
  constructor(private readonly multimodalService: MultimodalService) {}

  @Post('analyze')
  @UseInterceptors(FileInterceptor('file')) // Sin opciones = guarda en memoria RAM (file.buffer)
  async analyzeImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() questionDto: MultimodalDto,
    //@Res() res: Response,
  ) {
    // Validar que se ha subido un archivo
    if (!file) throw new BadRequestException('Sube una imagen (jpg/png');

    const response = await this.multimodalService.analyzeImage(
      file.buffer,
      questionDto.question,
    );

    return {
      answer: response.text,
      status: HttpStatus.OK,
    };
  }
}
