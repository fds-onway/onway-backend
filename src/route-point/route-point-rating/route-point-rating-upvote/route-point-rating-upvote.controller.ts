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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
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
