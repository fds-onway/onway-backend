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
        tags: ['auth', 'users'],
      },
      {
        name: 'Utilitários',
        tags: ['utils', 'misc'],
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
