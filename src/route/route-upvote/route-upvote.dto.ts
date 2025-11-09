import { IsIn, IsInt } from 'class-validator';

class RouteUpvoteDTO {
  @IsInt()
  @IsIn([1, -1], {
    message: 'O valor do voto deve ser 1 ou -1.',
  })
  value: number;
}

export { RouteUpvoteDTO };
