'use client';
// ── AGENCIES PAGE ─────────────────────────────────────────
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Building2, MapPin, Phone, Edit, Power } from 'lucide-react';
import { agencyApi, usersApi } from '@/lib/api';
import { useAuth } from '@/store/auth.store';
import { toast } from 'sonner';

export default function AgenciesPage() {
  const { isRole } = useAuth();
  const qc = useQueryClient();
  const { data: agencies, isLoading } = useQuery({ queryKey:['agencies'], queryFn:()=>agencyApi.list() });
  const { data: users }               = useQuery({ queryKey:['users'],    queryFn:()=>usersApi.list() });
  const [filter, setFilter] = useState<'all'|'FR'|'CM'>('all');
  const [modal, setModal]   = useState(false);
  const [editId, setEditId] = useState<string|null>(null);
  const [form, setForm]     = useState({ name:'', country:'FR', city:'', address:'', phone:'', email:'', is_hub:false, manager_id:'' });

  const createMut = useMutation({ mutationFn:(d:any)=>agencyApi.create(d),        onSuccess:()=>{ qc.invalidateQueries({queryKey:['agencies']}); toast.success('Agence créée !');        setModal(false); } });
  const updateMut = useMutation({ mutationFn:({id,d}:{id:string;d:any})=>agencyApi.update(id,d), onSuccess:()=>{ qc.invalidateQueries({queryKey:['agencies']}); toast.success('Mise à jour !'); setModal(false); setEditId(null); } });
  const toggleMut = useMutation({ mutationFn:(id:string)=>agencyApi.toggle(id),   onSuccess:()=>qc.invalidateQueries({queryKey:['agencies']}) });

  const filtered  = ((agencies as any[])||[]).filter(a => filter==='all'||a.country===filter);
  const managers  = ((users as any[])||[]).filter(u=>['admin','agency_manager'].includes(u.role));

  function startEdit(ag: any) { setEditId(ag.id); setForm({ name:ag.name, country:ag.country, city:ag.city, address:ag.address, phone:ag.phone||'', email:ag.email||'', is_hub:ag.is_hub, manager_id:ag.manager_id||'' }); setModal(true); }

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <div className="page-header">
        <div><h1 className="page-title">Agences</h1><p className="page-sub">{(agencies as any[])?.length||0} agences</p></div>
        {isRole('admin') && (
          <button onClick={()=>{setModal(true);setEditId(null);setForm({name:'',country:'FR',city:'',address:'',phone:'',email:'',is_hub:false,manager_id:''})}} className="btn-primary btn-sm">
            <Plus className="w-4 h-4"/>Nouvelle agence
          </button>
        )}
      </div>

      <div className="flex gap-2">
        {(['all','FR','CM'] as const).map(f=>(
          <button key={f} onClick={()=>setFilter(f)} className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${filter===f?'bg-[#1C4AA6] text-white border-[#1C4AA6]':'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}>
            {f==='all'?'🌍 Toutes':f==='FR'?'🇫🇷 France':'🇨🇲 Cameroun'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-[#1C4AA6] border-t-transparent rounded-full animate-spin"/></div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((ag: any)=>(
            <div key={ag.id} className={`card p-5 hover:shadow-hover transition-all ${!ag.is_active?'opacity-60':''}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white" style={{background:'#1C4AA6'}}>
                    <Building2 className="w-5 h-5"/>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{ag.name}</p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-400">{ag.country==='FR'?'🇫🇷':'🇨🇲'} {ag.city}</span>
                      {ag.is_hub&&<span className="badge bg-blue-100 text-[#1C4AA6] text-[10px]">HUB</span>}
                    </div>
                  </div>
                </div>
                <div className={`w-2.5 h-2.5 rounded-full mt-1 ${ag.is_active?'bg-green-400':'bg-gray-300'}`}/>
              </div>
              <div className="space-y-1.5 text-xs text-gray-500">
                <div className="flex items-start gap-1.5"><MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"/><span>{ag.address}</span></div>
                {ag.phone&&<div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5"/><span>{ag.phone}</span></div>}
              </div>
              {ag.manager&&(
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{background:'#1C4AA6'}}>
                    {ag.manager.first_name?.[0]}{ag.manager.last_name?.[0]}
                  </div>
                  <span className="text-xs text-gray-500">{ag.manager.first_name} {ag.manager.last_name}</span>
                </div>
              )}
              {isRole('admin')&&(
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                  <button onClick={()=>startEdit(ag)} className="btn-ghost btn-sm flex-1 justify-center"><Edit className="w-3.5 h-3.5"/>Modifier</button>
                  <button onClick={()=>toggleMut.mutate(ag.id)} className="btn-ghost btn-sm px-3"><Power className="w-3.5 h-3.5"/></button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {modal&&(
        <div className="modal-overlay">
          <div className="modal-box p-6 animate-fade-up max-h-[85vh] overflow-y-auto">
            <h2 className="font-bold text-gray-900 mb-4">{editId?'Modifier':'Nouvelle'} agence</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><label className="label">Nom *</label><input className="input" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/></div>
                <div><label className="label">Pays *</label><select className="select" value={form.country} onChange={e=>setForm(f=>({...f,country:e.target.value}))}><option value="FR">🇫🇷 France</option><option value="CM">🇨🇲 Cameroun</option></select></div>
                <div><label className="label">Ville *</label><input className="input" value={form.city} onChange={e=>setForm(f=>({...f,city:e.target.value}))}/></div>
                <div className="col-span-2"><label className="label">Adresse *</label><input className="input" value={form.address} onChange={e=>setForm(f=>({...f,address:e.target.value}))}/></div>
                <div><label className="label">Téléphone</label><input className="input" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))}/></div>
                <div><label className="label">Email</label><input type="email" className="input" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/></div>
                <div className="col-span-2"><label className="label">Responsable</label>
                  <select className="select" value={form.manager_id} onChange={e=>setForm(f=>({...f,manager_id:e.target.value}))}>
                    <option value="">Aucun</option>
                    {managers.map((m:any)=><option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>)}
                  </select>
                </div>
                <div className="col-span-2"><label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-[#F2F2F2]">
                  <input type="checkbox" checked={form.is_hub} onChange={e=>setForm(f=>({...f,is_hub:e.target.checked}))} className="w-4 h-4 text-[#1C4AA6] rounded"/>
                  <span className="text-sm font-medium">Agence HUB (centre de transit)</span>
                </label></div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={()=>{setModal(false);setEditId(null)}} className="btn-ghost flex-1 justify-center">Annuler</button>
                <button onClick={()=>editId?updateMut.mutate({id:editId,d:form}):createMut.mutate(form)} disabled={!form.name||!form.city||!form.address} className="btn-primary flex-1 justify-center">
                  {(createMut.isPending||updateMut.isPending)?<span className="spinner"/>:(editId?'Mettre à jour':'Créer')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
