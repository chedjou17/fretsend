"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var TrackingGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackingGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
let TrackingGateway = TrackingGateway_1 = class TrackingGateway {
    constructor() {
        this.logger = new common_1.Logger(TrackingGateway_1.name);
    }
    afterInit() { this.logger.log('WebSocket /tracking prêt'); }
    handleConnection(c) { this.logger.debug(`Connecté: ${c.id}`); }
    handleDisconnect(c) { this.logger.debug(`Déconnecté: ${c.id}`); }
    handleSubscribe(data, c) {
        c.join(`tracking:${data.trackingNumber}`);
        c.emit('subscribed', { trackingNumber: data.trackingNumber });
    }
    handleUnsubscribe(data, c) {
        c.leave(`tracking:${data.trackingNumber}`);
    }
    handleDashboard(c) {
        c.join('dashboard');
        c.emit('subscribed', { room: 'dashboard' });
    }
    emitUpdate(trackingNumber, payload) {
        this.server.to(`tracking:${trackingNumber}`).emit('tracking:update', payload);
        this.server.to('dashboard').emit('tracking:update', payload);
        this.logger.log(`WS emit → ${trackingNumber} (${payload.status})`);
    }
    emitStats(stats) {
        this.server.to('dashboard').emit('stats:update', stats);
    }
};
exports.TrackingGateway = TrackingGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], TrackingGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('subscribe:tracking'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], TrackingGateway.prototype, "handleSubscribe", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('unsubscribe:tracking'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], TrackingGateway.prototype, "handleUnsubscribe", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('subscribe:dashboard'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], TrackingGateway.prototype, "handleDashboard", null);
exports.TrackingGateway = TrackingGateway = TrackingGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        namespace: '/tracking',
        cors: { origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://localhost:8081'], credentials: true },
        transports: ['websocket', 'polling'],
    })
], TrackingGateway);
//# sourceMappingURL=tracking.gateway.js.map