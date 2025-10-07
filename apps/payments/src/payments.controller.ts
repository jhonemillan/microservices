import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '@app/common';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('webhook')
  handlePaymentWebhook(@Body() paymentData: any) {
    this.paymentsService.processPayment(paymentData);
    return { message: 'Webhook received and event emitted.' };
  }
}