'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { authApi } from '@/lib/api';

export interface Profile {
  id: string; email: string; first_name: string; last_name: string;
  role: 'admin'|'agency_manager'|'agent'|'client';
  agency_id?: string; phone?: string;
  agency?: { id:string; name:string; city:string; country:string };
}
interface AuthCtx {
  profile: Profile|null; loading: boolean;
  login: (email:string, password:string) => Promise<void>;
  logout: () => Promise<void>;
  isRole: (...r:string[]) => boolean;
  isStaff: boolean;
}

const Ctx = createContext<AuthCtx|undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile|null>(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const token = Cookies.get('fs_access') || localStorage.getItem('fs_access');
  if (token) {
    authApi.me()
      .then((d: any) => setProfile(d))
      .catch((err) => {
         // L'intercepteur Axios gère déjà le cas 401 et la redirection.
         console.error('Erreur de récupération du profil:', err);
      })
      .finally(() => setLoading(false));
  } else setLoading(false);
}, []);
  function clear() {
    Cookies.remove('fs_access'); Cookies.remove('fs_refresh');
    localStorage.removeItem('fs_access'); localStorage.removeItem('fs_refresh');
    setProfile(null);
  }

  async function login(email: string, password: string) {
    const d: any = await authApi.login({ email, password });
    const { access_token, refresh_token, profile: p } = d;
    Cookies.set('fs_access',  access_token,  { expires: 1/96, sameSite:'lax' });
    Cookies.set('fs_refresh', refresh_token, { expires: 7,    sameSite:'lax' });
    localStorage.setItem('fs_access',  access_token);
    localStorage.setItem('fs_refresh', refresh_token);
    setProfile(p);
    console.log(d)
  }

  async function logout() { try { await authApi.logout(); } catch {} clear(); }
  const isRole = (...r: string[]) => !!profile && r.includes(profile.role);
  const isStaff = isRole('admin','agency_manager','agent');

  return <Ctx.Provider value={{ profile, loading, login, logout, isRole, isStaff }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useAuth outside AuthProvider');
  return c;
}
