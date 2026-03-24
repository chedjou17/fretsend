import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export interface TrackingUpdate {
    packageId: string;
    trackingNumber: string;
    status: string;
    title: string;
    timestamp: string;
    latitude?: number;
    longitude?: number;
}
export declare class TrackingGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private readonly logger;
    afterInit(): void;
    handleConnection(c: Socket): void;
    handleDisconnect(c: Socket): void;
    handleSubscribe(data: {
        trackingNumber: string;
    }, c: Socket): void;
    handleUnsubscribe(data: {
        trackingNumber: string;
    }, c: Socket): void;
    handleDashboard(c: Socket): void;
    emitUpdate(trackingNumber: string, payload: TrackingUpdate): void;
    emitStats(stats: Record<string, any>): void;
}
