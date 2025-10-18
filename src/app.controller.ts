import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiDetailsDto } from './api-details.dto';

@Controller()
@ApiTags('Miscelânia')
export class AppController {
  constructor() {}

  @Get()
  @ApiOperation({ summary: 'Pegar dados de uso da API' })
  @ApiResponse({
    status: 200,
    description:
      'Informações gerais da API, como: Se está de pé, quanto tempo está de pé, consumo de memória e CPU, etc.',
    type: ApiDetailsDto,
  })
  getApiDetails() {
    const uptime = process.uptime();
    const mem = process.memoryUsage();
    const cpu = process.cpuUsage();

    const memoryMB = Object.fromEntries(
      Object.entries(mem).map(([key, value]) => [
        key,
        +(value / 1024 / 1024).toFixed(2),
      ]),
    );

    const cpuMs = {
      user: +(cpu.user / 1000).toFixed(2),
      system: +(cpu.system / 1000).toFixed(2),
    };

    return {
      live: 'OK',
      memoryMB,
      cpuMs,
      env: process.env.ENV || 'development',
      upTime: {
        hours: Math.floor(uptime / 3600),
        minutes: Math.floor((uptime % 3600) / 60),
        seconds: Math.floor(uptime % 60),
      },
    };
  }
}
