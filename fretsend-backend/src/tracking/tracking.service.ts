import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE } from '../common/supabase/supabase.module';

@Injectable()
export class TrackingService {
  constructor(@Inject(SUPABASE) private readonly db: SupabaseClient) {}

  async getEvents(packageId: string) {
    const { data, error } = await this.db.from('tracking_events').select('*')
      .eq('package_id', packageId).order('created_at', { ascending: false });
    if (error) throw new BadRequestException(error.message);
    return data || [];
  }

  async getGlobalStats() {
    const { data, error } = await this.db.from('global_stats').select('*').single();
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async getMonthlyStats() {
    const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString();
    const { data, error } = await this.db.from('packages')
      .select('created_at, status, price, currency').gte('created_at', yearStart);
    if (error) throw new BadRequestException(error.message);
    if (!data) return [];
    const months = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
    const grouped: Record<string, any> = {};
    data.forEach(p => {
      const k = months[new Date(p.created_at).getMonth()];
      if (!grouped[k]) grouped[k] = { month: k, total: 0, delivered: 0, revenue: 0 };
      grouped[k].total++;
      if (p.status === 'delivered') grouped[k].delivered++;
      if (p.price) grouped[k].revenue += Number(p.price);
    });
    return Object.values(grouped);
  }

  async getAgencyStats() {
    const { data, error } = await this.db.from('packages').select('origin_agency_id, status, origin_agency_name, origin_city');
    if (error) throw new BadRequestException(error.message);
    if (!data) return [];
    const map: Record<string, any> = {};
    (data as any[]).forEach(p => {
      const k = p.origin_agency_id;
      if (!map[k]) map[k] = { name: p.origin_agency_name || k, city: p.origin_city || '', total: 0, delivered: 0 };
      map[k].total++;
      if (p.status === 'delivered') map[k].delivered++;
    });
    return Object.values(map).sort((a, b) => b.total - a.total).slice(0, 10);
  }
}
