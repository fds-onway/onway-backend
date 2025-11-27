import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DrizzleQueryError } from 'drizzle-orm';
import { Request } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import { IsAdminGuard } from 'src/auth/is-admin.guard';
import {
  BadRequestErrorDTO,
  ConflictErrorDTO,
  NotFoundErrorDTO,
} from 'src/error.dto';
import { RouteExistsPipe } from './route-exists.pipe';
import {
  CreateRouteDTO,
  FullRouteDTO,
  ResumedRouteDTO,
  SucessfulCreatedRouteDTO,
  UpdateRouteDTO,
} from './route.dto';
import { RouteService } from './route.service';

@Controller('route')
@ApiTags('Rotas')
@UseGuards(AuthGuard)
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @ApiOperation({
    summary: 'Criar uma nova rota',
    description:
      'Rota geral de criação de rotas, criando todas as tags, pontos, imagens e imagens de pontos',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'A rota foi criada com sucesso, e você recebe o DTO contendo as informações principais dela.',
    type: SucessfulCreatedRouteDTO,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description:
      'Uma das imagens enviadas já existe no bucket, mas para outra rota/ponto de rota, e por conta disso a rota não pode ser criada.',
    type: ConflictErrorDTO,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Algo deu errado na criação da rota.',
  })
  @ApiBearerAuth()
  @Post()
  @UseGuards(IsAdminGuard)
  async create(@Body() body: CreateRouteDTO, @Req() request: Request) {
    try {
      return await this.routeService.create(body, request);
    } catch (error: unknown) {
      if (!(error instanceof Error)) {
        throw error;
      }
      if (
        error instanceof DrizzleQueryError &&
        error.cause?.message.startsWith('duplicate key')
      ) {
        throw new ConflictException(
          'Uma das imagens enviadas já existe no bucket.',
        );
      }
      throw error;
    }
  }

  @ApiOperation({
    summary: 'Pesquisar rotas existentes',
    description:
      'Rota para pesquisar rotas existentes, podendo ser com query ou sem query.',
  })
  @ApiQuery({
    name: 'q',
    description:
      'A Query de pesquisa, não é obrigatório mas DEVE ESTAR CODIFICADA para URI válida.',
    type: String,
    required: false,
    example: 'image/png',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'A pesquisa funcionou corretamente, e ela trouxe as rotas. Podendo trazer uma lista vazia "[]" se nenhuma foi encontrada.',
    type: ResumedRouteDTO,
    isArray: true,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Algo deu errado ao pesquisar as rotas.',
  })
  @ApiBearerAuth()
  @Get()
  async list(@Query('q') query: string | undefined) {
    return await this.routeService.search(query);
  }

  @ApiOperation({
    summary: 'Trazer detalhes de uma rota específica',
    description:
      'Rota para trazer detalhes a mais de uma rota como um todo, como todos os pontos, todas as imagens, etc',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'A rota foi consultada com sucesso.',
    type: FullRouteDTO,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'O valor fornecido na URI não é um valor válido',
    type: BadRequestErrorDTO,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description:
      'O id fornecido na URI não foi encontrado ou não existe mais no sistema.',
    type: NotFoundErrorDTO,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Algo deu errado ao pesquisar a rota.',
  })
  @ApiBearerAuth()
  @Get(':id')
  async describe(@Param('id', ParseIntPipe, RouteExistsPipe) routeId: number) {
    return await this.routeService.describe(routeId);
  }

  @ApiOperation({
    summary: 'Deletar uma rota',
    description:
      'Rota para deletar rotas, também fazendo todo o processo de deletar todas as imagens, pontos, pontos de imagem e tags relacionadas à rota.',
  })
  @ApiParam({
    name: 'id',
    description: 'O ID da rota que será deletada',
    example: 29,
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'A rota foi deletada com sucesso.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'O valor fornecido na URI não é um valor válido',
    type: BadRequestErrorDTO,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description:
      'O id fornecido na URI não foi encontrada ou não existe mais no sistema.',
    type: NotFoundErrorDTO,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Algo deu errado ao deletar a rota.',
  })
  @ApiBearerAuth()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseIntPipe, RouteExistsPipe) id: number) {
    await this.routeService.delete(id);
  }

  @ApiOperation({
    summary: 'Editar uma rota (Sincronização Completa)',
    description:
      'Atualiza uma rota existente. Esta rota é inteligente: ela sincroniza o estado atual com o DTO enviado. Isso significa que ela atualiza textos, remove imagens/pontos que não estão mais na lista, cria novos pontos/imagens adicionados e reordena a sequência dos pontos conforme a lista enviada.',
  })
  @ApiParam({
    name: 'id',
    description: 'O ID da rota que será editada',
    example: 29,
    type: Number,
  })
  @ApiBody({
    type: UpdateRouteDTO,
    description:
      'O objeto contendo as atualizações. Pontos sem ID serão criados, pontos com ID serão atualizados/reordenados.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'A rota foi atualizada com sucesso.',
    type: SucessfulCreatedRouteDTO,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'O valor fornecido na URI não é válido ou o corpo da requisição contém dados inválidos (ex: UUIDs malformados).',
    type: BadRequestErrorDTO,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'O id fornecido na URI não foi encontrado.',
    type: NotFoundErrorDTO,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Algo deu errado ao processar a edição da rota.',
  })
  @ApiBearerAuth()
  @Patch(':id')
  async edit(
    @Param('id', ParseIntPipe, RouteExistsPipe) id: number,
    @Body() dto: UpdateRouteDTO,
    @Req() request: Request,
  ) {
    return await this.routeService.edit(id, dto, request);
  }
}
