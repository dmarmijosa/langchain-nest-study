import { HumanMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { Injectable } from '@nestjs/common';
import { envs } from 'src/config/envs';

@Injectable()
export class MultimodalService {
  private model: ChatOpenAI;
  constructor() {
    this.model = new ChatOpenAI({
      apiKey: envs.OPENAI_API_KEY,
      model: envs.OPENAI_MODEL_NAME,
    });
  }

  async analyzeImage(
    imageBuffer: Buffer,
    question: string = 'Describe esta imagen',
  ) {
    const base64Image = imageBuffer.toString('base64');
    const message = new HumanMessage({
      content: [
        {
          type: 'text',
          text: question,
        },
        {
          type: 'image_url',
          image_url: {
            url: `data:image/jpeg;base64,${base64Image}`,
          },
        },
      ],
    });
    return await this.model.invoke([message]);
  }
}
