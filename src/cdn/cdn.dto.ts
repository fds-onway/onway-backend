import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl } from 'class-validator';

class SuccessfulPresignedURLDTO {
  @ApiProperty({
    example:
      'https://meu-bucket.s3.amazonaws.com/uploads/novo-arquivo.txt?AWSAccessKeyId=...',
    description: 'A URL Assinada para você fazer o upload',
  })
  @IsString()
  @IsUrl()
  url: string;
}

export { SuccessfulPresignedURLDTO };
