import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import  appConfig from './config/configuration';

@Module({
  imports: [   
     ConfigModule.forRoot({
    load: [appConfig],
    isGlobal: true
  }), 
    
    HttpModule.registerAsync({
    imports: [ConfigModule],
    useFactory: async (configService: ConfigService) => ({
      baseURL: configService.get('dracoon.url'),
      validateStatus: function (status: number) {
        return status < 400;
      },
      headers: {
        'User-Agent': 'dc-hooks|room-service|0.1.0'
      }
    }),
    inject: [ConfigService]
  })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
