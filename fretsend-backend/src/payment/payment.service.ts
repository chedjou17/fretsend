// ═══════════════════════════════════════════════════════════
// PAYMENT SERVICE
// Gère le cycle : token → vérification → action → notifications
// ═══════════════════════════════════════════════════════════
import {
  Injectable, NotFoundException, BadRequestException, Inject, Logger,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE } from '../common/supabase/supabase.module';
import { EmailService } from '../notifications/email.service';
import { TrackingGateway } from '../websocket/tracking.gateway';
import * as crypto from 'crypto';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @Inject(SUPABASE)                  private readonly db: SupabaseClient,
    private readonly emailService:     EmailService,
    private readonly trackingGateway:  TrackingGateway,
  ) {}

  // ── Générer un token de paiement ──────────────────────
  async generatePaymentToken(packageId: string): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(); // 48h

    await this.db.from('payment_tokens').insert({
      package_id: packageId,
      token,
      status:     'pending',
      expires_at: expiresAt,
    });

    return token;
  }

  // ── Vérifier un token ─────────────────────────────────
  async verifyToken(token: string) {
    const { data: pt } = await this.db
      .from('payment_tokens')
      .select('*, package:packages(*, origin_agency:agencies!origin_agency_id(name,city), destination_agency:agencies!destination_agency_id(name,city))')
      .eq('token', token)
      .single();

    if (!pt) throw new NotFoundException('Lien de paiement invalide');
    if (new Date(pt.expires_at) < new Date()) throw new BadRequestException('Lien de paiement expiré');
    if (pt.status !== 'pending') throw new BadRequestException('Ce paiement a déjà été traité');

    const pkg = pt.package;
    return {
      token,
      status:               pt.status,
      tracking_number:      pkg.tracking_number,
      sender_name:          pkg.sender_name,
      recipient_name:       pkg.recipient_name,
      transport_type:       pkg.transport_type,
      weight_kg:            pkg.weight_kg,
      price:                pkg.price,
      currency:             pkg.currency,
      origin_city:          pkg.origin_agency?.city,
      destination_city:     pkg.destination_agency?.city,
      origin_agency_name:   pkg.origin_agency?.name,
      destination_agency_name: pkg.destination_agency?.name,
    };
  }

  // ── Traiter l'action de paiement ──────────────────────
  async processAction(token: string, action: 'paid' | 'unpaid' | 'problem') {
    const { data: pt } = await this.db
      .from('payment_tokens')
      .select('*, package:packages(*)')
      .eq('token', token)
      .single();

    if (!pt) throw new NotFoundException('Token invalide');
    if (pt.status !== 'pending') throw new BadRequestException('Paiement déjà traité');

    const pkg = pt.package;

    // Mettre à jour le token
    await this.db.from('payment_tokens').update({ status: action, processed_at: new Date().toISOString() }).eq('token', token);

    if (action === 'paid') {
      // 1. Marquer le colis en traitement
      await this.db.from('packages').update({ status: 'processing', payment_status: 'paid' }).eq('id', pkg.id);

      // 2. Créer l'événement de tracking
      await this.db.from('tracking_events').insert({
        package_id:  pkg.id,
        status:      'processing',
        title:       'Paiement confirmé — Colis en traitement',
        description: 'Le paiement a été reçu. Votre colis est maintenant en cours de traitement.',
        created_by:  null,
      });

      // 3. Émettre via WebSocket
      this.trackingGateway.emitUpdate(pkg.tracking_number, {
        packageId:      pkg.id,
        trackingNumber: pkg.tracking_number,
        status:         'processing',
        title:          'Paiement confirmé',
        timestamp:      new Date().toISOString(),
      });

      // 4. Récupérer les mots de passe temporaires si créés
      const { data: tempPwds } = await this.db
        .from('temp_passwords')
        .select('*')
        .eq('package_id', pkg.id);

      const senderPwd    = tempPwds?.find(t => t.email === pkg.sender_email)?.password;
      const recipientPwd = tempPwds?.find(t => t.email === pkg.recipient_email)?.password;

      // 5. Récupérer les infos complètes pour les emails
      const { data: fullPkg } = await this.db
        .from('package_details')
        .select('*')
        .eq('id', pkg.id)
        .single();

      // 6. Envoyer les emails de confirmation
      await Promise.allSettled([
        this.emailService.sendSenderConfirmation(fullPkg || pkg, senderPwd),
        this.emailService.sendRecipientNotification(fullPkg || pkg, recipientPwd),
      ]);

      // 7. Nettoyer les mots de passe temporaires
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
      // Notifier l'agence
      await this.db.from('notifications').insert({
        package_id: pkg.id,
        recipient:  'admin@fretsend.com',
        channel:    'email',
        subject:    `Problème de paiement — ${pkg.tracking_number}`,
        body:       `L'expéditeur ${pkg.sender_name} a signalé un problème de paiement pour le colis ${pkg.tracking_number}.`,
        status:     'pending',
      });
      this.logger.log(`Problème paiement signalé : ${pkg.tracking_number}`);
      return { message: 'Problème signalé. Notre équipe vous contactera.', status: 'problem' };
    }
  }
}
