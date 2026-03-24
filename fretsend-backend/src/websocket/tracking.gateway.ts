import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  MessageBody, ConnectedSocket, OnGatewayInit,
  OnGatewayConnection, OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

export interface TrackingUpdate {
  packageId: string; trackingNumber: string; status: string;
  title: string; timestamp: string; latitude?: number; longitude?: number;
}

@WebSocketGateway({
  namespace: '/tracking',
  cors: { origin: [process.env.FRONTEND_URL||'http://localhost:3000','http://localhost:8081'], credentials: true },
  transports: ['websocket','polling'],
})
export class TrackingGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(TrackingGateway.name);

  afterInit() { this.logger.log('WebSocket /tracking prêt'); }
  handleConnection(c: Socket) { this.logger.debug(`Connecté: ${c.id}`); }
  handleDisconnect(c: Socket) { this.logger.debug(`Déconnecté: ${c.id}`); }

  @SubscribeMessage('subscribe:tracking')
  handleSubscribe(@MessageBody() data: { trackingNumber: string }, @ConnectedSocket() c: Socket) {
    c.join(`tracking:${data.trackingNumber}`);
    c.emit('subscribed', { trackingNumber: data.trackingNumber });
  }

  @SubscribeMessage('unsubscribe:tracking')
  handleUnsubscribe(@MessageBody() data: { trackingNumber: string }, @ConnectedSocket() c: Socket) {
    c.leave(`tracking:${data.trackingNumber}`);
  }

  @SubscribeMessage('subscribe:dashboard')
  handleDashboard(@ConnectedSocket() c: Socket) {
    c.join('dashboard');
    c.emit('subscribed', { room: 'dashboard' });
  }

  emitUpdate(trackingNumber: string, payload: TrackingUpdate) {
    this.server.to(`tracking:${trackingNumber}`).emit('tracking:update', payload);
    this.server.to('dashboard').emit('tracking:update', payload);
    this.logger.log(`WS emit → ${trackingNumber} (${payload.status})`);
  }

  emitStats(stats: Record<string, any>) {
    this.server.to('dashboard').emit('stats:update', stats);
  }
}
