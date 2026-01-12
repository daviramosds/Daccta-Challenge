import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Sistema de Agendamento de Salas')
    .setDescription('API para gerenciamento de salas e agendamentos de reuniões')
    .setVersion('1.0')
    .addTag('rooms', 'Operações relacionadas a salas')
    .addTag('bookings', 'Operações relacionadas a agendamentos')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT || 3000);
  console.log(`🚀 Server running on http://localhost:${process.env.PORT || 3000}`);
  console.log(`📚 Swagger docs available at http://localhost:${process.env.PORT || 3000}/api/docs`);
}
bootstrap();
