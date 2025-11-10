/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class FolderPipe implements PipeTransform {
  private readonly validFolders = ['routes', 'points', 'pointSuggestions'];

  transform(value: any, metadata: ArgumentMetadata) {
    if (typeof value !== 'string') {
      throw new BadRequestException('Invalid value type for "folder" query');
    }

    if (!this.validFolders.includes(value)) {
      throw new BadRequestException(
        '"folder" query must be one of the following: routes, points, pointSuggestions',
      );
    }
    return value;
  }
}
