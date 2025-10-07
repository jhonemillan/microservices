import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class PaymentsService {
  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  processPayment(paymentData: any) {
    console.log('Emitting payment.processed event to Kafka', paymentData);
    this.kafkaClient.emit('payment.processed', JSON.stringify(paymentData));
  }
}