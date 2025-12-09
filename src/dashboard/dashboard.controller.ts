import { Controller, Get, HttpStatus, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { IsAdminGuard } from 'src/auth/is-admin.guard';
import {
  ActiveProgressCountResponseDTO,
  CompletedRoutesCountResponseDTO,
  RouteCountResponseDTO,
  UserCountResponseDTO,
} from './dashboard.dto';
import { DashboardService } from './dashboard.service';

@ApiTags('Indicadores/KPIs')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(AuthGuard, IsAdminGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('users/count')
  @ApiOperation({ summary: 'Obter total de usuários' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Contagem retornada com sucesso.',
    type: UserCountResponseDTO,
  })
  async currentUserCount() {
    return await this.dashboardService.currentUserCount();
  }

  @Get('routes/count')
  @ApiOperation({ summary: 'Obter total de rotas' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Contagem retornada com sucesso.',
    type: RouteCountResponseDTO,
  })
  async currentRouteCount() {
    return await this.dashboardService.currentRouteCount();
  }

  @Get('routes/active/count')
  @ApiOperation({ summary: 'Obter total de rotas em andamento' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Contagem retornada com sucesso.',
    type: ActiveProgressCountResponseDTO,
  })
  async currentRouteProgressCount() {
    return await this.dashboardService.currentRouteProgressCount();
  }

  @Get('routes/completed/count')
  @ApiOperation({ summary: 'Obter total de rotas concluídas' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Contagem retornada com sucesso.',
    type: CompletedRoutesCountResponseDTO,
  })
  async currentCompletedRoutesCount() {
    return await this.dashboardService.currentCompletedRoutesCount();
  }
}
