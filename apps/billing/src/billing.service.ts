import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Invoice } from './invoice.entity';
import { Repository } from 'typeorm';
import { CreateInvoiceDto } from './create-invoice.dto';
import { UpdateInvoiceDto } from './update-invoice.dto';
import Opossum = require('opossum')
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class BillingService {
  private circuitBreaker: Opossum;
  constructor(
    // Inyectamos el repositorio para poder interactuar con la tabla 'invoice'
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    private readonly httpService: HttpService,
  ) {
    const searchClient = async (clientId: string, userId: string, token: string) => 
        firstValueFrom(
            this.httpService.get(`http://clients:3000/clients/${clientId}`, {
                headers: { Authorization: token },
            }),
        );

    // Opciones del Circuit Breaker
    const options: Opossum.Options = {
      timeout: 3000, // Si la llamada tarda más de 3s, cuenta como fallo
      errorThresholdPercentage: 50, // Si el 50% de las últimas peticiones fallan, abre el circuito
      resetTimeout: 30000, // Después de 30s, intenta cerrar el circuito de nuevo
    };

    this.circuitBreaker = new Opossum(searchClient, options);
  }

  async create(createInvoiceDto: CreateInvoiceDto, userId: string, token: string): Promise<Invoice> {
    try {
      await this.circuitBreaker.fire(createInvoiceDto.clientId, userId, token);
    } catch (error) {
      throw new BadRequestException(`Client with ID "${createInvoiceDto.clientId}" not found or client service is down.`);
    }
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
