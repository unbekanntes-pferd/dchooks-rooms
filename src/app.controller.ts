import { Controller, Get, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { EventTypeNames, RoomActionType } from './action.models';
import { AppService } from './app.service';
import { CreatePersonalRoomDto } from './dtos/create-room.dtos';
import { UpdatePersonalRoomDto } from './dtos/room.update.dto';
import { UserWebhookDto } from './dtos/user-webhook.dto';

@Controller()
export class AppController {
  logger = new Logger('AppController');

  constructor(private readonly appService: AppService) {}

  @MessagePattern({ msg: EventTypeNames.userCreated })
  createRoomForNewUser(userPayload: UserWebhookDto) {

    this.logger.log('Received create.room event.');

    if (this.appService.checkRoomRequired(userPayload.payload)) {

      this.logger.log('Creating room.');

      return this.appService.createRoom(userPayload);

    }
  }

  @MessagePattern({ msg: RoomActionType.getRooms })
  getRooms(offset: number) {

    this.logger.log('Received get.rooms event.');

    return this.appService.getRooms(offset);

  }

  @MessagePattern({ msg: RoomActionType.createRoom })
  createRoomManually(room: CreatePersonalRoomDto) {

    this.logger.log('Received update.rooms event.');

    return this.appService.createRoomManually(room);

  }

  @MessagePattern({ msg: RoomActionType.updateRoom })
  updateRoom(payload) {

    this.logger.log('Received update.rooms event.');

    return this.appService.updateRoom(payload);

  }

  @MessagePattern({ msg: RoomActionType.deleteRoom })
  deleteRoom(roomId: number) {

    this.logger.log('Received delete.room event.');

    return this.appService.deleteRoom(roomId);

  }
}
