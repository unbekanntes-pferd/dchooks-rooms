import { Controller, Get, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { EventTypeNames } from './action.models';
import { AppService } from './app.service';
import { UserWebhookDto } from './dtos/user-webhook.dto';

@Controller()
export class AppController {
  logger = new Logger('AppController');

  constructor(private readonly appService: AppService) {}

  @MessagePattern({ msg: EventTypeNames.userCreated })
  createRoom(userPayload: UserWebhookDto) {

    this.logger.log('Received create.room event.');

    if (this.appService.checkRoomRequired(userPayload.payload)) {

      this.logger.log('Creating room.');

      return this.appService.createRoom(userPayload);

    }
  }
}
