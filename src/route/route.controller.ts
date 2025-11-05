import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
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
  async create(@Body() body: CreateRouteDTO, @Req() request: Request) {
    return await this.routeService.create(body, request);
  }
}
