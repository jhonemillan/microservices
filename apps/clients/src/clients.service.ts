// apps/clients/src/clients.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  create(createClientDto: CreateClientDto, userId: string): Promise<Client> {
    const client = this.clientRepository.create({
      ...createClientDto,
      userId,
    });
    return this.clientRepository.save(client);
  }

  findAllForUser(userId: string): Promise<Client[]> {
    return this.clientRepository.find({ where: { userId } });
  }

  async findOneForUser(id: string, userId: string): Promise<Client> {
    console.log('Searching for client with ID:', id, 'for user:', userId);
    const client = await this.clientRepository.findOneBy({ id, userId });
    console.log('Found client:', client);
    if (!client) {
      throw new NotFoundException(`Client with ID "${id}" not found`);
    }
    return client;
  }

  async update(id: string, updateClientDto: UpdateClientDto, userId: string): Promise<Client> {
    const client = await this.findOneForUser(id, userId);
    Object.assign(client, updateClientDto);
    return this.clientRepository.save(client);
  }

  async remove(id: string, userId: string): Promise<void> {
    const client = await this.findOneForUser(id, userId);
    await this.clientRepository.remove(client);
  }
}