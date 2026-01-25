import { Body, Controller, Post } from '@nestjs/common';
import { AgentService } from './agent.service';

import { AgentDto } from './dtos/agent.dto';

@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post('chat')
  async chat(@Body() body: AgentDto) {
    const response = await this.agentService.runAgent(body.question);
    return response;
  }
}
