import { Controller, Get, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { BadRequestErrorDTO, UnauthorizedErrorDTO } from 'src/error.dto';
import { SuccessfulPresignedURLDTO } from './cdn.dto';
import { CDNDirectories, CdnService } from './cdn.service';
import { FolderPipe } from './folder.pipe';

@Controller('cdn')
@ApiTags('Imagens')
export class CdnController {
  constructor(private readonly cdnService: CdnService) {}

  @ApiOperation({
    summary: 'Pegar URL Assinada para fazer upload de imagens',
    description:
      'Todo upload de imagem começa por aqui. Ao fazer a requisição com todas as informações corretas, ele irá te retornar um link assinado da AWS para que a aplicação possa fazer o upload da imagem.',
  })
  @ApiQuery({
    name: 'folder',
    description:
      'Qual pasta que irá ser guardado a imagem. (Se for rota: routes, se for ponto: points, se for sugestão de pontos: pointSuggestion)',
    enum: ['routes', 'points', 'pointSuggestions'],
    type: String,
    required: true,
    example: 'points',
  })
  @ApiQuery({
    name: 'fileName',
    description:
      'O nome do arquivo que você vai fazer upload. DEVE VIR ACOMPANHADO DA EXTENSÃO (.png, .jpeg, etc.). Sugestão: Fazer todo arquivo ter o nome de um UUIDv4, para evitar conflitos.',
    type: String,
    required: true,
    example: '711539a9-62a1-4d9f-bfce-ee71b50bb7d3.png',
  })
  @ApiQuery({
    name: 'fileType',
    description: 'O tipo MIME do arquivo que você está fazendo o upload',
    type: String,
    required: true,
    example: 'image/png',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'A requisição deu certo, e você recebe a URL com uma validade de 300 segundos.',
    type: SuccessfulPresignedURLDTO,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'O tipo de "folder" é invalido, ou é uma pasta não suportada.',
    type: BadRequestErrorDTO,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description:
      'A request foi feita sem o header "authorization", ou o token utilizado expirou.',
    type: UnauthorizedErrorDTO,
  })
  @Get('presigned-url')
  @UseGuards(AuthGuard)
  async presignedUrl(
    @Query('folder', FolderPipe) folder: CDNDirectories,
    @Query('fileName') fileName: string,
    @Query('fileType') fileType: string,
  ) {
    return {
      url: await this.cdnService.getUploadPresignedURL(
        folder,
        fileName,
        fileType,
      ),
    };
  }
}
