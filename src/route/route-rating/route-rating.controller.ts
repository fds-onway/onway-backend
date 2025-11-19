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
import { RouteExistsPipe } from '../route-exists.pipe';
import {
  EditRouteRatingDTO,
  NewRouteRatingDTO,
  RouteRatingResponseDTO,
} from './route-rating.dto';
import {
  RatingNotFoundError,
  UserAlreadyRatedError,
} from './route-rating.exceptions';
import { RouteRatingService } from './route-rating.service';

@ApiTags('Reviews')
@ApiBearerAuth()
@Controller('route/:routeId/rating/:userId')
@UseGuards(AuthGuard, SelfUserGuard)
export class RouteRatingController {
  constructor(private readonly routeRatingService: RouteRatingService) {}

  @ApiOperation({
    summary: 'Buscar detalhes de uma avaliação',
    description:
      'Retorna os detalhes de uma avaliação específica feita por um usuário em uma rota.',
  })
  @ApiParam({
    name: 'routeId',
    description: 'O ID da rota avaliada.',
    example: 15,
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
    type: RouteRatingResponseDTO,
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
      'A rota não existe OU a avaliação não foi encontrada para este usuário nesta rota.',
    type: NotFoundErrorDTO,
  })
  @Get()
  async describe(
    @Param('routeId', ParseIntPipe, RouteExistsPipe) routeId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    try {
      return await this.routeRatingService.describe(routeId, userId);
    } catch (error) {
      if (error instanceof RatingNotFoundError)
        throw new NotFoundException(error.message);
      throw error;
    }
  }

  @ApiOperation({
    summary: 'Registrar uma review em uma rota',
    description:
      'Permite que o usuário faça uma review de uma rota específica, dando notas de 1 a 5 e uma breve descrição. A nota influencia na visibilidade da rota em pesquisas.',
  })
  @ApiParam({
    name: 'routeId',
    description: 'O ID da rota que receberá a review.',
    example: 15,
    type: Number,
  })
  @ApiParam({
    name: 'userId',
    description: 'O ID do usuário que está avaliando.',
    example: 1,
    type: Number,
  })
  @ApiBody({
    type: NewRouteRatingDTO,
    description:
      'As informações necessárias para criar a review (nota e texto).',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'A review foi cadastrada com sucesso.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'IDs inválidos ou corpo da requisição (DTO) incorreto (ex: nota fora de 1-5).',
    type: BadRequestErrorDTO,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'A rota fornecida na URI não foi encontrada.',
    type: NotFoundErrorDTO,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description:
      'Você está tentando fazer review em nome de outro usuário (SelfUserGuard).',
    type: ForbiddenErrorDTO,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description:
      'Você está tentando fazer uma review em uma rota que você JÁ avaliou antes.',
    type: ConflictErrorDTO,
  })
  @Post()
  async create(
    @Param('routeId', ParseIntPipe, RouteExistsPipe) routeId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: NewRouteRatingDTO,
  ) {
    try {
      return await this.routeRatingService.create(routeId, userId, dto);
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
    summary: 'Editar uma avaliação existente',
    description:
      'Atualiza a nota ou o comentário de uma avaliação já existente.',
  })
  @ApiParam({
    name: 'routeId',
    description: 'O ID da rota avaliada.',
    example: 15,
    type: Number,
  })
  @ApiParam({
    name: 'userId',
    description: 'O ID do usuário dono da avaliação.',
    example: 1,
    type: Number,
  })
  @ApiBody({
    type: EditRouteRatingDTO,
    description: 'Os dados a serem atualizados (nota e/ou descrição).',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'A avaliação foi atualizada com sucesso.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados de entrada inválidos.',
    type: BadRequestErrorDTO,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Tentativa de editar a avaliação de outro usuário.',
    type: ForbiddenErrorDTO,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description:
      'A avaliação que você tentou editar não existe (ou a rota não existe).',
    type: NotFoundErrorDTO,
  })
  @Patch()
  async edit(
    @Param('routeId', ParseIntPipe, RouteExistsPipe) routeId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: EditRouteRatingDTO,
  ) {
    try {
      return await this.routeRatingService.edit(routeId, userId, dto);
    } catch (error) {
      if (error instanceof RatingNotFoundError)
        throw new NotFoundException(error.message);
      throw error;
    }
  }

  @ApiOperation({
    summary: 'Excluir uma avaliação',
    description:
      'Remove completamente a avaliação e o comentário do usuário sobre a rota.',
  })
  @ApiParam({
    name: 'routeId',
    description: 'O ID da rota.',
    example: 15,
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
    description: 'A avaliação a ser excluída não foi encontrada.',
    type: NotFoundErrorDTO,
  })
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('routeId', ParseIntPipe, RouteExistsPipe) routeId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    try {
      return await this.routeRatingService.delete(routeId, userId);
    } catch (error) {
      if (error instanceof RatingNotFoundError)
        throw new NotFoundException(error.message);
      throw error;
    }
  }
}
