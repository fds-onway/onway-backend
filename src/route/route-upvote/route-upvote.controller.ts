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
import { AuthGuard } from 'src/auth/auth.guard';
import { SelfUserGuard } from 'src/user/self-user.guard';
import { RouteExistsPipe } from '../route-exists.pipe';
import { RouteUpvoteDTO } from './route-upvote.dto';
import { VoteNotFoundError } from './route-upvote.exceptions';
import { RouteUpvoteService } from './route-upvote.service';

@Controller('route/:routeId/vote')
@UseGuards(AuthGuard, SelfUserGuard)
export class RouteUpvoteController {
  constructor(private readonly routeUpvoteService: RouteUpvoteService) {}

  @Put(':userId')
  async registerVote(
    @Param('routeId', ParseIntPipe, RouteExistsPipe) routeId: number,
    @Param('userId') userId: number,
    @Body() routeUpvoteDTO: RouteUpvoteDTO,
  ) {
    return await this.routeUpvoteService.register(
      userId,
      routeId,
      routeUpvoteDTO.value as 1 | -1,
    );
  }

  @Delete(':userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteVote(
    @Param('routeId', ParseIntPipe, RouteExistsPipe) routeId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    try {
      return await this.routeUpvoteService.delete(userId, routeId);
    } catch (error) {
      if (error instanceof VoteNotFoundError) {
        throw new NotFoundException(
          `Voto não encontrado com estes parâmetros.`,
        );
      }
    }
  }
}
