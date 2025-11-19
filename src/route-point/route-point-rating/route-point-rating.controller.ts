import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  BadRequestErrorDTO,
  ConflictErrorDTO,
  ForbiddenErrorDTO,
  NotFoundErrorDTO,
} from 'src/error.dto';
import { SelfUserGuard } from 'src/user/self-user.guard';
import { RoutePointRatingExistsPipe } from './route-point-rating-exists.pipe';
import {
  EditRoutePointRatingDTO,
  NewRoutePointRatingDTO,
  RoutePointRatingResponseDTO,
} from './route-point-rating.dto';
import {
  RatingNotFoundError,
  UserAlreadyRatedError,
} from './route-point-rating.exceptions';
import { RoutePointRatingService } from './route-point-rating.service';

@ApiTags('Reviews')
@ApiBearerAuth()
@Controller('route/:routeId/points/:routePointId/rating/:userId')
@UseGuards(AuthGuard, SelfUserGuard)
export class RoutePointRatingController {
  constructor(
    private readonly routePointRatingService: RoutePointRatingService,
  ) {}

  @ApiOperation({
    summary: 'Buscar detalhes de uma avaliação de PONTO',
    description:
      'Retorna os detalhes de uma avaliação específica feita por um usuário em um PONTO de rota.',
  })
  @ApiParam({
    name: 'routeId',
    description: 'O ID da rota pai (contexto).',
    example: 15,
    type: Number,
  })
  @ApiParam({
    name: 'routePointId',
    description: 'O ID do ponto da rota avaliado.',
    example: 42,
    type: Number,
  })
  @ApiParam({
    name: 'userId',
    description: 'O ID do usuário que fez a avaliação (deve ser você mesmo).',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Os detalhes da avaliação foram retornados com sucesso.',
    type: RoutePointRatingResponseDTO,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Os IDs fornecidos na URI não são válidos.',
    type: BadRequestErrorDTO,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Você está tentando visualizar uma review de outro usuário.',
    type: ForbiddenErrorDTO,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description:
      'O ponto não existe OU a avaliação não foi encontrada para este usuário neste ponto.',
    type: NotFoundErrorDTO,
  })
  @Get()
  async describe(
    @Param('routePointId', ParseIntPipe, RoutePointRatingExistsPipe)
    routePointId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    try {
      return await this.routePointRatingService.describe(routePointId, userId);
    } catch (error) {
      if (error instanceof RatingNotFoundError)
        throw new NotFoundException(error.message);
      throw error;
    }
  }

  @ApiOperation({
    summary: 'Criar uma review em um PONTO',
    description:
      'Permite que o usuário avalie um ponto específico de uma rota (ex: avaliar apenas a Cachoeira X dentro da Trilha Y).',
  })
  @ApiParam({
    name: 'routeId',
    description: 'O ID da rota pai.',
    example: 15,
    type: Number,
  })
  @ApiParam({
    name: 'routePointId',
    description: 'O ID do ponto que receberá a review.',
    example: 42,
    type: Number,
  })
  @ApiParam({
    name: 'userId',
    description: 'O ID do usuário que está avaliando.',
    example: 1,
    type: Number,
  })
  @ApiBody({
    type: NewRoutePointRatingDTO,
    description: 'As informações da avaliação (nota e texto).',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'A review do ponto foi cadastrada com sucesso.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'IDs inválidos ou corpo da requisição incorreto.',
    type: BadRequestErrorDTO,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Tentativa de avaliar em nome de outro usuário.',
    type: ForbiddenErrorDTO,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'O ponto da rota não foi encontrado.',
    type: NotFoundErrorDTO,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Você já avaliou este ponto anteriormente.',
    type: ConflictErrorDTO,
  })
  @Post()
  async create(
    @Param('routePointId', ParseIntPipe, RoutePointRatingExistsPipe)
    routePointId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: NewRoutePointRatingDTO,
  ) {
    try {
      return await this.routePointRatingService.create(
        routePointId,
        userId,
        dto,
      );
    } catch (error) {
      if (error instanceof UserAlreadyRatedError) {
        throw new ConflictException(
          'Este usuário já realizou uma review desta rota!',
        );
      }
      throw error;
    }
  }

  @ApiOperation({
    summary: 'Editar avaliação de um PONTO',
    description:
      'Atualiza a nota ou comentário de uma avaliação de ponto existente.',
  })
  @ApiParam({
    name: 'routeId',
    description: 'O ID da rota pai.',
    example: 15,
    type: Number,
  })
  @ApiParam({
    name: 'routePointId',
    description: 'O ID do ponto avaliado.',
    example: 42,
    type: Number,
  })
  @ApiParam({
    name: 'userId',
    description: 'O ID do usuário dono da avaliação.',
    example: 1,
    type: Number,
  })
  @ApiBody({
    type: EditRoutePointRatingDTO,
    description: 'Os dados a serem atualizados.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'A avaliação do ponto foi atualizada com sucesso.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos.',
    type: BadRequestErrorDTO,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Tentativa de editar avaliação de outro usuário.',
    type: ForbiddenErrorDTO,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Avaliação ou ponto não encontrado.',
    type: NotFoundErrorDTO,
  })
  @Patch()
  async edit(
    @Param('routePointId', ParseIntPipe, RoutePointRatingExistsPipe)
    routePointId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: EditRoutePointRatingDTO,
  ) {
    try {
      return await this.routePointRatingService.edit(routePointId, userId, dto);
    } catch (error) {
      if (error instanceof RatingNotFoundError)
        throw new NotFoundException(error.message);
      throw error;
    }
  }

  @ApiOperation({
    summary: 'Excluir avaliação de um PONTO',
    description: 'Remove a avaliação feita pelo usuário neste ponto.',
  })
  @ApiParam({
    name: 'routeId',
    description: 'O ID da rota pai.',
    example: 15,
    type: Number,
  })
  @ApiParam({
    name: 'routePointId',
    description: 'O ID do ponto avaliado.',
    example: 42,
    type: Number,
  })
  @ApiParam({
    name: 'userId',
    description: 'O ID do usuário.',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Avaliação removida com sucesso.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'IDs inválidos.',
    type: BadRequestErrorDTO,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Tentativa de excluir avaliação de outro usuário.',
    type: ForbiddenErrorDTO,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Avaliação não encontrada.',
    type: NotFoundErrorDTO,
  })
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('routePointId', ParseIntPipe, RoutePointRatingExistsPipe)
    routePointId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    try {
      return await this.routePointRatingService.delete(routePointId, userId);
    } catch (error) {
      if (error instanceof RatingNotFoundError)
        throw new NotFoundException(error.message);
      throw error;
    }
  }
}
