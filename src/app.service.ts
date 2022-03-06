import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RpcException } from '@nestjs/microservices';
import { catchError, lastValueFrom, map, Observable } from 'rxjs';
import { AuthTokenResponse, RoomUserList } from './app.models';
import { CreatePersonalRoomDto, CreateRoomDto } from './dtos/create-room.dtos';
import { UpdatePersonalRoomDto } from './dtos/room.update.dto';
import { UserPayload, UserWebhookDto } from './dtos/user-webhook.dto';
import { RoomCreatedResponse } from './rooms.models';

@Injectable()
export class AppService {
  logger = new Logger('AppService')

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) { }

  // authenticate as DRACOON admin
  login(): Observable<AuthTokenResponse> {

    let tokenUrl = `/oauth/token`;

    const clientId = this.configService.get('dracoon.clientId');
    const clientSecret = this.configService.get('dracoon.clientSecret');

    const buffer = Buffer.from(`${clientId}:${clientSecret}`, 'utf-8');

    const clientAuth = buffer.toString('base64');

    const username = this.configService.get('dracoon.roomService.roomAdminUsername');
    const password = this.configService.get('dracoon.roomService.roomAdminPassword');


    // x-www-urlencoded credentials for OAuth2 password flow
    const credentials = new URLSearchParams({
      grant_type: 'password',
      username: username,
      password: password,
    });

    // axios request config
    const options = {
      headers: {
        Authorization: `Basic ${clientAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };

    return this.httpService.post(tokenUrl, credentials, options).pipe(
      catchError((e) => {
        this.logger.error('An error ocurred');
        this.logger.error(e);
        throw new RpcException(e);
      }),
      map((response) => response.data)
    );
  };

  // checks if a user has the the correct auth method to receive a personal room
  checkRoomRequired(userInfo: UserPayload): boolean {

    return (
      userInfo.authMethod === 'openid'
    );
  }

  async deleteRoom(id: number) {

    // authenticate as room admin
    const accessTokenResponse = await lastValueFrom(
      this.login(),
    );

    const roomDeleteUrl = `/api/v4/nodes/${id}`;

    // axios request config
    const options = {
      headers: {
        Authorization: `Bearer ${accessTokenResponse.access_token}`,
        'Content-Type': 'application/json',
      },
    };

    return lastValueFrom(
      this.httpService.delete(roomDeleteUrl, options).pipe(
        catchError((e) => {
          this.logger.error(e.response.data);
          throw new RpcException(e.response.data);
        }),
        map((response) => response.data),
      ),
    );
  }

  async updateRoom(payload) {

    // authenticate as room admin
    const accessTokenResponse = await lastValueFrom(
      this.login(),
    );

    console.log(payload)

    const roomUpdateUrl = `/api/v4/nodes/rooms/${payload.id}`;

    // axios request config
    const options = {
      headers: {
        Authorization: `Bearer ${accessTokenResponse.access_token}`,
        'Content-Type': 'application/json',
      },
    };

    return lastValueFrom(
      this.httpService.put(roomUpdateUrl, payload.update, options).pipe(
        catchError((e) => {
          console.log(e)

          throw new RpcException(e.response.data);
        }),
        map((response) => response.data),
      ),
    );
  }

  async getRooms(offset: number = 0) {

    // authenticate as room admin
    const accessTokenResponse = await lastValueFrom(
      this.login(),
    );

    const parentId: number = this.configService.get('dracoon.roomService.parentRoomId');

    const roomFetchUrl = `/api/v4/nodes?parent_id=${parentId.toString()}&offset=${offset}&room_manager=true`;

    console.log(roomFetchUrl)

    // axios request config
    const options = {
      headers: {
        Authorization: `Bearer ${accessTokenResponse.access_token}`,
        'Content-Type': 'application/json',
      },
    };

    const roomsResponse = await lastValueFrom(
      this.httpService.get(roomFetchUrl, options).pipe(
        catchError((e) => {

          throw new RpcException(e.response.data);
        }),
        map((response) => response.data),
      ),
    );

    return roomsResponse;

  }

  // creates a room for a user with required OIDC auth method
  async createRoom(hookPayload: UserWebhookDto): Promise<RoomCreatedResponse> {

    // handle missing user info (unauthorized)
    if (!hookPayload.payload) {

      throw new RpcException('Missing hook payload');
    }

    // handle invalid auth method (only specific OIDC provider valid)
    if (!this.checkRoomRequired(hookPayload.payload)) {

      throw new RpcException('Invalid auth method');
    }

    // authenticate as room admin
    const accessTokenResponse = await lastValueFrom(
      this.login(),
    );

    // assign room creation payload
    const roomName = `${hookPayload.payload.firstName} ${hookPayload.payload.lastName}`;
    const parentId = this.configService.get('dracoon.roomService.parentRoomId');

    const roomPayload = new CreateRoomDto(roomName, parentId, 30, false, [
      hookPayload.payload.id,
    ]);

    const roomCreateUrl = '/api/v4/nodes/rooms';

    // axios request config
    const options = {
      headers: {
        Authorization: `Bearer ${accessTokenResponse.access_token}`,
        'Content-Type': 'application/json',
      },
    };

    const roomCreated: RoomCreatedResponse = await lastValueFrom(
      this.httpService.post(roomCreateUrl, roomPayload, options).pipe(
        catchError((e) => {
          this.logger.error(e);
          this.logger.error(e.response.data);
          throw new RpcException(e.response.data);
        }),
        map((response) => response.data),
      ),
    );

    return roomCreated;
  }

  async getUserInfo(userId: number) {

    // authenticate as room admin
    const accessTokenResponse = await lastValueFrom(
      this.login(),
    );

    const parentId: number = this.configService.get('dracoon.roomService.parentRoomId');

    const userFetchUrl = `/api/v4/nodes/rooms/${parentId.toString()}/users?filter=isGranted:eq:false`;


    // axios request config
    const options = {
      headers: {
        Authorization: `Bearer ${accessTokenResponse.access_token}`,
        'Content-Type': 'application/json',
      },
    };

    const usersResponse: RoomUserList = await lastValueFrom(
      this.httpService.get(userFetchUrl, options).pipe(
        catchError((e) => {

          throw new RpcException(e.response.data);
        }),
        map((response) => response.data),
      ),
    );
    
    const user = usersResponse.items.find(user => user.userInfo.id === userId);

    return user;

  }

  // creates a room for a user by user id
  async createRoomManually(room: CreatePersonalRoomDto): Promise<RoomCreatedResponse> {

    // handle missing user info (unauthorized)
    if (!room) {

      throw new RpcException('Missing room info');
    }

    // authenticate as room admin
    const accessTokenResponse = await lastValueFrom(
      this.login(),
    );

    let roomName = room.name;

    const user = await this.getUserInfo(room.userId);

    if (room.name === undefined || room.name === null) {

      roomName = `${user.userInfo.firstName} ${user.userInfo.lastName}`;

    }

    const parentId = this.configService.get('dracoon.roomService.parentRoomId');

    const roomPayload = new CreateRoomDto(roomName, parentId, 30, false, [
      room.userId,
    ]);

    const roomCreateUrl = '/api/v4/nodes/rooms';

    // axios request config
    const options = {
      headers: {
        Authorization: `Bearer ${accessTokenResponse.access_token}`,
        'Content-Type': 'application/json',
      },
    };

    const roomCreated: RoomCreatedResponse = await lastValueFrom(
      this.httpService.post(roomCreateUrl, roomPayload, options).pipe(
        catchError((e) => {
          this.logger.error(e);
          this.logger.error(e.response.data);
          throw new RpcException(e.response.data);
        }),
        map((response) => response.data),
      ),
    );

    return roomCreated;
  }

}
