import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE } from '../common/supabase/supabase.module';
import { CreateShipmentDto } from './shipments.dto';

@Injectable()
export class ShipmentsService {
  constructor(@Inject(SUPABASE) private readonly db: SupabaseClient) {}

  async findAll() {
    const { data, error } = await this.db.from('shipments')
      .select('*, origin_agency:agencies!origin_agency_id(id,name,city,country), destination_agency:agencies!destination_agency_id(id,name,city,country)')
      .order('created_at', { ascending: false });
    if (error) throw new BadRequestException(error.message);
    return data || [];
  }

  async findById(id: string) {
    const { data, error } = await this.db.from('shipments')
      .select('*, origin_agency:agencies!origin_agency_id(*), destination_agency:agencies!destination_agency_id(*)')
      .eq('id', id).single();
    if (error || !data) throw new NotFoundException('Expédition introuvable');
    const { data: packages } = await this.db.from('package_details').select('*').eq('shipment_id', id);
    return { ...data, packages: packages || [] };
  }

  async create(dto: CreateShipmentDto, userId: string) {
    const d = new Date();
    const ref = `SHP-${dto.transport_type.toUpperCase()}-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}-${Math.floor(Math.random()*9999).toString().padStart(4,'0')}`;
    const { data, error } = await this.db.from('shipments').insert({ ...dto, reference: ref, created_by: userId }).select().single();
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async updateStatus(id: string, status: string) {
    const updates: any = { status };
    if (status === 'arrived') updates.actual_arrival_date = new Date().toISOString().split('T')[0];
    if (status === 'in_transit') {
      const { data: pkgs } = await this.db.from('packages').select('id').eq('shipment_id', id);
      for (const pkg of pkgs || []) {
        await this.db.from('packages').update({ status: 'in_transit' }).eq('id', pkg.id);
        await this.db.from('tracking_events').insert({ package_id: pkg.id, status: 'in_transit', title: 'Départ en transit international', description: 'Colis embarqué dans l\'expédition groupée' });
      }
    }
    const { data, error } = await this.db.from('shipments').update(updates).eq('id', id).select().single();
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async addPackage(shipmentId: string, packageId: string) {
    const { data: pkg } = await this.db.from('packages').select('weight_kg').eq('id', packageId).single();
    if (!pkg) throw new NotFoundException('Colis introuvable');
    await this.db.from('packages').update({ shipment_id: shipmentId, status: 'processing' }).eq('id', packageId);
    await this.db.from('tracking_events').insert({ package_id: packageId, status: 'processing', title: 'Colis ajouté à une expédition', description: `Colis inclus dans l'expédition` });
    const { data: s } = await this.db.from('shipments').select('total_packages, total_weight_kg').eq('id', shipmentId).single();
    if (s) await this.db.from('shipments').update({ total_packages: (s.total_packages||0)+1, total_weight_kg: (Number(s.total_weight_kg)||0)+Number(pkg.weight_kg) }).eq('id', shipmentId);
    return { message: 'Colis ajouté à l\'expédition' };
  }
}
