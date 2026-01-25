import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  Post,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { VoiceService } from './voice.service';
import { VoiceDto } from './dtos/voice.dto';
import type { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Controller('voice')
export class VoiceController {
  constructor(private readonly voiceService: VoiceService) {}

  // 1. Endpoint para generar archivo de voz estático
  @Post('static')
  async speakStatic(@Body() body: VoiceDto) {
    const filename = await this.voiceService.generarStaticAudio(body.text);
    return { url: `http://localhost:3000/voice/file/${filename}` };
  }

  // 2. Endpoint para generar archivo de voz y devolver stream
  @Get('file/:filename')
  @Header('Content-Type', 'audio/mpeg')
  getAudioFile(@Param('filename') filename: string) {
    const filePath = path.join(process.cwd(), 'uploads', filename);
    const file = fs.createReadStream(filePath);
    return new StreamableFile(file);
  }

  // 3. Endpoint para generar archivo de voz y devolver stream directamente
  @Post('stream')
  @Header('Content-Type', 'audio/mpeg')
  async speakStream(@Body() body: VoiceDto, @Res() res: Response) {
    const response = await this.voiceService.generarAudioStream(body.text);
    const nodeStream = response.body;
    nodeStream.pipe(res);
  }
}
