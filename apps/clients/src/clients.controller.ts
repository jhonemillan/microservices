// apps/clients/src/clients.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ValidationPipe, UsePipes, ParseUUIDPipe } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { JwtAuthGuard } from '@app/common';

@Controller('clients')
@UseGuards(JwtAuthGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  create(@Body() createClientDto: CreateClientDto, @Req() req: any) {
    const userId = req.user.id;
    return this.clientsService.create(createClientDto, userId);
  }

  @Get()
  findAll(@Req() req: any) {
    const userId = req.user.id;
    return this.clientsService.findAllForUser(userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    const userId = req.user.id;
    return this.clientsService.findOneForUser(id, userId);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe())
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateClientDto: UpdateClientDto, @Req() req: any) {
    const userId = req.user.id;
    return this.clientsService.update(id, updateClientDto, userId);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    const userId = req.user.id;
    return this.clientsService.remove(id, userId);
  }
}