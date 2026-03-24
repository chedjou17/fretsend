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
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_js_1 = require("@supabase/supabase-js");
const supabase_module_1 = require("../common/supabase/supabase.module");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    constructor(db) {
        this.db = db;
        this.logger = new common_1.Logger(NotificationsService_1.name);
    }
    async notifyCreated(pkg) {
        const body = `Colis ${pkg.tracking_number} enregistré. Transport ${pkg.transport_type === 'air' ? 'aérien (3-7j)' : 'maritime (21-30j)'}.`;
        await this.save(pkg.id, pkg.sender_phone, 'sms', 'Colis enregistré — FretSend', body);
        if (pkg.sender_email)
            await this.save(pkg.id, pkg.sender_email, 'email', `Colis ${pkg.tracking_number} enregistré`, body);
    }
    async notifyStatusChange(pkg, status) {
        const map = {
            in_transit: { title: 'En transit — FretSend', body: `Colis ${pkg.tracking_number} parti en transit.`, toRecipient: false },
            arrived_hub: { title: 'Au hub — FretSend', body: `Colis ${pkg.tracking_number} arrivé au hub.`, toRecipient: false },
            available: { title: 'Disponible — FretSend', body: `${pkg.recipient_name}, votre colis ${pkg.tracking_number} est disponible en agence !`, toRecipient: true },
            delivered: { title: 'Livré — FretSend', body: `Colis ${pkg.tracking_number} remis à ${pkg.recipient_name}.`, toRecipient: true },
            returned: { title: 'Retourné — FretSend', body: `Colis ${pkg.tracking_number} retourné à l'expéditeur.`, toRecipient: false },
        };
        const msg = map[status];
        if (!msg)
            return;
        const phone = msg.toRecipient ? pkg.recipient_phone : pkg.sender_phone;
        const email = msg.toRecipient ? pkg.recipient_email : pkg.sender_email;
        if (phone)
            await this.save(pkg.id, phone, 'sms', msg.title, msg.body);
        if (email)
            await this.save(pkg.id, email, 'email', msg.title, msg.body);
        this.logger.log(`Notif ${status}: ${pkg.tracking_number}`);
    }
    async findAll(packageId) {
        let q = this.db.from('notifications').select('*').order('created_at', { ascending: false }).limit(100);
        if (packageId)
            q = q.eq('package_id', packageId);
        const { data } = await q;
        return data || [];
    }
    async save(pkgId, recipient, channel, subject, body) {
        const { error } = await this.db.from('notifications').insert({ package_id: pkgId, recipient, channel, subject, body, status: 'pending' });
        if (error)
            this.logger.warn(`Notif error: ${error.message}`);
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(supabase_module_1.SUPABASE)),
    __metadata("design:paramtypes", [supabase_js_1.SupabaseClient])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map