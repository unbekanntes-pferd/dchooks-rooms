import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RpcException } from '@nestjs/microservices';
import { catchError, lastValueFrom, map, Observable } from 'rxjs';
import { AuthTokenResponse } from './app.models';
import { CreateRoomDTO } from './dtos/create-room.dto';
import { UserPayload, UserWebhookDto } from './dtos/user-webhook.dto';
import { RoomCreatedResponse } from './rooms.models';

@Injectable()
export class AppService {
  logger = new Logger('AppService')

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

    // authenticate as DRACOON admin
    login(): Observable<AuthTokenResponse> {

      //const baseUrl = this.configService.get('dracoon.url');

      let tokenUrl = `/oauth/token`;
      //this.logger.log(tokenUrl);
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
 
    const roomPayload = new CreateRoomDTO(roomName, parentId, 30, false, [
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

}
