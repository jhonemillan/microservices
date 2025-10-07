import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { BillingService } from './billing.service';
import { CreateInvoiceDto } from './create-invoice.dto';
import { UpdateInvoiceDto } from './update-invoice.dto';
import { JwtAuthGuard } from '@app/common';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  create(@Body() createInvoiceDto: CreateInvoiceDto, @Req() req: any) {
    const userId = req.user.id;
    const token = req.headers.authorization; 
    return this.billingService.create(createInvoiceDto, userId, token);
  }

  @Get()
  findAll(@Req() req: any) {
    const userId = req.user.id
    return this.billingService.findAllForUser(userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    const userId = req.user.id;
    return this.billingService.findOneForUser(id, userId);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe())
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateInvoiceDto: UpdateInvoiceDto, @Req() req: any) {
    const userId = req.user.id
    return this.billingService.update(id, updateInvoiceDto, userId);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    const userId = req.user.id
    return this.billingService.remove(id, userId);
  }

  @Get()
  getHello(): string {
    return this.billingService.getHello();
  }

  @EventPattern('payment.processed')
  handlePaymentProcessed(@Payload() message: any) {
    console.log('BillingController: Received payment.processed event', message);
    this.billingService.updateInvoiceStatus(message);
  }
}
