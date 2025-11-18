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
import { RoutePointExistsPipe } from '../route-point-exists.pipe';
import { RoutePointUpvoteDTO } from './route-point-upvote.dto';
import { VoteNotFoundError } from './route-point-upvote.exceptions';
import { RoutePointUpvoteService } from './route-point-upvote.service';

@ApiTags('Upvotes')
@Controller('route-point/:routePointId/vote')
@UseGuards(AuthGuard, SelfUserGuard)
@ApiBearerAuth()
export class RoutePointUpvoteController {
  constructor(
    private readonly routePointUpvoteService: RoutePointUpvoteService,
  ) {}

  @ApiOperation({
    summary: 'Registrar ou atualizar um voto em um PONTO de rota',
    description:
      'Permite que um usuário dê Upvote (+1) ou Downvote (-1) em um ponto específico de uma rota. Se o voto já existir, ele será atualizado. É necessário ser o próprio usuário para realizar esta ação.',
  })
  @ApiParam({
    name: 'routePointId',
    description: 'O ID do ponto da rota que receberá o voto.',
    example: 42,
    type: Number,
  })
  @ApiParam({
    name: 'userId',
    description: 'O ID do usuário que está votando (deve ser você mesmo).',
    example: 1,
    type: Number,
  })
  @ApiBody({
    type: RoutePointUpvoteDTO,
    description: 'O valor do voto (1 para positivo, -1 para negativo).',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'O voto no ponto foi registrado ou atualizado com sucesso.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'O ID fornecido na URI não é válido ou o corpo da requisição está incorreto.',
    type: BadRequestErrorDTO,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'O ponto da rota fornecido na URI não foi encontrado.',
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
    description: 'Algo deu errado ao registrar o voto no ponto.',
  })
  @Put(':userId')
  async registerVote(
    @Param('routePointId', ParseIntPipe, RoutePointExistsPipe)
    routePointId: number,
    @Param('userId') userId: number,
    @Body() routePointUpvoteDTO: RoutePointUpvoteDTO,
  ) {
    return await this.routePointUpvoteService.register(
      userId,
      routePointId,
      routePointUpvoteDTO.value as 1 | -1,
    );
  }

  @ApiOperation({
    summary: 'Remover um voto de um PONTO de rota',
    description:
      'Remove o voto (seja positivo ou negativo) que um usuário deu em um ponto específico de uma rota.',
  })
  @ApiParam({
    name: 'routePointId',
    description: 'O ID do ponto da rota de onde o voto será removido.',
    example: 42,
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
      'O ponto da rota não existe OU o voto especificado não foi encontrado para remoção.',
    type: NotFoundErrorDTO,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Você está tentando remover o voto de outro usuário.',
    type: ForbiddenErrorDTO,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Algo deu errado ao deletar o voto do ponto.',
  })
  @Delete(':userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteVote(
    @Param('routePointId', ParseIntPipe, RoutePointExistsPipe)
    routePointId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    try {
      return await this.routePointUpvoteService.delete(userId, routePointId);
    } catch (error) {
      if (error instanceof VoteNotFoundError) {
        throw new NotFoundException(
          `Voto não encontrado com estes parâmetros.`,
        );
      }
    }
  }
}
