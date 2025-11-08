import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

class ImageRouteDTO {
  @ApiProperty({
    example: '711539a9-62a1-4d9f-bfce-ee71b50bb7d3.png',
    description:
      'O nome do arquivo gerado antes de fazer o upload. Deve ser sempre um UUID junto de sua extensão (ex: .png, .jpeg, etc)',
    required: true,
  })
  @IsString()
  fileName: string;

  @ApiProperty({
    example: `https://${process.env.CDN_BUCKET_NAME!}.s3.${process.env.AWS_REGION!}.amazonaws.com/711539a9-62a1-4d9f-bfce-ee71b50bb7d3.png`,
    description: `A URL da imagem gerada APÓS o upload da imagem. Ela terá o formato de: "https://${process.env.CDN_BUCKET_NAME!}.s3.${process.env.AWS_REGION!}.amazonaws.com/<(nome_arquivo)>. Para fazer o upload da imagem, primeiro pegue a URL temporária na rota "/cdn/presignedUrl?folder=<pasta(neste caso é 'routes')>&fileName=<(nome_arquivo)>&fileType=<(tipo_arquivo)>`,
    required: true,
  })
  @IsString()
  @IsUrl()
  imageUrl: string;
}

class ImagePointDTO {
  @ApiProperty({
    example: '711539a9-62a1-4d9f-bfce-ee71b50bb7d3.png',
    description:
      'O nome do arquivo gerado antes de fazer o upload. Deve ser sempre um UUID junto de sua extensão (ex: .png, .jpeg, etc)',
    required: true,
  })
  @IsString()
  fileName: string;

  @ApiProperty({
    example: `https://${process.env.CDN_BUCKET_NAME!}.s3.${process.env.AWS_REGION!}.amazonaws.com/711539a9-62a1-4d9f-bfce-ee71b50bb7d3.png`,
    description: `A URL da imagem gerada APÓS o upload da imagem. Ela terá o formato de: "https://${process.env.CDN_BUCKET_NAME!}.s3.${process.env.AWS_REGION!}.amazonaws.com/<nome_arquivo>. Para fazer o upload da imagem, primeiro pegue a URL temporária na rota "/cdn/presignedUrl?folder=<pasta(neste caso é 'points')>&fileName=<(nome_arquivo)>&fileType=<(tipo_arquivo)>`,
    required: true,
  })
  @IsString()
  @IsUrl()
  imageUrl: string;
}

class PointDTO {
  @ApiProperty({
    example: 'Rio São João',
    description: 'O nome que o ponto terá',
    required: true,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(256)
  name: string;

  @ApiProperty({
    description: 'O que o ponto é?',
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
    example:
      'Local encantador com cachoeiras e paisagens naturais ao longo do rio, ideal para caminhada e contemplação da natureza.',
    description: 'A Descrição do ponto',
    required: true,
  })
  @IsString()
  description: string;

  @ApiProperty({
    example: '-20.912323',
    description: 'Latitude do ponto. Formato: xx.xxxxxx',
    required: true,
  })
  @IsString()
  @IsLatitude()
  latitude: string;

  @ApiProperty({
    example: '-44.502341',
    description: 'Longitude do ponto. Formato: xx.xxxxxx',
    required: true,
  })
  @IsString()
  @IsLongitude()
  longitude: string;

  @ApiProperty({
    type: () => ImagePointDTO,
    isArray: true,
    description: 'Lista de todas as imagens que compõem o ponto.',
  })
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => ImagePointDTO)
  @ArrayNotEmpty()
  images: Array<ImagePointDTO>;
}

class CreateRouteDTO {
  @ApiProperty({
    example: 'Caminhos de São João',
    description: 'O nome que a rota terá',
    required: true,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(256)
  name: string;

  @ApiProperty({
    example:
      'Os Caminhos de São João são rotas turísticas e de peregrinação que ligam cidades históricas do interior de Minas Gerais, celebrando a fé, a cultura e as tradições locais.',
    description: 'A Descrição principal da rota',
    required: true,
  })
  @IsString()
  description: string;

  @ApiProperty({
    example: ['Fé', 'Tradição', 'Cultura', 'Natureza', 'Comunidade'],
    description: 'Tags que irão ajustar no SEO da rota',
    required: true,
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayNotEmpty()
  @ArrayUnique()
  tags: Array<string>;

  @ApiProperty({
    type: () => ImageRouteDTO,
    isArray: true,
    description: 'Lista de todas as imagens que compõem a rota.',
  })
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => ImageRouteDTO)
  @ArrayNotEmpty()
  images: Array<ImageRouteDTO>;

  @ApiProperty({
    type: () => PointDTO,
    isArray: true,
    description: 'Lista de todos os pontos que compõem a rota.',
  })
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => PointDTO)
  @ArrayNotEmpty()
  points: Array<PointDTO>;
}

class SucessfulCreatedRouteDTO {
  @ApiProperty({
    example: '1',
    description: 'O ID Atribuído à rota.',
  })
  id: number;

  @ApiProperty({
    example: 'Caminhos de São João',
    description: 'O nome dado a rota',
  })
  name: string;

  @ApiProperty({
    example:
      'Os Caminhos de São João são rotas turísticas e de peregrinação que ligam cidades históricas do interior de Minas Gerais, celebrando a fé, a cultura e as tradições locais.',
    description: 'A descrição dada a rota',
  })
  description: string;

  @ApiProperty({
    example: '2023-10-27T10:00:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    example: '1',
    description: 'ID do usuário que criou a rota.',
  })
  owner: number;

  @ApiProperty({
    example: '0',
    description: 'Número de upvotes da rota (como acabou de ser criado, é 0)',
  })
  upvotes: number;
}

class ResumedRouteDTO {
  @ApiProperty({
    example: 1,
    description: 'O ID da rota.',
    type: 'integer',
  })
  id: number;

  @ApiProperty({
    example: 'Caminhos de São João',
    description: 'O nome da rota',
    type: 'string',
  })
  name: string;

  @ApiProperty({
    example:
      'Os Caminhos de São João são rotas turísticas e de peregrinação que ligam cidades históricas do interior de Minas Gerais, celebrando a fé, a cultura e as tradições locais.',
    description: 'A descrição da rota',
    type: 'string',
  })
  description: string;

  @ApiProperty({
    example: ['Fé', 'Tradição', 'Cultura', 'Natureza', 'Comunidade'],
    description: '',
    type: 'array',
  })
  tags: Array<string>;

  @ApiProperty({
    example:
      'https://onway-cdn-bucket.s3.us-east-1.amazonaws.com/b2c3d4e5-2222-3333-4444-b00000000001.jpg',
    description:
      'A URL da imagem principal da rota (ela tem outras, mas trás a "principal"',
    type: 'string',
  })
  image: string;
}

export { CreateRouteDTO, ResumedRouteDTO, SucessfulCreatedRouteDTO };
