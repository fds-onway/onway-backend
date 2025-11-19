import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Put,
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
  ForbiddenErrorDTO,
  NotFoundErrorDTO,
} from 'src/error.dto';
import { SelfUserGuard } from 'src/user/self-user.guard';
import { RoutePointRatingExistsPipe } from '../route-point-rating-exists.pipe';
import { RoutePointRatingUpvoteDTO } from './route-point-rating-upvote.dto';
import { VoteNotFoundError } from './route-point-rating-upvote.exceptions';
import { RoutePointRatingUpvoteService } from './route-point-rating-upvote.service';

@ApiTags('Upvotes')
@Controller(
  'route/:routeId/points/:routePointId/rating/:routePointRatingId/vote',
)
@UseGuards(AuthGuard, SelfUserGuard)
@ApiBearerAuth()
export class RoutePointRatingUpvoteController {
  constructor(
    private readonly routePointRatingUpvoteService: RoutePointRatingUpvoteService,
  ) {}

  @ApiOperation({
    summary: 'Votar na avaliação de um PONTO',
    description:
      'Permite que um usuário dê Upvote (Útil) ou Downvote (Não útil) em uma avaliação feita por outro usuário em um ponto específico. Se o voto já existir, ele será atualizado.',
  })
  @ApiParam({
    name: 'routePointRatingId',
    description: 'O ID da avaliação (review) do ponto que receberá o voto.',
    example: 99,
    type: Number,
  })
  @ApiParam({
    name: 'userId',
    description: 'O ID do usuário que está votando (deve ser você mesmo).',
    example: 1,
    type: Number,
  })
  @ApiBody({
    type: RoutePointRatingUpvoteDTO,
    description:
      'O valor do voto (1 para positivo/útil, -1 para negativo/inútil).',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'O voto na avaliação do ponto foi registrado ou atualizado.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'IDs inválidos ou corpo da requisição incorreto.',
    type: BadRequestErrorDTO,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Você está tentando votar em nome de outro usuário.',
    type: ForbiddenErrorDTO,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'A avaliação do ponto não foi encontrada.',
    type: NotFoundErrorDTO,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Algo deu errado ao registrar o voto.',
  })
  @Put(':userId')
  async registerVote(
    @Param('routeRatingId', ParseIntPipe, RoutePointRatingExistsPipe)
    routeRatingId: number,
    @Param('userId') userId: number,
    @Body() RouteRatingUpvoteDTO: RoutePointRatingUpvoteDTO,
  ) {
    return await this.routePointRatingUpvoteService.register(
      userId,
      routeRatingId,
      RouteRatingUpvoteDTO.value as 1 | -1,
    );
  }

  @ApiOperation({
    summary: 'Remover voto de uma avaliação de PONTO',
    description:
      'Remove o voto (seja positivo ou negativo) que um usuário deu em uma avaliação de ponto.',
  })
  @ApiParam({
    name: 'routePointRatingId',
    description: 'O ID da avaliação de onde o voto será removido.',
    example: 99,
    type: Number,
  })
  @ApiParam({
    name: 'userId',
    description: 'O ID do usuário dono do voto (deve ser você mesmo).',
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'O voto foi removido com sucesso.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'IDs inválidos.',
    type: BadRequestErrorDTO,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Você está tentando remover o voto de outro usuário.',
    type: ForbiddenErrorDTO,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'A avaliação não existe ou o voto não foi encontrado.',
    type: NotFoundErrorDTO,
  })
  @Delete(':userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteVote(
    @Param('routeRatingId', ParseIntPipe, RoutePointRatingExistsPipe)
    routeRatingId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    try {
      return await this.routePointRatingUpvoteService.delete(
        userId,
        routeRatingId,
      );
    } catch (error) {
      if (error instanceof VoteNotFoundError) {
        throw new NotFoundException(
          `Voto não encontrado com estes parâmetros.`,
        );
      }
    }
  }
}
