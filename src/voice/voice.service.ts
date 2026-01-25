import { OpenAI } from 'openai';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class VoiceService {
  private openAI: OpenAI;

  constructor() {
    this.openAI = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  // MODO1: Generar archivo de voz estatico
  async generarStaticAudio(text: string) {
    const mp3 = await this.openAI.audio.speech.create({
      model: 'tts-1',
      voice: 'alloy',
      input: text,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());

    // Guardar el archivo en el sistema de archivos
    const filename = `${Date.now()}.mp3`;
    const filePath = path.join(process.cwd(), 'uploads', filename);

    await fs.promises.writeFile(filePath, buffer);

    return filename;
  }

  // MODO2: Generar archivo de voz y devolver stream
  async generarAudioStream(text: string) {
    return await this.openAI.audio.speech.create({
      model: 'tts-1',
      voice: 'alloy',
      input: text,
      response_format: 'mp3',
    });
  }
}
