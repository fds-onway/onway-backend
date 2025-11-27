import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt } from 'class-validator';

class RouteRatingUpvoteDTO {
  @ApiProperty({
    description:
      'O valor do voto. 1 para Upvote (Gostei), -1 para Downvote (Não gostei).',
    example: 1,
    enum: [1, -1],
  })
  @IsInt()
  @IsIn([1, -1], {
    message: 'O valor do voto deve ser 1 ou -1.',
  })
  value: number;
}

export { RouteRatingUpvoteDTO };
