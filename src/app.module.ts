import { Module } from '@nestjs/common';
import { TasksModule } from './tasks/tasks.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    TasksModule,
    AuthModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
          type: 'postgres',
          database: 'postgres',
          autoLoadEntities: true,
          synchronize: true,
          port: configService.get<number>('DB_PORT'),
          host: configService.get<string>('DB_HOST'),
          username: configService.get<string>('DB_USER'),
          password: configService.get<string>('DB_PASS'),
        }),
    }),
    UsersModule,
  ],
})
export class AppModule {}
