'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Shield, History } from 'lucide-react';
import { usersApi, agencyApi } from '@/lib/api';
import { useAuth } from '@/store/auth.store';
import { ROLE_LABEL, fmtDateTime } from '@/lib/utils';
import { toast } from 'sonner';

const ROLE_COLORS: Record<string, string> = {
  admin:          'bg-red-100 text-red-700',
  agency_manager: 'bg-purple-100 text-purple-700',
  agent:          'bg-[#1C4AA6]/10 text-[#1C4AA6]',
  client:         'bg-gray-100 text-gray-600',
};

export default function UsersPage() {
  const { profile, isRole } = useAuth();
  const qc = useQueryClient();

  const { data: users, isLoading } = useQuery({ queryKey:['users'], queryFn:()=>usersApi.list() });
  const { data: agencies }         = useQuery({ queryKey:['agencies'], queryFn:()=>agencyApi.list() });

  const [search, setSearch] = useState('');
  const [modal, setModal]   = useState(false);
  const [form, setForm]     = useState({ email:'', password:'', first_name:'', last_name:'', phone:'', role:'agent', agency_id:'' });

  const isAdminUser = isRole('admin');
  const isManager   = profile?.role === 'agency_manager';

  const createMut = useMutation({
    mutationFn: (d: any) => usersApi.create(d),
    onSuccess:  () => { qc.invalidateQueries({queryKey:['users']}); toast.success('Utilisateur créé !'); setModal(false); setForm({email:'',password:'',first_name:'',last_name:'',phone:'',role:'agent',agency_id:''}); },
    onError:    (e: any) => toast.error(e.message),
  });
  const updateMut = useMutation({
    mutationFn: ({id,d}:{id:string;d:any}) => usersApi.update(id, d),
    onSuccess:  () => { qc.invalidateQueries({queryKey:['users']}); toast.success('Mis à jour'); },
  });

  // Filter: chef d'agence ne voit que les agents de son agence
  const filtered = ((users as any[])||[]).filter(u => {
    const matchSearch = `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(search.toLowerCase());
    if (isManager) return matchSearch && u.agency_id === profile?.agency_id && u.role === 'agent';
    return matchSearch;
  });

  // Roles available for creation based on current user role
  const creatableRoles = isAdminUser
    ? ['admin','agency_manager','agent','client']
    : ['agent'];

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div className="page-header">
        <div>
          <h1 className="page-title">{isManager ? 'Mes agents' : 'Utilisateurs'}</h1>
          <p className="page-sub">{filtered.length} utilisateur(s)</p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary btn-sm">
          <Plus className="w-4 h-4" />{isManager ? 'Ajouter un agent' : 'Nouvel utilisateur'}
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input className="input pl-10" placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>{['Utilisateur','Rôle','Agence','Téléphone','Statut','Créé le','Actions'].map(h => <th key={h} className="th">{h}</th>)}</tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="td py-12 text-center">
                  <div className="w-8 h-8 border-4 border-[#1C4AA6] border-t-transparent rounded-full animate-spin mx-auto" />
                </td></tr>
              ) : filtered.map((u: any) => (
                <tr key={u.id} className="hover:bg-[#F2F2F2] transition-colors">
                  <td className="td">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background:'#1C4AA6' }}>
                        {u.first_name?.[0]}{u.last_name?.[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{u.first_name} {u.last_name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="td">
                    <span className={`badge ${ROLE_COLORS[u.role]}`}>
                      <Shield className="w-3 h-3" />{ROLE_LABEL[u.role]}
                    </span>
                  </td>
                  <td className="td text-xs">
                    {u.agency ? (
                      <div><p className="font-medium text-gray-700">{u.agency.name}</p><p className="text-gray-400">{u.agency.city}</p></div>
                    ) : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="td text-xs text-gray-500">{u.phone || '—'}</td>
                  <td className="td">
                    <span className={`badge ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {u.is_active ? '● Actif' : '○ Inactif'}
                    </span>
                  </td>
                  <td className="td text-xs text-gray-400">{fmtDateTime(u.created_at)}</td>
                  <td className="td">
                    <div className="flex gap-1">
                      <button
                        onClick={() => updateMut.mutate({ id:u.id, d:{ is_active:!u.is_active } })}
                        className={`text-xs font-semibold px-2 py-1 rounded-lg transition-colors ${u.is_active ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}>
                        {u.is_active ? 'Désactiver' : 'Activer'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && !filtered.length && (
                <tr><td colSpan={7} className="td text-center py-12 text-gray-400">Aucun utilisateur trouvé</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create modal */}
      {modal && (
        <div className="modal-overlay">
          <div className="modal-box p-6 animate-fade-up">
            <h2 className="font-bold text-gray-900 mb-4">
              {isManager ? 'Ajouter un agent' : 'Nouvel utilisateur'}
            </h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Prénom *</label><input className="input" value={form.first_name} onChange={e=>setForm(f=>({...f,first_name:e.target.value}))} /></div>
                <div><label className="label">Nom *</label><input className="input" value={form.last_name} onChange={e=>setForm(f=>({...f,last_name:e.target.value}))} /></div>
              </div>
              <div><label className="label">Email *</label><input type="email" className="input" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} /></div>
              <div><label className="label">Mot de passe *</label><input type="password" className="input" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} placeholder="Min. 8 caractères" /></div>
              <div><label className="label">Téléphone</label><input className="input" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} /></div>
              {isAdminUser && (
                <div><label className="label">Rôle *</label>
                  <select className="select" value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))}>
                    {creatableRoles.map(r => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
                  </select>
                </div>
              )}
              {(['admin','agency_manager','agent'].includes(form.role)) && (
                <div><label className="label">Agence</label>
                  <select className="select" value={form.agency_id} onChange={e=>setForm(f=>({...f,agency_id:e.target.value}))}>
                    <option value="">Aucune</option>
                    {(agencies as any[])?.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button onClick={()=>setModal(false)} className="btn-ghost flex-1 justify-center">Annuler</button>
                <button
                  onClick={() => createMut.mutate({ ...form, agency_id: isManager ? profile?.agency_id : form.agency_id, role: isManager ? 'agent' : form.role })}
                  disabled={!form.email||!form.password||!form.first_name||createMut.isPending}
                  className="btn-primary flex-1 justify-center">
                  {createMut.isPending ? <span className="spinner"/> : 'Créer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
