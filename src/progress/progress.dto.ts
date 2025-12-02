import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive } from 'class-validator';

class ProgressDTO {
  @ApiProperty({
    description: 'O ID do ponto da rota (PontoRota) onde o usuário chegou.',
    example: 15,
  })
  @IsNumber()
  @IsPositive()
  routePointId: number;
}

class RouteProgressResponseDTO {
  @ApiProperty({
    example: 1,
    description: 'ID único do registro de progresso.',
  })
  id: number;

  @ApiProperty({ example: 10, description: 'ID da rota.' })
  route: number;

  @ApiProperty({
    example: 5,
    description:
      'ID do último ponto visitado. Pode ser nulo se iniciou mas não visitou nenhum ponto.',
    nullable: true,
  })
  lastPoint: number | null;

  @ApiProperty({ example: 42, description: 'ID do usuário.' })
  user: number;

  @ApiProperty({ example: '2023-10-27T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2023-10-27T11:30:00.000Z', nullable: true })
  updatedAt: Date | null;

  @ApiProperty({
    example: null,
    description:
      'Data de conclusão. Se estiver preenchido, a rota foi finalizada.',
    nullable: true,
  })
  completedAt: Date | null;
}

export default ProgressDTO;
export { RouteProgressResponseDTO };
