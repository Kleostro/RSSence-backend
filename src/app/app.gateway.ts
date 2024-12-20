import { Socket } from 'socket.io';

import { Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, WebSocketGateway } from '@nestjs/websockets';

const logger = new Logger('App Gateway');

@WebSocketGateway()
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  public afterInit(): void {
    logger.log('WebSocket server initialized!');
  }

  public handleConnection(client: Socket): void {
    logger.log(`Client connected: ${client.id}`);
  }

  public handleDisconnect(client: Socket): void {
    logger.log(`Client disconnected: ${client.id}`);
  }
}
