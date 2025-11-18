import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

class RoutePointDTO {
  @ApiProperty({
    example: 1,
    description: 'O ID do ponto.',
    type: 'number',
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    example: 'Rio São João',
    description: 'O nome que o ponto terá',
    type: 'string',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(256)
  name: string;

  @ApiProperty({
    example:
      'Local encantador com cachoeiras e paisagens naturais ao longo do rio, ideal para caminhada e contemplação da natureza.',
    description: 'A Descrição do ponto',
    type: 'string',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'O tipo de ponto que é',
    example: 'natureza',
    enum: [
      'restaurante',
      'parque',
      'natureza',
      'servico',
      'hotel',
      'entretenimento',
      'miscelania',
    ],
  })
  @IsString()
  @IsEnum([
    'restaurante',
    'parque',
    'natureza',
    'servico',
    'hotel',
    'entretenimento',
    'miscelania',
  ])
  type:
    | 'restaurante'
    | 'parque'
    | 'natureza'
    | 'servico'
    | 'hotel'
    | 'entretenimento'
    | 'miscelania';

  @ApiProperty({
    example: 123,
    description: 'O número de upvotes do ponto',
    type: 'number',
  })
  @IsNumber()
  upvotes: number;

  @ApiProperty({
    example: '-20.912323',
    description: 'Latitude do ponto. Formato: xx.xxxxxx',
    type: 'string',
  })
  @IsString()
  @IsLatitude()
  latitude: string;

  @ApiProperty({
    example: '-44.502341',
    description: 'Longitude do ponto. Formato: xx.xxxxxx',
    type: 'string',
  })
  @IsString()
  @IsLongitude()
  longitude: string;

  @ApiProperty({
    example: 1,
    description:
      'A sequência do ponto (define a ordem de cada um). O Array inteiro já é ordenado dessa maneira, mas caso queira utilizar...',
    type: 'number',
  })
  @IsNumber()
  sequence: number;

  @ApiProperty({
    example: [
      `https://${process.env.CDN_BUCKET_NAME!}.s3.${process.env.AWS_REGION!}.amazonaws.com/points/b2c3d4e5-2222-3333-4444-b00000000001.jpg`,
      `https://${process.env.CDN_BUCKET_NAME!}.s3.${process.env.AWS_REGION!}.amazonaws.com/points/711539a9-62a1-4d9f-bfce-ee71b50bb7d3.png`,
    ],
    description: 'A lista de URLs de cada imagem deste ponto da rota',
    type: 'array',
  })
  @IsString({ each: true })
  @IsArray()
  images: Array<string>;
}

export { RoutePointDTO };
