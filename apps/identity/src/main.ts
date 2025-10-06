import { NestFactory } from '@nestjs/core';
import { IdentityModule } from './identity.module';

async function bootstrap() {
  const app = await NestFactory.create(IdentityModule);
  app.setGlobalPrefix('api');
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
