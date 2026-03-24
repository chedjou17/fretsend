'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { pricingApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
export default function PricingPage() {
  const qc = useQueryClient();
  const { data: rules } = useQuery({ queryKey:['pricing'], queryFn:()=>pricingApi.rules() });
  const [modal, setModal] = useState(false);
  const [form, setForm]   = useState<any>({ transport_type:'air', origin_country:'FR', destination_country:'CM', weight_min_kg:0, weight_max_kg:'', price_per_kg:8, base_price:10, currency:'EUR', is_active:true });
  const [calc, setCalc]   = useState({ transport:'air', from:'FR', to:'CM', weight:2 });
  const [calcResult, setCalcResult] = useState<any>(null);
  const createMut = useMutation({ mutationFn:(d:any)=>pricingApi.createRule(d), onSuccess:()=>{qc.invalidateQueries({queryKey:['pricing']});toast.success('Règle créée!');setModal(false);} });
  async function doCalc() { try { const r:any = await pricingApi.calculate({transport_type:calc.transport,origin_country:calc.from,destination_country:calc.to,weight_kg:calc.weight}); setCalcResult(r); } catch(e:any){toast.error(e.message);} }
  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      <div className="page-header">
        <div><h1 className="page-title">Tarification</h1><p className="page-sub">Grilles tarifaires par corridor</p></div>
        <button onClick={()=>setModal(true)} className="btn-primary btn-sm"><Plus className="w-4 h-4"/>Nouvelle règle</button>
      </div>
      <div className="card p-5">
        <h2 className="font-bold text-gray-800 mb-4">Simulateur de prix</h2>
        <div className="flex flex-wrap gap-3 items-end">
          <div><label className="label">Transport</label><select className="select w-32" value={calc.transport} onChange={e=>setCalc(c=>({...c,transport:e.target.value}))}><option value="air">✈️ Aérien</option><option value="sea">🚢 Maritime</option></select></div>
          <div><label className="label">De</label><select className="select w-28" value={calc.from} onChange={e=>setCalc(c=>({...c,from:e.target.value}))}><option value="FR">🇫🇷 France</option><option value="CM">🇨🇲 Cameroun</option></select></div>
          <div><label className="label">Vers</label><select className="select w-28" value={calc.to} onChange={e=>setCalc(c=>({...c,to:e.target.value}))}><option value="CM">🇨🇲 Cameroun</option><option value="FR">🇫🇷 France</option></select></div>
          <div><label className="label">Poids (kg)</label><input type="number" min="0.1" step="0.1" className="input w-24" value={calc.weight} onChange={e=>setCalc(c=>({...c,weight:parseFloat(e.target.value)}))}/></div>
          <button onClick={doCalc} className="btn-primary btn-sm">Calculer</button>
          {calcResult&&<div className="p-3 bg-blue-50 border border-blue-200 rounded-xl"><p className="text-xs text-[#1C4AA6]">Prix estimé</p><p className="text-2xl font-black text-[#1C4AA6]">{formatPrice(calcResult.price,calcResult.currency)}</p><p className="text-xs text-gray-500">ETA ~{calcResult.eta_days} jours</p></div>}
        </div>
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr>{['Corridor','Transport','Min kg','Max kg','Base','Prix/kg','Devise','Statut'].map(h=><th key={h} className="th">{h}</th>)}</tr></thead>
            <tbody>
              {((rules as any[])||[]).map((r:any)=>(
                <tr key={r.id} className="hover:bg-[#F2F2F2]">
                  <td className="td text-xs font-medium">{r.origin_country} → {r.destination_country}</td>
                  <td className="td">{r.transport_type==='air'?'✈️':'🚢'}</td>
                  <td className="td font-mono text-sm">{r.weight_min_kg}</td>
                  <td className="td font-mono text-sm">{r.weight_max_kg??'∞'}</td>
                  <td className="td font-semibold">{formatPrice(r.base_price,r.currency)}</td>
                  <td className="td font-semibold">{formatPrice(r.price_per_kg,r.currency)}</td>
                  <td className="td"><span className="badge bg-gray-100 text-gray-600">{r.currency}</span></td>
                  <td className="td"><span className={`badge ${r.is_active?'bg-green-100 text-green-700':'bg-gray-100 text-gray-500'}`}>{r.is_active?'Active':'Inactive'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {modal&&(
        <div className="modal-overlay">
          <div className="modal-box p-6 animate-fade-up">
            <h2 className="font-bold text-gray-900 mb-4">Nouvelle règle tarifaire</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Transport</label><select className="select" value={form.transport_type} onChange={e=>setForm((f:any)=>({...f,transport_type:e.target.value}))}><option value="air">✈️ Aérien</option><option value="sea">🚢 Maritime</option></select></div>
                <div><label className="label">Devise</label><select className="select" value={form.currency} onChange={e=>setForm((f:any)=>({...f,currency:e.target.value}))}><option value="EUR">EUR (€)</option><option value="XAF">XAF (FCFA)</option></select></div>
                <div><label className="label">Pays origine</label><select className="select" value={form.origin_country} onChange={e=>setForm((f:any)=>({...f,origin_country:e.target.value}))}><option value="FR">🇫🇷 France</option><option value="CM">🇨🇲 Cameroun</option></select></div>
                <div><label className="label">Pays destination</label><select className="select" value={form.destination_country} onChange={e=>setForm((f:any)=>({...f,destination_country:e.target.value}))}><option value="CM">🇨🇲 Cameroun</option><option value="FR">🇫🇷 France</option></select></div>
                <div><label className="label">Poids min (kg)</label><input type="number" step="0.1" className="input" value={form.weight_min_kg} onChange={e=>setForm((f:any)=>({...f,weight_min_kg:parseFloat(e.target.value)}))}/></div>
                <div><label className="label">Poids max (kg)</label><input type="number" step="0.1" className="input" value={form.weight_max_kg||''} onChange={e=>setForm((f:any)=>({...f,weight_max_kg:e.target.value?parseFloat(e.target.value):null}))} placeholder="∞"/></div>
                <div><label className="label">Prix de base</label><input type="number" step="0.01" className="input" value={form.base_price} onChange={e=>setForm((f:any)=>({...f,base_price:parseFloat(e.target.value)}))}/></div>
                <div><label className="label">Prix par kg</label><input type="number" step="0.01" className="input" value={form.price_per_kg} onChange={e=>setForm((f:any)=>({...f,price_per_kg:parseFloat(e.target.value)}))}/></div>
              </div>
              <div className="flex gap-3"><button onClick={()=>setModal(false)} className="btn-ghost flex-1 justify-center">Annuler</button><button onClick={()=>createMut.mutate(form)} className="btn-primary flex-1 justify-center">{createMut.isPending?<span className="spinner"/>:'Créer'}</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
