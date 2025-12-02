import { ApiProperty } from '@nestjs/swagger';

export class UserCountResponseDTO {
  @ApiProperty({
    description: 'Total de usuários registrados na plataforma.',
    example: 150,
  })
  quantity: number;
}

export class RouteCountResponseDTO {
  @ApiProperty({
    description: 'Total de rotas disponíveis/cadastradas no sistema.',
    example: 12,
  })
  quantity: number;
}

export class ActiveProgressCountResponseDTO {
  @ApiProperty({
    description:
      'Quantidade de usuários que estão percorrendo uma rota neste momento (não finalizadas).',
    example: 5,
  })
  quantity: number;
}

export class CompletedRoutesCountResponseDTO {
  @ApiProperty({
    description:
      'Quantidade total de vezes que rotas foram concluídas com sucesso.',
    example: 1024,
  })
  quantity: number;
}
