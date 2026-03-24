import { Injectable, Logger, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE } from '../common/supabase/supabase.module';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  constructor(@Inject(SUPABASE) private readonly db: SupabaseClient) {}

  async notifyCreated(pkg: any) {
    const body = `Colis ${pkg.tracking_number} enregistré. Transport ${pkg.transport_type === 'air' ? 'aérien (3-7j)' : 'maritime (21-30j)'}.`;
    await this.save(pkg.id, pkg.sender_phone, 'sms', 'Colis enregistré — FretSend', body);
    if (pkg.sender_email) await this.save(pkg.id, pkg.sender_email, 'email', `Colis ${pkg.tracking_number} enregistré`, body);
  }

  async notifyStatusChange(pkg: any, status: string) {
    const map: Record<string, { title: string; body: string; toRecipient: boolean }> = {
      in_transit:  { title: 'En transit — FretSend',  body: `Colis ${pkg.tracking_number} parti en transit.`, toRecipient: false },
      arrived_hub: { title: 'Au hub — FretSend',       body: `Colis ${pkg.tracking_number} arrivé au hub.`, toRecipient: false },
      available:   { title: 'Disponible — FretSend',   body: `${pkg.recipient_name}, votre colis ${pkg.tracking_number} est disponible en agence !`, toRecipient: true },
      delivered:   { title: 'Livré — FretSend',        body: `Colis ${pkg.tracking_number} remis à ${pkg.recipient_name}.`, toRecipient: true },
      returned:    { title: 'Retourné — FretSend',     body: `Colis ${pkg.tracking_number} retourné à l'expéditeur.`, toRecipient: false },
    };
    const msg = map[status];
    if (!msg) return;
    const phone = msg.toRecipient ? pkg.recipient_phone : pkg.sender_phone;
    const email = msg.toRecipient ? pkg.recipient_email : pkg.sender_email;
    if (phone) await this.save(pkg.id, phone, 'sms', msg.title, msg.body);
    if (email) await this.save(pkg.id, email, 'email', msg.title, msg.body);
    this.logger.log(`Notif ${status}: ${pkg.tracking_number}`);
  }

  async findAll(packageId?: string) {
    let q = this.db.from('notifications').select('*').order('created_at', { ascending: false }).limit(100);
    if (packageId) q = q.eq('package_id', packageId);
    const { data } = await q;
    return data || [];
  }

  private async save(pkgId: string, recipient: string, channel: string, subject: string, body: string) {
    const { error } = await this.db.from('notifications').insert({ package_id: pkgId, recipient, channel, subject, body, status: 'pending' });
    if (error) this.logger.warn(`Notif error: ${error.message}`);
  }
}
