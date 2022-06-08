import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as WebSocket from 'ws';
import constants from '../../constants';
import { JWTHelper } from '../../util/jwt';
import { CallFlowFacade, LogFacade } from '../facade';
import { OpentactAuth } from '../opentact';

@WebSocketGateway({
  handlePreflightRequest: function (req, res) {
    var headers = {
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    };
    res.writeHead(200, headers);
    res.end();
  },
})
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  oWss: WebSocket;

  constructor(
    private opentactAuth: OpentactAuth,
    private callFlowFacade: CallFlowFacade,
    private logFacade: LogFacade,
  ) {
    this.oWss = new WebSocket(constants.OPENTACT_WSS);
    that = this;

    this.oWss.onopen = this.onWssOpen;
    this.oWss.onclose = this.onWssClose;
    this.oWss.onmessage = this.onWssMessage;
    this.oWss.onerror = this.onWssError;
  }

  /////////////////////////
  // Opentact wss
  async onWssOpen() {
    console.log('Opentact wss connection established');

    let openTactToken = await that.opentactAuth.getToken();

    const authRequest = {
      type: 'auth',
      payload: openTactToken.payload.token,
    };
    that.oWss.send(JSON.stringify(authRequest));
  }

  onWssClose() {
    console.log('Opentact wss connection closed');
  }

  async onWssMessage(msg: any) {
    let data = JSON.parse(msg.data.toString());

    if (data.type !== 'auth') {
      if (data.type === 'tn_order') {
        const order = await that.logFacade.orderNumber(data);

        that.wss
          .to(`room_${order.raw[0].user_uuid}`)
          .emit('msgToClient', { ...data, ...order });
      } else {
        await that.logFacade.addLog(data);
      }
    }

    if (
      data.type === 'call_state' &&
      data.payload.direction === 'in' &&
      data.payload.state === 'online'
    ) {
      const socx = await that.callFlowFacade.sendOpentactCallXml(
        data.payload.uuid,
        data.payload.to,
      );
      console.log(socx);
    }

    return false;
  }

  onWssError(err: any) {
    console.log({ err });
  }

  ////////////////////////
  // Local wss
  private logger: Logger = new Logger('AppGateway');
  private room: string;

  @WebSocketServer() wss: Server;

  afterInit(server: Socket) {
    that.logger.log('Initialized');
  }

  async handleConnection(client: Socket, ...args: any[]) {
    let token: any =
      client.handshake.headers['authorization'] &&
      client.handshake.headers['authorization'].split(' ')[1];
    let user: any;
    if (token) {
      user = await JWTHelper.verify(token);
    } else user = { userUuid: client.handshake.headers['tempuuid'] };
    if (!user || !user.userUuid) {
      client.disconnect(true);
      throw new Error('authentication error');
    }
    if (
      !user.userUuid.match(
        /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
      )
    ) {
      client.disconnect(true);
      throw new Error('invalid uuid');
    }
    that.logger.log(`Client connected: ${client.id}`);
    client.emit('getRoom', user.userUuid);
  }

  handleDisconnect(client: Socket) {
    that.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('msgToServer')
  handleMessage(
    client: Socket,
    message: { message: string; room: string; sender: string },
  ): void {
    that.wss.to(message.room).emit('msgToClient', message.message);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, room: string) {
    that.room = room;
    client.join(room);
    client.emit('joinedRoom', `Joined room ${room}`);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(client: Socket, room: string) {
    client.leave(room);
    client.emit('leftRoom', `Left room ${room}`);
  }
}

let that: AppGateway;
