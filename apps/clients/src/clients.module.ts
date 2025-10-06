// apps/clients/src/clients.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { Client } from './client.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard, JwtStrategy } from '@app/common';
import { redisStore } from 'cache-manager-redis-store';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
              imports: [ConfigModule],
              inject: [ConfigService],
              useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: {
                  expiresIn: configService.get<string>('JWT_EXPIRATION'),
                },
              }),
            }),
    CacheModule.registerAsync({
              imports: [ConfigModule],
              inject: [ConfigService],
              useFactory: async (configService: ConfigService) => ({
                store: await redisStore({
                  socket: {
                    host: configService.get<string>('REDIS_HOST'),
                    port: configService.get<number>('REDIS_PORT'),
                  },
                }),
              }),
              isGlobal: true,
            }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [Client], // Registramos la nueva entidad Client
        synchronize: true,
      }),
    }),

    TypeOrmModule.forFeature([Client]),
  ],
  controllers: [ClientsController],
  providers: [ClientsService, JwtStrategy, JwtAuthGuard],
})
export class ClientsModule {}