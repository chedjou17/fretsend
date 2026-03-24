import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE } from '../common/supabase/supabase.module';
import { CreateAgencyDto } from './agencies.dto';

@Injectable()
export class AgenciesService {
  constructor(@Inject(SUPABASE) private readonly db: SupabaseClient) {}

  async findAll(country?: string) {
    let q = this.db.from('agencies')
      .select('*, manager:profiles!manager_id(id, first_name, last_name, email)')
      .order('country').order('name');
    if (country) q = q.eq('country', country);
    const { data, error } = await q;
    if (error) throw new BadRequestException(error.message);
    return data || [];
  }

  async findById(id: string) {
    const { data, error } = await this.db.from('agencies')
      .select('*, manager:profiles!manager_id(*)').eq('id', id).single();
    if (error || !data) throw new NotFoundException('Agence introuvable');
    return data;
  }

  async create(dto: CreateAgencyDto) {
    const { data, error } = await this.db.from('agencies').insert(dto).select().single();
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async update(id: string, dto: Partial<CreateAgencyDto>) {
    const { data, error } = await this.db.from('agencies').update(dto).eq('id', id).select().single();
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async toggleActive(id: string) {
    const { data: ag } = await this.db.from('agencies').select('is_active').eq('id', id).single();
    if (!ag) throw new NotFoundException('Agence introuvable');
    const { data, error } = await this.db.from('agencies')
      .update({ is_active: !ag.is_active }).eq('id', id).select().single();
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async getStats(id: string) {
    const { data } = await this.db.from('packages').select('status, created_at')
      .or(`origin_agency_id.eq.${id},destination_agency_id.eq.${id},current_agency_id.eq.${id}`);
    if (!data) return {};
    const today = new Date().toDateString();
    return {
      total: data.length,
      today: data.filter(p => new Date(p.created_at).toDateString() === today).length,
      by_status: data.reduce((acc, p) => { acc[p.status] = (acc[p.status]||0)+1; return acc; }, {} as Record<string,number>),
    };
  }
}
