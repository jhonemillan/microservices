// apps/identity/src/user.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert } from 'typeorm';
import * as bcrypt from 'bcryptjs';

// El decorador @Entity() le dice a TypeORM que esta clase es un modelo de tabla de base de datos.
@Entity()
export class User {
  // @PrimaryGeneratedColumn('uuid') crea una columna de clave primaria que se autogenera como un UUID.
  // Usar UUID es una mejor práctica en microservicios para evitar conflictos de IDs.
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // @Column() mapea esta propiedad a una columna de la tabla.
  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({ nullable: false })
  fullName: string;

  // El decorador @BeforeInsert() es un "hook" de TypeORM.
  // Esta función se ejecutará automáticamente ANTES de que un nuevo usuario sea guardado en la DB.
  // La usaremos para hashear la contraseña de forma segura.
  @BeforeInsert()
  async hashPassword() {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
  }
}