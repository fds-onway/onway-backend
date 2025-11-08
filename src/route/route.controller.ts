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
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
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
  ResumedRouteDTO,
  SucessfulCreatedRouteDTO,
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
    description: 'Algo deu ao pesquisar as rotas.',
  })
  @ApiBearerAuth()
  @Get()
  async list(@Query('q') query: string | undefined) {
    return await this.routeService.search(query);
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
    description: 'Algo deu ao deletar a rota.',
  })
  @ApiBearerAuth()
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseIntPipe, RouteExistsPipe) id: number) {
    await this.routeService.delete(id);
  }
}
