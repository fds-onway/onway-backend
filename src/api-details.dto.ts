import { ApiProperty } from '@nestjs/swagger';

class MemoryDto {
  @ApiProperty({ example: 38.83, description: 'Resident Set Size (RSS) em MB' })
  rss: number;

  @ApiProperty({
    example: 7.16,
    description: 'Total de memória alocada para o heap em MB',
  })
  heapTotal: number;

  @ApiProperty({ example: 4.28, description: 'Memória do heap em uso em MB' })
  heapUsed: number;

  @ApiProperty({
    example: 3.1,
    description: 'Memória usada por objetos C++ e JS externos em MB',
  })
  external: number;

  @ApiProperty({
    example: 0.01,
    description: 'Memória alocada para ArrayBuffers em MB',
  })
  arrayBuffers: number;
}

class CpuDto {
  @ApiProperty({
    example: 87.56,
    description: 'Tempo de CPU gasto em código do usuário em milissegundos',
  })
  user: number;

  @ApiProperty({
    example: 12.34,
    description: 'Tempo de CPU gasto em código do sistema em milissegundos',
  })
  system: number;
}

class UptimeDto {
  @ApiProperty({ example: 1, description: 'Horas que a API está no ar' })
  hours: number;

  @ApiProperty({ example: 30, description: 'Minutos que a API está no ar' })
  minutes: number;

  @ApiProperty({ example: 5, description: 'Segundos que a API está no ar' })
  seconds: number;
}

export class ApiDetailsDto {
  @ApiProperty({ example: 'OK', description: 'Status da API' })
  live: string;

  @ApiProperty({ type: MemoryDto })
  memoryMB: MemoryDto;

  @ApiProperty({ type: CpuDto })
  cpuMs: CpuDto;

  @ApiProperty({
    example: 'development',
    description: 'Ambiente em que a API está rodando',
  })
  env: string;

  @ApiProperty({ type: UptimeDto })
  upTime: UptimeDto;
}
