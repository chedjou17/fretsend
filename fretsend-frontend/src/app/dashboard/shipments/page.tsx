'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Plus, Ship } from 'lucide-react';
import { shipApi, agencyApi } from '@/lib/api';
import { useAuth } from '@/store/auth.store';
import { SHIP_LABEL, fmtDate } from '@/lib/utils';
import { toast } from 'sonner';
export default function ShipmentsPage() {
  const { isRole } = useAuth(); const qc = useQueryClient();
  const { data: shipments, isLoading } = useQuery({ queryKey:['shipments'], queryFn:()=>shipApi.list() });
  const { data: agencies }             = useQuery({ queryKey:['agencies'],  queryFn:()=>agencyApi.list() });
  const [modal, setModal] = useState(false);
  const [form, setForm]   = useState({ transport_type:'sea', origin_agency_id:'', destination_agency_id:'', departure_date:'', estimated_arrival_date:'' });
  const createMut = useMutation({ mutationFn:(d:any)=>shipApi.create(d), onSuccess:()=>{qc.invalidateQueries({queryKey:['shipments']});toast.success('Expédition créée!');setModal(false);} });
  const statusMut = useMutation({ mutationFn:({id,s}:{id:string;s:string})=>shipApi.updateStatus(id,s), onSuccess:()=>qc.invalidateQueries({queryKey:['shipments']}) });
  const NEXT: Record<string,string> = {preparing:'departed',departed:'in_transit',in_transit:'arrived',arrived:'closed'};
  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <div className="page-header">
        <div><h1 className="page-title">Expéditions</h1><p className="page-sub">{(shipments as any[])?.length||0} expéditions</p></div>
        {isRole('admin','agency_manager')&&<button onClick={()=>setModal(true)} className="btn-primary btn-sm"><Plus className="w-4 h-4"/>Nouvelle</button>}
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr>{['Référence','Transport','Origine','Destination','Départ','ETA','Colis','Statut',''].map(h=><th key={h} className="th">{h}</th>)}</tr></thead>
            <tbody>
              {isLoading?<tr><td colSpan={9} className="td py-12 text-center"><div className="w-8 h-8 border-4 border-[#1C4AA6] border-t-transparent rounded-full animate-spin mx-auto"/></td></tr>
              :((shipments as any[])||[]).map((s:any)=>(
                <tr key={s.id} className="hover:bg-[#F2F2F2]">
                  <td className="td"><Link href={`/dashboard/shipments/${s.id}`} className="font-mono text-xs text-[#1C4AA6] hover:underline font-bold">{s.reference}</Link></td>
                  <td className="td text-lg">{s.transport_type==='air'?'✈️':'🚢'}</td>
                  <td className="td text-xs"><p className="font-semibold">{s.origin_agency?.name}</p><p className="text-gray-400">{s.origin_agency?.city}</p></td>
                  <td className="td text-xs"><p className="font-semibold">{s.destination_agency?.name}</p><p className="text-gray-400">{s.destination_agency?.city}</p></td>
                  <td className="td text-xs text-gray-500">{fmtDate(s.departure_date)}</td>
                  <td className="td text-xs text-gray-500">{fmtDate(s.estimated_arrival_date)}</td>
                  <td className="td text-sm font-bold">{s.total_packages}</td>
                  <td className="td"><span className="badge bg-gray-100 text-gray-600">{SHIP_LABEL[s.status]||s.status}</span></td>
                  <td className="td">{NEXT[s.status]&&isRole('admin','agency_manager')&&<button onClick={()=>statusMut.mutate({id:s.id,s:NEXT[s.status]})} className="text-xs text-[#1C4AA6] hover:underline font-semibold">→ {SHIP_LABEL[NEXT[s.status]]}</button>}</td>
                </tr>
              ))}
              {!isLoading&&!(shipments as any[])?.length&&<tr><td colSpan={9} className="td py-12 text-center text-gray-400"><Ship className="w-10 h-10 mx-auto mb-2 opacity-30"/>Aucune expédition</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      {modal&&(
        <div className="modal-overlay">
          <div className="modal-box p-6 animate-fade-up">
            <h2 className="font-bold text-gray-900 mb-4">Nouvelle expédition</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">{(['sea','air'] as const).map(t=><button key={t} type="button" onClick={()=>setForm(f=>({...f,transport_type:t}))} className={`p-3 border-2 rounded-xl text-center transition-all ${form.transport_type===t?'border-[#1C4AA6] bg-blue-50':'border-gray-200'}`}><div className="text-2xl">{t==='air'?'✈️':'🚢'}</div><div className="text-xs font-bold mt-1">{t==='air'?'Aérien':'Maritime'}</div></button>)}</div>
              <div><label className="label">Agence expéditrice *</label><select className="select" value={form.origin_agency_id} onChange={e=>setForm(f=>({...f,origin_agency_id:e.target.value}))}><option value="">Sélectionner</option>{((agencies as any[])||[]).map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
              <div><label className="label">Agence destinataire *</label><select className="select" value={form.destination_agency_id} onChange={e=>setForm(f=>({...f,destination_agency_id:e.target.value}))}><option value="">Sélectionner</option>{((agencies as any[])||[]).map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Départ</label><input type="date" className="input" onChange={e=>setForm(f=>({...f,departure_date:e.target.value}))}/></div>
                <div><label className="label">ETA</label><input type="date" className="input" onChange={e=>setForm(f=>({...f,estimated_arrival_date:e.target.value}))}/></div>
              </div>
              <div className="flex gap-3"><button onClick={()=>setModal(false)} className="btn-ghost flex-1 justify-center">Annuler</button><button onClick={()=>createMut.mutate(form)} disabled={!form.origin_agency_id||!form.destination_agency_id} className="btn-primary flex-1 justify-center">{createMut.isPending?<span className="spinner"/>:'Créer'}</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
