import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsIn,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

class NewRouteRatingDTO {
  @ApiProperty({
    description: 'A rota a qual a review está sendo feita.',
    example: 1,
    required: true,
    type: 'number',
  })
  @IsNumber()
  @IsPositive()
  route: number;

  @ApiProperty({
    description: 'A nota da review em si, podendo ser entre 1 e 5.',
    example: 4.5,
    required: true,
    type: 'number',
  })
  @IsIn([1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5], {
    message: 'O valor do voto deve ser 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5 ou 5.',
  })
  @IsNumber()
  review: number;

  @ApiProperty({
    description: 'O título da review, podendo ter no máximo 128 caracteres',
    example: 'Muito boa!',
    required: true,
    type: 'string',
    maxLength: 128,
  })
  @IsString()
  @MaxLength(128)
  title: string;

  @ApiProperty({
    description:
      'A descrição da review, podendo ser opcional, e tendo um limite de 2000 caracteres',
    example: 'Gostei muito!',
    required: false,
    type: 'string',
    maxLength: 2000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description: string;
}

class RouteRatingResponseDTO {
  @ApiProperty({
    description: 'O ID único da avaliação.',
    example: 10,
    type: Number,
  })
  id: number;

  @ApiProperty({
    description: 'O ID da rota avaliada.',
    example: 15,
    type: Number,
  })
  route: number;

  @ApiProperty({
    description: 'O ID do usuário que fez a avaliação.',
    example: 1,
    type: Number,
  })
  user: number;

  @ApiProperty({
    description: 'A nota atribuída (entre 1 e 5).',
    example: 4.5,
    type: Number,
  })
  review: number;

  @ApiProperty({
    description: 'O título da avaliação.',
    example: 'Uma experiência incrível!',
    type: String,
  })
  title: string;

  @ApiProperty({
    description: 'A descrição detalhada da avaliação.',
    example: 'A trilha é muito bem sinalizada e as cachoeiras são limpas.',
    required: false,
    nullable: true,
    type: String,
  })
  description: string | null;

  @ApiProperty({
    description: 'A data em que a avaliação foi criada.',
    example: '2025-11-18T15:30:00.000Z',
    type: Date,
  })
  createdAt: Date;
}

class EditRouteRatingDTO extends PartialType(NewRouteRatingDTO) {}

export { EditRouteRatingDTO, NewRouteRatingDTO, RouteRatingResponseDTO };
