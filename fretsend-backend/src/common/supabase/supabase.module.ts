import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Token d'injection pour le client Supabase admin (service role)
export const SUPABASE = 'SUPABASE';

@Global() // Disponible dans tous les modules sans ré-import
@Module({
  providers: [
    {
      provide: SUPABASE,
      inject: [ConfigService],
      useFactory: (config: ConfigService): SupabaseClient => {
        const url    = config.get<string>('SUPABASE_URL');
        const secret = config.get<string>('SUPABASE_SERVICE_ROLE_KEY');

        if (!url || !secret) {
          throw new Error('SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis dans .env');
        }

        return createClient(url, secret, {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        });
      },
    },
  ],
  exports: [SUPABASE],
})
export class SupabaseModule {}
