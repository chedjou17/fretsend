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
var PaymentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const supabase_js_1 = require("@supabase/supabase-js");
const supabase_module_1 = require("../common/supabase/supabase.module");
const email_service_1 = require("../notifications/email.service");
const tracking_gateway_1 = require("../websocket/tracking.gateway");
const crypto = require("crypto");
let PaymentService = PaymentService_1 = class PaymentService {
    constructor(db, emailService, trackingGateway) {
        this.db = db;
        this.emailService = emailService;
        this.trackingGateway = trackingGateway;
        this.logger = new common_1.Logger(PaymentService_1.name);
    }
    async generatePaymentToken(packageId) {
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
        await this.db.from('payment_tokens').insert({
            package_id: packageId,
            token,
            status: 'pending',
            expires_at: expiresAt,
        });
        return token;
    }
    async verifyToken(token) {
        const { data: pt } = await this.db
            .from('payment_tokens')
            .select('*, package:packages(*, origin_agency:agencies!origin_agency_id(name,city), destination_agency:agencies!destination_agency_id(name,city))')
            .eq('token', token)
            .single();
        if (!pt)
            throw new common_1.NotFoundException('Lien de paiement invalide');
        if (new Date(pt.expires_at) < new Date())
            throw new common_1.BadRequestException('Lien de paiement expiré');
        if (pt.status !== 'pending')
            throw new common_1.BadRequestException('Ce paiement a déjà été traité');
        const pkg = pt.package;
        return {
            token,
            status: pt.status,
            tracking_number: pkg.tracking_number,
            sender_name: pkg.sender_name,
            recipient_name: pkg.recipient_name,
            transport_type: pkg.transport_type,
            weight_kg: pkg.weight_kg,
            price: pkg.price,
            currency: pkg.currency,
            origin_city: pkg.origin_agency?.city,
            destination_city: pkg.destination_agency?.city,
            origin_agency_name: pkg.origin_agency?.name,
            destination_agency_name: pkg.destination_agency?.name,
        };
    }
    async processAction(token, action) {
        const { data: pt } = await this.db
            .from('payment_tokens')
            .select('*, package:packages(*)')
            .eq('token', token)
            .single();
        if (!pt)
            throw new common_1.NotFoundException('Token invalide');
        if (pt.status !== 'pending')
            throw new common_1.BadRequestException('Paiement déjà traité');
        const pkg = pt.package;
        await this.db.from('payment_tokens').update({ status: action, processed_at: new Date().toISOString() }).eq('token', token);
        if (action === 'paid') {
            await this.db.from('packages').update({ status: 'processing', payment_status: 'paid' }).eq('id', pkg.id);
            await this.db.from('tracking_events').insert({
                package_id: pkg.id,
                status: 'processing',
                title: 'Paiement confirmé — Colis en traitement',
                description: 'Le paiement a été reçu. Votre colis est maintenant en cours de traitement.',
                created_by: null,
            });
            this.trackingGateway.emitUpdate(pkg.tracking_number, {
                packageId: pkg.id,
                trackingNumber: pkg.tracking_number,
                status: 'processing',
                title: 'Paiement confirmé',
                timestamp: new Date().toISOString(),
            });
            const { data: tempPwds } = await this.db
                .from('temp_passwords')
                .select('*')
                .eq('package_id', pkg.id);
            const senderPwd = tempPwds?.find(t => t.email === pkg.sender_email)?.password;
            const recipientPwd = tempPwds?.find(t => t.email === pkg.recipient_email)?.password;
            const { data: fullPkg } = await this.db
                .from('package_details')
                .select('*')
                .eq('id', pkg.id)
                .single();
            await Promise.allSettled([
                this.emailService.sendSenderConfirmation(fullPkg || pkg, senderPwd),
                this.emailService.sendRecipientNotification(fullPkg || pkg, recipientPwd),
            ]);
            if (tempPwds?.length) {
                await this.db.from('temp_passwords').delete().eq('package_id', pkg.id);
            }
            this.logger.log(`Paiement confirmé : ${pkg.tracking_number}`);
            return { message: 'Paiement confirmé. Emails de confirmation envoyés.', status: 'paid' };
        }
        if (action === 'unpaid') {
            await this.db.from('packages').update({ payment_status: 'unpaid' }).eq('id', pkg.id);
            this.logger.log(`Paiement annulé : ${pkg.tracking_number}`);
            return { message: 'Transaction annulée. Contactez votre agence.', status: 'unpaid' };
        }
        if (action === 'problem') {
            await this.db.from('packages').update({ payment_status: 'problem' }).eq('id', pkg.id);
            await this.db.from('notifications').insert({
                package_id: pkg.id,
                recipient: 'admin@fretsend.com',
                channel: 'email',
                subject: `Problème de paiement — ${pkg.tracking_number}`,
                body: `L'expéditeur ${pkg.sender_name} a signalé un problème de paiement pour le colis ${pkg.tracking_number}.`,
                status: 'pending',
            });
            this.logger.log(`Problème paiement signalé : ${pkg.tracking_number}`);
            return { message: 'Problème signalé. Notre équipe vous contactera.', status: 'problem' };
        }
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = PaymentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(supabase_module_1.SUPABASE)),
    __metadata("design:paramtypes", [supabase_js_1.SupabaseClient,
        email_service_1.EmailService,
        tracking_gateway_1.TrackingGateway])
], PaymentService);
//# sourceMappingURL=payment.service.js.map