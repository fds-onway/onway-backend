import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsAdminGuard } from 'src/auth/is-admin.guard';
import { CreateRouteDTO } from './route.dto';
import { RouteService } from './route.service';

@Controller('route')
@ApiTags('Rotas')
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @ApiOperation({ summary: 'Criar uma nova rota inteira.' })
  @Post()
  @UseGuards(AuthGuard, IsAdminGuard)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  create(@Body() body: CreateRouteDTO) {}
}
