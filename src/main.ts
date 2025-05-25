import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Server');
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  const port = process.env.PORT ?? 3000;
  await app.listen(port, () => {
    logger.log(`server running on port ${port}`);
  });
}
bootstrap();
