import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { NodeHttpHandler } from '@aws-sdk/node-http-handler';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, Logger } from '@nestjs/common';
import { FileExistsException } from './cdn.exceptions';

export type CDNDirectories = 'routes' | 'points' | 'pointSuggestions';

@Injectable()
export class CdnService {
  private readonly logger = new Logger(CdnService.name);
  private readonly s3Client: S3Client;

  private readonly bucketName: string;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION!,
      maxAttempts: 3,
      requestHandler: new NodeHttpHandler({ connectionTimeout: 5000 }),
      credentials: {
        accessKeyId: process.env.CDN_USER_ACCESS_KEY_ID!,
        secretAccessKey: process.env.CDN_USER_SECRET_ACCESS_KEY!,
      },
    });

    this.bucketName = process.env.CDN_BUCKET_NAME!;
  }

  async getUploadPresignedURL(
    folder: CDNDirectories,
    fileName: string,
    fileType: string,
  ): Promise<string> {
    try {
      const checkCommand = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: `${folder}/${fileName}`,
      });

      await this.s3Client.send(checkCommand);

      throw new FileExistsException('The file already exists');
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'NotFound') {
        const command = new PutObjectCommand({
          Bucket: this.bucketName,
          Key: `${folder}/${fileName}`,
          ContentType: fileType,
        });

        const url = await getSignedUrl(this.s3Client, command, {
          expiresIn: 300,
        });

        return url;
      }
      throw error;
    }
  }

  async deleteFile(folder: CDNDirectories, fileName: string): Promise<void> {
    const filePath = `${folder}/${fileName}`;

    const deleteCommand = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: filePath,
    });

    try {
      await this.s3Client.send(deleteCommand);
    } catch {
      // pass
    }
  }
}
