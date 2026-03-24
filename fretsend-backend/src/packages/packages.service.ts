import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Inject, Logger } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE } from '../common/supabase/supabase.module';
import { CreatePackageDto, UpdateStatusDto, PackageQueryDto } from './packages.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailService } from '../notifications/email.service';
import { TrackingGateway } from '../websocket/tracking.gateway';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

const STATUS_TITLES: Record<string,string> = {
  created:'Colis enregistré en agence', processing:'Paiement confirmé — En cours de traitement',
  in_transit:'Départ en transit international', at_customs:'En cours de dédouanement',
  arrived_hub:'Arrivé au hub de destination', dispatched:'Dispatché vers l\'agence de destination',
  available:'Disponible en agence — Retrait possible', delivered:'Colis remis au destinataire', returned:'Retourné à l\'expéditeur',
};

function buildTrackingNumber(country: string): string {
  const now = new Date();
  const d = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`;
  return `FS-${country}-${d}-${Math.floor(Math.random()*99999).toString().padStart(5,'0')}`;
}
function generateRandomPassword(): string {
  return crypto.randomBytes(6).toString('base64').replace(/[+/=]/g,'').substring(0,10);
}

@Injectable()
export class PackagesService {
  private readonly logger = new Logger(PackagesService.name);
  constructor(
    @Inject(SUPABASE) private readonly db: SupabaseClient,
    private readonly notifications: NotificationsService,
    private readonly emailService: EmailService,
    private readonly trackingGateway: TrackingGateway,
  ) {}

  async findAll(query: PackageQueryDto, userId: string, userRole: string, userAgencyId?: string) {
    const { page=1, limit=20, search, status, transport_type, agency_id, date_from, date_to } = query;
    const offset = (page-1)*limit;
    let q = this.db.from('package_details').select('*',{count:'exact'}).order('created_at',{ascending:false}).range(offset, offset+limit-1);
    if (userRole==='client') q = q.eq('sender_id', userId);
    else if (['agent','agency_manager'].includes(userRole)&&userAgencyId) q = q.or(`origin_agency_id.eq.${userAgencyId},destination_agency_id.eq.${userAgencyId},current_agency_id.eq.${userAgencyId}`);
    if (search) q = q.or(`tracking_number.ilike.%${search}%,sender_name.ilike.%${search}%,recipient_name.ilike.%${search}%,sender_phone.ilike.%${search}%,recipient_phone.ilike.%${search}%`);
    if (status) q = q.eq('status', status);
    if (transport_type) q = q.eq('transport_type', transport_type);
    if (agency_id) q = q.or(`origin_agency_id.eq.${agency_id},destination_agency_id.eq.${agency_id},current_agency_id.eq.${agency_id}`);
    if (date_from) q = q.gte('created_at', date_from);
    if (date_to) q = q.lte('created_at', `${date_to}T23:59:59`);
    const { data, count, error } = await q;
    if (error) throw new BadRequestException(error.message);
    return { data: data||[], count: count||0, page, limit, totalPages: Math.ceil((count||0)/limit) };
  }

  async findByTracking(trackingNumber: string) {
    const { data: pkg, error } = await this.db.from('package_details').select('*').eq('tracking_number', trackingNumber.toUpperCase().trim()).single();
    if (error||!pkg) throw new NotFoundException(`Colis "${trackingNumber}" introuvable`);
    const { data: events } = await this.db.from('tracking_events').select('*').eq('package_id', pkg.id).order('created_at',{ascending:false});
    return { ...pkg, tracking_events: events||[] };
  }

  async findById(id: string, userId: string, userRole: string) {
    const { data: pkg, error } = await this.db.from('package_details').select('*').eq('id', id).single();
    if (error||!pkg) throw new NotFoundException('Colis introuvable');
    if (userRole==='client'&&pkg.sender_id!==userId) throw new ForbiddenException('Accès refusé');
    const { data: events } = await this.db.from('tracking_events').select('*').eq('package_id', id).order('created_at',{ascending:false});
    return { ...pkg, tracking_events: events||[] };
  }

  async checkUserByEmail(email: string) {
    const { data } = await this.db.from('profiles').select('id,first_name,last_name').eq('email', email).single();
    if (data) return { found: true, id: data.id, full_name: `${data.first_name} ${data.last_name}` };
    return { found: false };
  }

  async create(dto: CreatePackageDto & { sender_id?: string; recipient_id?: string }, userId: string) {
    const { data: originAgency } = await this.db.from('agencies').select('id,country,is_active,name').eq('id', dto.origin_agency_id).single();
    if (!originAgency?.is_active) throw new BadRequestException('Agence d\'origine invalide ou inactive');
    const { data: destAgency } = await this.db.from('agencies').select('id,country,is_active,name').eq('id', dto.destination_agency_id).single();
    if (!destAgency?.is_active) throw new BadRequestException('Agence de destination invalide ou inactive');
    if (originAgency.country===destAgency.country) throw new BadRequestException('L\'envoi doit être international : France ↔ Cameroun');

    const { data: priceRaw } = await this.db.rpc('calculate_price',{ p_transport:dto.transport_type, p_origin:originAgency.country, p_destination:destAgency.country, p_weight:dto.weight_kg });
    let price = Number(priceRaw)||0;
    if (dto.is_urgent) price *= 1.5;
    if (dto.is_fragile) price += originAgency.country==='FR'?5:500;
    if (dto.is_insured&&dto.declared_value) price += dto.declared_value*0.02;
    price = Math.round(price*100)/100;

    const eta = new Date(); eta.setDate(eta.getDate()+(dto.transport_type==='air'?5:25));
    const trackingNumber = buildTrackingNumber(originAgency.country);

    const { data: newPkg, error } = await this.db.from('packages').insert({
      ...dto, tracking_number:trackingNumber, current_agency_id:dto.origin_agency_id,
      sender_id:dto.sender_id||userId, price, currency:originAgency.country==='FR'?'EUR':'XAF',
      estimated_delivery_date:eta.toISOString().split('T')[0], created_by:userId,
      is_fragile:dto.is_fragile||false, is_insured:dto.is_insured||false, is_urgent:dto.is_urgent||false,
      status:'created', payment_status:'pending',
    }).select().single();
    if (error) throw new BadRequestException(error.message);

    await this.db.from('tracking_events').insert({
      package_id:newPkg.id, status:'created', title:STATUS_TITLES.created,
      description:`Colis enregistré à ${originAgency.name}. Transport ${dto.transport_type==='air'?'aérien':'maritime'}. N° : ${trackingNumber}`,
      agency_id:dto.origin_agency_id, created_by:userId,
    });

    this.handlePostCreation(newPkg, dto).catch(e=>this.logger.warn(`Post-création échouée : ${e.message}`));
    this.logger.log(`Colis créé : ${trackingNumber}`);
    return newPkg;
  }

  private async handlePostCreation(pkg: any, dto: any) {
    const tempPasswords: Array<{email:string;password:string}> = [];

    // Créer compte expéditeur si nouveau
    if (dto.sender_email&&!dto.sender_id) {
      const { data: existing } = await this.db.from('profiles').select('id').eq('email', dto.sender_email).single();
      if (!existing) {
        const pwd = generateRandomPassword();
        const { data } = await this.db.auth.admin.createUser({ email:dto.sender_email, password:pwd, email_confirm:true, user_metadata:{first_name:dto.sender_name.split(' ')[0],last_name:dto.sender_name.split(' ').slice(1).join(' ')||'',role:'client'} });
        if (data?.user) {
          await this.db.from('profiles').update({ first_name:dto.sender_name.split(' ')[0]||'', last_name:dto.sender_name.split(' ').slice(1).join(' ')||'', phone:dto.sender_phone, role:'client' }).eq('id', data.user.id);
          tempPasswords.push({ email:dto.sender_email, password:pwd });
        }
      }
    }
    // Créer compte destinataire si nouveau
    if (dto.recipient_email&&!dto.recipient_id) {
      const { data: existing } = await this.db.from('profiles').select('id').eq('email', dto.recipient_email).single();
      if (!existing) {
        const pwd = generateRandomPassword();
        const { data } = await this.db.auth.admin.createUser({ email:dto.recipient_email, password:pwd, email_confirm:true, user_metadata:{first_name:dto.recipient_name.split(' ')[0],last_name:dto.recipient_name.split(' ').slice(1).join(' ')||'',role:'client'} });
        if (data?.user) {
          await this.db.from('profiles').update({ first_name:dto.recipient_name.split(' ')[0]||'', last_name:dto.recipient_name.split(' ').slice(1).join(' ')||'', phone:dto.recipient_phone, role:'client' }).eq('id', data.user.id);
          tempPasswords.push({ email:dto.recipient_email, password:pwd });
        }
      }
    }

    if (tempPasswords.length) {
      await this.db.from('temp_passwords').insert(tempPasswords.map(tp=>({package_id:pkg.id,email:tp.email,password:tp.password})));
    }

    // Token paiement
    const paymentToken = crypto.randomBytes(32).toString('hex');
    await this.db.from('payment_tokens').insert({ package_id:pkg.id, token:paymentToken, status:'pending', expires_at:new Date(Date.now()+48*3600*1000).toISOString() });

    const { data: fullPkg } = await this.db.from('package_details').select('*').eq('id', pkg.id).single();
    if (fullPkg&&dto.sender_email) await this.emailService.sendPaymentLink(fullPkg, paymentToken);
  }

  async updateStatus(id: string, dto: UpdateStatusDto, userId: string) {
    const { data: pkg } = await this.db.from('packages').select('id,status,tracking_number,recipient_phone,recipient_email,recipient_name,sender_phone,sender_email,sender_name').eq('id', id).single();
    if (!pkg) throw new NotFoundException('Colis introuvable');

    const updates: Record<string,any> = { status:dto.status };
    if (dto.agency_id) updates.current_agency_id = dto.agency_id;
    if (dto.status==='delivered') { updates.delivered_at=new Date().toISOString(); updates.delivered_by=userId; }

    const { error } = await this.db.from('packages').update(updates).eq('id', id);
    if (error) throw new BadRequestException(error.message);

    await this.db.from('tracking_events').insert({
      package_id:id, status:dto.status, title:STATUS_TITLES[dto.status]||dto.status,
      description:dto.note||STATUS_TITLES[dto.status], agency_id:dto.agency_id,
      metadata:dto.latitude?{lat:dto.latitude,lng:dto.longitude}:{}, created_by:userId,
    });

    this.trackingGateway.emitUpdate(pkg.tracking_number, { packageId:id, trackingNumber:pkg.tracking_number, status:dto.status, title:STATUS_TITLES[dto.status], timestamp:new Date().toISOString(), latitude:dto.latitude, longitude:dto.longitude });

    const { data: fullPkg } = await this.db.from('package_details').select('*').eq('id', id).single();
    if (fullPkg) {
      if (dto.status==='available') this.emailService.sendAvailableNotification(fullPkg).catch(e=>this.logger.warn(e.message));
      else if (['in_transit','at_customs','arrived_hub','dispatched','delivered','returned'].includes(dto.status)) this.emailService.sendStatusUpdate(fullPkg, dto.status, STATUS_TITLES[dto.status], dto.note||STATUS_TITLES[dto.status]).catch(e=>this.logger.warn(e.message));
    }

    this.logger.log(`Statut : ${pkg.tracking_number} → ${dto.status}`);
    return { message: 'Statut mis à jour' };
  }

  async getStats(userRole: string, agencyId?: string) {
    let q = this.db.from('packages').select('status,transport_type,created_at,price,currency');
    if (['agent','agency_manager'].includes(userRole)&&agencyId) q = q.or(`origin_agency_id.eq.${agencyId},destination_agency_id.eq.${agencyId},current_agency_id.eq.${agencyId}`);
    const { data } = await q;
    if (!data) return {};
    const today = new Date().toDateString();
    return {
      total:data.length, created_today:data.filter(p=>new Date(p.created_at).toDateString()===today).length,
      by_status:data.reduce((acc,p)=>{acc[p.status]=(acc[p.status]||0)+1;return acc;},{} as Record<string,number>),
      by_transport:data.reduce((acc,p)=>{acc[p.transport_type]=(acc[p.transport_type]||0)+1;return acc;},{} as Record<string,number>),
      revenue_eur:data.filter(p=>p.currency==='EUR').reduce((s,p)=>s+Number(p.price||0),0),
    };
  }
}
