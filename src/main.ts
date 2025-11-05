import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  NestjsRedoxModule,
  NestJSRedoxOptions,
  RedocOptions,
} from 'nestjs-redox';
import { AppModule } from './app.module';

async function bootstrap() {
  const requiredEnvVariables = [
    'ENV',
    'DOCKER_USERNAME',
    'POSTGRES_HOST',
    'POSTGRES_USER',
    'POSTGRES_PASSWORD',
    'POSTGRES_DB',
    'POSTGRES_PORT',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_CALLBACK_URL',
    'EMAIL_USER_ACCESS_KEY_ID',
    'EMAIL_USER_SECRET_ACCESS_KEY',
    'TOKEN_SECRET',
  ];

  for (const envVar of requiredEnvVariables) {
    if (process.env[envVar] === undefined) {
      throw new Error(`Variável de ambiente ${envVar} necessária faltando.`);
    }
  }

  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('OnWay API')
    .setDescription(
      "Documentação da API do projeto de Fábrica de Software 'OnWay', contendo todas as rotas utilizadas no mesmo",
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  const redocOptions: RedocOptions = {
    tagGroups: [
      {
        name: 'Usuários e Gestão de Acesso',
        tags: ['Autenticação', 'Usuários'],
      },
      {
        name: 'Rotas, Pontos e Sugestão de Pontos',
        tags: ['Rotas'],
      },
      {
        name: 'Imagens',
        tags: ['Imagens'],
      },
      {
        name: 'Utilitários',
        tags: ['Utils', 'Miscelânia'],
      },
    ],
  };

  const redoxOptions: NestJSRedoxOptions = {
    useGlobalPrefix: false,
  };

  NestjsRedoxModule.setup('docs', app, document, redoxOptions, redocOptions);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
