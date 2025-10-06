// apps/billing/src/invoice.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

// Usamos un 'enum' para tener estados predefinidos y evitar errores de tipeo.
export enum InvoiceStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
}

@Entity() // Le dice a TypeORM que esta clase es una tabla de la base de datos.
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  description: string;

  // El tipo 'decimal' es ideal para manejar dinero y evitar problemas de redondeo.
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: InvoiceStatus,
    default: InvoiceStatus.PENDING, // Por defecto, una factura nueva estará pendiente.
  })
  status: InvoiceStatus;

  // Esta columna es crucial. Vincula la factura con el usuario que la creó.
  @Column()
  userId: string;

  @Column() 
  clientId: string;
  
  // TypeORM llenará estas columnas automáticamente.
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}