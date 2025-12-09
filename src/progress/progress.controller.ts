import {
  Body,
  ConflictException,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { NotFoundErrorDTO, ValidationErrorDTO } from 'src/error.dto';
import { RouteExistsPipe } from 'src/route/route-exists.pipe';
import { SelfUserGuard } from 'src/user/self-user.guard';
import ProgressDTO, { RouteProgressResponseDTO } from './progress.dto';
import { PointIsNotInTheSameRouteError } from './progress.exceptions';
import { ProgressService } from './progress.service';

@ApiTags('Progresso')
@ApiBearerAuth()
@Controller('route')
@UseGuards(AuthGuard, SelfUserGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @ApiOperation({
    summary: 'Listar todo o progresso de um usuário',
    description:
      'Retorna uma lista de todas as rotas que o usuário iniciou, em andamento ou concluídas, ordenadas pela atualização mais recente.',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID do usuário para buscar o histórico.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de progressos recuperada com sucesso.',
    type: [RouteProgressResponseDTO],
  })
  @Get('progress/:userId')
  async getAllProgress(@Param('userId', ParseIntPipe) userId: number) {
    return await this.progressService.listProgress(userId);
  }

  @ApiOperation({
    summary: 'Salvar ou atualizar o progresso em uma rota',
    description: `
      Registra que o usuário chegou em um determinado ponto.
      - Se for a primeira vez, cria o registro (inicia a rota).
      - Se já existir, atualiza o último ponto visitado.
      - Se o ponto for o último da rota, marca automaticamente como concluída (completedAt).
    `,
  })
  @ApiParam({
    name: 'routeId',
    description: 'ID da rota que está sendo percorrida.',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID do usuário (deve corresponder ao token logado).',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Progresso salvo/atualizado com sucesso.',
    type: RouteProgressResponseDTO,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'A rota especificada no parâmetro não existe.',
    type: NotFoundErrorDTO,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description:
      'O ponto informado no corpo da requisição não pertence à rota informada na URL.',
    type: ValidationErrorDTO,
  })
  @Put(':routeId/progress/:userId')
  async saveProgress(
    @Param('routeId', ParseIntPipe, RouteExistsPipe) routeId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: ProgressDTO,
  ) {
    try {
      return await this.progressService.saveProgress(userId, routeId, dto);
    } catch (error) {
      if (error instanceof PointIsNotInTheSameRouteError) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }
}
