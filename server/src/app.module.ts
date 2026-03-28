import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PoliciesModule } from './policies/policies.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST', '8.163.33.195'),
        port: configService.get<number>('DB_PORT', 3806),
        username: configService.get('DB_USERNAME', 'opclab_X14.'),
        password: configService.get('DB_PASSWORD', 'bBJHLwL8exXtz2kF'),
        database: configService.get('DB_DATABASE', 'opc'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // 生产环境应改为 false
        logging: configService.get('NODE_ENV') !== 'production',
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    PoliciesModule,
  ],
})
export class AppModule {}
