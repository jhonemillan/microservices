import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Invoice } from './invoice.entity';
import { Repository } from 'typeorm';
import { CreateInvoiceDto } from './create-invoice.dto';
import { UpdateInvoiceDto } from './update-invoice.dto';

@Injectable()
export class BillingService {
  constructor(
    // Inyectamos el repositorio para poder interactuar con la tabla 'invoice'
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
  ) {}

  create(createInvoiceDto: CreateInvoiceDto, userId: string): Promise<Invoice> {
    const invoice = this.invoiceRepository.create({
      ...createInvoiceDto,
      userId,
    });
    return this.invoiceRepository.save(invoice);
  }

  findAllForUser(userId: string): Promise<Invoice[]> {
    return this.invoiceRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' }, // Ordenar por las más recientes primero
    });
  }

  async findOneForUser(id: string, userId: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOneBy({ id, userId });
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID "${id}" not found`);
    }
    return invoice;
  }

   async update(id: string, updateInvoiceDto: UpdateInvoiceDto, userId: string): Promise<Invoice> {
    // Primero, nos aseguramos de que la factura exista y pertenezca al usuario
    const invoice = await this.findOneForUser(id, userId);
    
    // Fusionamos los nuevos datos con la factura existente
    Object.assign(invoice, updateInvoiceDto);
    
    return this.invoiceRepository.save(invoice);
  }

  async remove(id: string, userId: string): Promise<void> {
    const invoice = await this.findOneForUser(id, userId);
    await this.invoiceRepository.remove(invoice);
  }
  
  getHello(): string {
    return 'Hello World!';
  }
}
