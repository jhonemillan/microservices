import { NestFactory } from '@nestjs/core';
import { BillingModule } from './billing.module';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(BillingModule);
  app.connectMicroservice({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: ['kafka:29092'],
      },
      consumer: {
        groupId: 'billing-consumer',
      },
    },
  });
  await app.startAllMicroservices();
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
