import { Injectable, NotFoundException, ConflictException, BadRequestException, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE } from '../common/supabase/supabase.module';
import { CreateUserDto, UpdateUserDto } from './users.dto';

@Injectable()
export class UsersService {
  constructor(@Inject(SUPABASE) private readonly db: SupabaseClient) {}

  async findAll(search?: string) {
    let q = this.db.from('profiles').select('*, agency:agencies(id, name, city, country)').order('created_at', { ascending: false });
    if (search) q = q.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
    const { data, error } = await q;
    if (error) throw new BadRequestException(error.message);
    return data || [];
  }

  async findById(id: string) {
    const { data, error } = await this.db.from('profiles').select('*, agency:agencies(*)').eq('id', id).single();
    if (error || !data) throw new NotFoundException('Utilisateur introuvable');
    return data;
  }

  async create(dto: CreateUserDto) {
    const { data: existing } = await this.db.from('profiles').select('id').eq('email', dto.email).single();
    if (existing) throw new ConflictException('Email déjà utilisé');

    const { data, error } = await this.db.auth.admin.createUser({
      email: dto.email, password: dto.password, email_confirm: true,
      user_metadata: { first_name: dto.first_name, last_name: dto.last_name, role: dto.role },
    });
    if (error) throw new BadRequestException(error.message);

    await this.db.from('profiles').update({
      first_name: dto.first_name, last_name: dto.last_name,
      phone: dto.phone, role: dto.role, agency_id: dto.agency_id || null,
    }).eq('id', data.user.id);

    return { id: data.user.id, email: data.user.email, role: dto.role };
  }

  async update(id: string, dto: UpdateUserDto) {
    const { data, error } = await this.db.from('profiles').update(dto).eq('id', id).select().single();
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async updateSelf(userId: string, dto: Pick<UpdateUserDto, 'first_name'|'last_name'|'phone'>) {
    const { data, error } = await this.db.from('profiles').update(dto).eq('id', userId).select().single();
    if (error) throw new BadRequestException(error.message);
    return data;
  }
  async checkByEmail(email: string) {
    const { data } = await this.db
      .from('profiles')
      .select('id, first_name, last_name, email')
      .eq('email', email)
      .single();
    if (data) return { found: true, id: data.id, full_name: `${data.first_name} ${data.last_name}`.trim() };
    return { found: false };
  }
}


