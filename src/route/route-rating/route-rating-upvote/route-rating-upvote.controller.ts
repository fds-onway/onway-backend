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
import { RouteRatingExistsPipe } from '../route-rating-exists.pipe';
import { RouteRatingUpvoteDTO } from './route-rating-upvote.dto';
import { VoteNotFoundError } from './route-rating-upvote.exceptions';
import { RouteRatingUpvoteService } from './route-rating-upvote.service';

@ApiTags('Upvotes')
@Controller('route/:routeId/rating/:routeRatingId/vote')
@UseGuards(AuthGuard, SelfUserGuard)
@ApiBearerAuth()
export class RouteRatingUpvoteController {
  constructor(
    private readonly routeRatingUpvoteService: RouteRatingUpvoteService,
  ) {}

  @ApiOperation({
    summary: 'Votar na avaliação (review) de uma rota',
    description:
      'Permite que um usuário dê Upvote (Útil) ou Downvote (Não útil) em uma avaliação feita por outro usuário. Se o voto já existir, ele será atualizado.',
  })
  @ApiParam({
    name: 'routeRatingId',
    description: 'O ID da avaliação (review) que receberá o voto.',
    example: 45,
    type: Number,
  })
  @ApiParam({
    name: 'userId',
    description: 'O ID do usuário que está votando (deve ser você mesmo).',
    example: 1,
    type: Number,
  })
  @ApiBody({
    type: RouteRatingUpvoteDTO,
    description:
      'O valor do voto (1 para positivo/útil, -1 para negativo/inútil).',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'O voto na avaliação foi registrado ou atualizado com sucesso.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'O ID fornecido na URI não é válido ou o corpo da requisição está incorreto.',
    type: BadRequestErrorDTO,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'A avaliação (review) fornecida na URI não foi encontrada.',
    type: NotFoundErrorDTO,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description:
      'Você está tentando votar em nome de outro usuário (SelfUserGuard).',
    type: ForbiddenErrorDTO,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Algo deu errado ao registrar o voto na avaliação.',
  })
  @Put(':userId')
  async registerVote(
    @Param('routeRatingId', ParseIntPipe, RouteRatingExistsPipe)
    routeRatingId: number,
    @Param('userId') userId: number,
    @Body() RouteRatingUpvoteDTO: RouteRatingUpvoteDTO,
  ) {
    return await this.routeRatingUpvoteService.register(
      userId,
      routeRatingId,
      RouteRatingUpvoteDTO.value as 1 | -1,
    );
  }

  @ApiOperation({
    summary: 'Remover voto de uma avaliação',
    description:
      'Remove o voto (seja positivo ou negativo) que um usuário deu em uma avaliação de rota.',
  })
  @ApiParam({
    name: 'routeRatingId',
    description: 'O ID da avaliação de onde o voto será removido.',
    example: 45,
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
    description:
      'O voto foi removido com sucesso (ou não existia e a operação foi idempotente).',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'O ID fornecido na URI não é um número válido.',
    type: BadRequestErrorDTO,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description:
      'A avaliação não existe OU o voto especificado não foi encontrado para remoção.',
    type: NotFoundErrorDTO,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Você está tentando remover o voto de outro usuário.',
    type: ForbiddenErrorDTO,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Algo deu errado ao deletar o voto da avaliação.',
  })
  @Delete(':userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteVote(
    @Param('routeRatingId', ParseIntPipe, RouteRatingExistsPipe)
    routeRatingId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    try {
      return await this.routeRatingUpvoteService.delete(userId, routeRatingId);
    } catch (error) {
      if (error instanceof VoteNotFoundError) {
        throw new NotFoundException(
          `Voto não encontrado com estes parâmetros.`,
        );
      }
    }
  }
}
