'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Search, UserCheck, UserX, Calculator, Package, ChevronRight } from 'lucide-react';
import { pkgApi, agencyApi, pricingApi } from '@/lib/api';
import { useAuth } from '@/store/auth.store';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

type Step = 1 | 2 | 3 | 4 | 5;

interface ClientInfo {
  found: boolean;
  id?: string;
  name: string;
  phone: string;
  email: string;
}

export default function NewPackagePage() {
  const router = useRouter();
  const { profile } = useAuth();
  const qc = useQueryClient();
  const [step, setStep] = useState<Step>(1);
  const [calcPrice, setCalcPrice] = useState<any>(null);
  const [senderInfo,    setSender]    = useState<ClientInfo>({ found: false, name:'', phone:'', email:'' });
  const [recipientInfo, setRecipient] = useState<ClientInfo>({ found: false, name:'', phone:'', email:'' });
  const [checkingSender,    setCheckingSender]    = useState(false);
  const [checkingRecipient, setCheckingRecipient] = useState(false);
  const [form, setForm] = useState({
    origin_agency_id: profile?.agency_id || '',
    destination_agency_id: '',
    transport_type: 'sea',
    weight_kg: 1,
    length_cm: '', width_cm: '', height_cm: '',
    declared_value: 0,
    description: '', notes: '',
    is_fragile: false, is_insured: false, is_urgent: false,
  });

  const { data: agencies } = useQuery({ queryKey:['agencies'], queryFn:()=>agencyApi.list() });
  const frAgencies = (agencies as any[])?.filter(a=>a.country==='FR') || [];
  const cmAgencies = (agencies as any[])?.filter(a=>a.country==='CM') || [];

  const mutation = useMutation({
    mutationFn: (data: any) => pkgApi.create(data),
    onSuccess: (data: any) => {
      qc.invalidateQueries({ queryKey:['packages'] });
      toast.success(`Colis créé ! N° ${data.tracking_number} — Email de paiement envoyé.`);
      router.push(`/dashboard/packages/${data.id}`);
    },
    onError: (e: any) => toast.error(e.message),
  });

  // Check if a client exists by email
  async function checkClient(email: string, type: 'sender' | 'recipient') {
    if (!email) return;
    const setter = type === 'sender' ? setSender : setRecipient;
    const setChecking = type === 'sender' ? setCheckingSender : setCheckingRecipient;
    setChecking(true);
    try {
      const res: any = await pkgApi.list({ search: email });
      // Use dedicated endpoint
      const resp = await fetch(`https://fretsend.onrender.com/api/v1/users/check?email=${encodeURIComponent(email)}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('fs_access')}` },
      });
      const data = await resp.json();
      if (data?.data?.found) {
        setter(prev => ({ ...prev, found: true, id: data.data.id, name: data.data.full_name }));
        toast.success(`Client trouvé : ${data.data.full_name}`);
      } else {
        setter(prev => ({ ...prev, found: false }));
        toast.info('Nouveau client — un compte sera créé automatiquement.');
      }
    } catch {
      setter(prev => ({ ...prev, found: false }));
    } finally { setChecking(false); }
  }

  async function calcPriceNow() {
    const oAg = (agencies as any[])?.find(a=>a.id===form.origin_agency_id);
    const dAg = (agencies as any[])?.find(a=>a.id===form.destination_agency_id);
    if (!oAg||!dAg||!form.weight_kg) return;
    try {
      const res: any = await pricingApi.calculate({
        transport_type: form.transport_type,
        origin_country: oAg.country,
        destination_country: dAg.country,
        weight_kg: form.weight_kg,
        is_urgent: form.is_urgent,
        is_fragile: form.is_fragile,
        is_insured: form.is_insured,
        declared_value: form.declared_value,
      });
      setCalcPrice(res);
    } catch(e: any) { toast.error(e.message); }
  }

  function handleSubmit() {
    if (!profile) return;
    mutation.mutate({
      sender_name:  senderInfo.name,   sender_phone: senderInfo.phone,   sender_email: senderInfo.email,
      sender_id:    senderInfo.id,
      recipient_name: recipientInfo.name, recipient_phone: recipientInfo.phone, recipient_email: recipientInfo.email,
      recipient_id:   recipientInfo.id,
      ...form,
      weight_kg: Number(form.weight_kg),
    });
  }

  const STEPS = ['Expéditeur','Destinataire','Colis & Transport','Tarif','Récapitulatif'];

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/packages" className="btn-icon"><ArrowLeft className="w-4 h-4"/></Link>
        <div>
          <h1 className="page-title">Nouveau colis</h1>
          <p className="page-sub">Enregistrement d'un envoi international</p>
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex gap-1.5">
        {STEPS.map((s, i) => (
          <div key={i} className={`flex-1 py-2 px-2 rounded-xl text-center text-xs font-bold transition-all border cursor-pointer ${
            step === i+1 ? 'bg-[#1C4AA6] text-white border-[#1C4AA6]' :
            step >  i+1 ? 'bg-blue-50 text-[#1C4AA6] border-blue-200' :
                          'bg-white text-gray-400 border-gray-200'
          }`} onClick={() => step > i+1 && setStep((i+1) as Step)}>
            <span className="block">{i+1}</span>
            <span className="hidden sm:block truncate">{s.split(' ')[0]}</span>
          </div>
        ))}
      </div>

      <div className="card p-6">
        {/* ── STEP 1 : Expéditeur ── */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-up">
            <h2 className="font-bold text-gray-800 text-lg flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-[#1C4AA6] text-white text-xs flex items-center justify-center font-black">1</span>
              Informations expéditeur
            </h2>
            <p className="text-sm text-gray-500">Saisissez l'email pour vérifier si le client existe déjà dans le système.</p>

            <div>
              <label className="label">Email expéditeur *</label>
              <div className="flex gap-2">
                <input type="email" className="input flex-1"
                  value={senderInfo.email} onChange={e => setSender(p=>({...p,email:e.target.value}))}
                  placeholder="jean.dupont@email.com" />
                <button type="button" onClick={() => checkClient(senderInfo.email, 'sender')}
                  disabled={!senderInfo.email || checkingSender}
                  className="btn-ghost btn-sm whitespace-nowrap">
                  {checkingSender ? <span className="spinner w-4 h-4"/> : <Search className="w-4 h-4"/>}
                  Vérifier
                </button>
              </div>
            </div>

            {/* Client status indicator */}
            {senderInfo.email && (
              <div className={`flex items-center gap-3 p-3 rounded-xl border ${senderInfo.found ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                {senderInfo.found
                  ? <><UserCheck className="w-5 h-5 text-green-600 flex-shrink-0"/><div><p className="text-sm font-semibold text-green-700">Client existant : {senderInfo.name}</p><p className="text-xs text-green-600">Les informations seront pré-remplies.</p></div></>
                  : <><UserX className="w-5 h-5 text-amber-600 flex-shrink-0"/><div><p className="text-sm font-semibold text-amber-700">Nouveau client</p><p className="text-xs text-amber-600">Un compte sera créé automatiquement avec les infos ci-dessous.</p></div></>
                }
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">Nom complet *</label>
                <input className="input" value={senderInfo.name} onChange={e=>setSender(p=>({...p,name:e.target.value}))} placeholder="Jean Dupont" />
              </div>
              <div>
                <label className="label">Téléphone *</label>
                <input className="input" value={senderInfo.phone} onChange={e=>setSender(p=>({...p,phone:e.target.value}))} placeholder="+33 6 00 00 00 00" />
              </div>
            </div>

            <div>
              <label className="label">Agence d'expédition *</label>
              <select className="select" value={form.origin_agency_id} onChange={e=>setForm(f=>({...f,origin_agency_id:e.target.value}))}>
                <option value="">Sélectionner une agence</option>
                <optgroup label="🇫🇷 France">{frAgencies.map(a=><option key={a.id} value={a.id}>{a.name} — {a.city}</option>)}</optgroup>
                <optgroup label="🇨🇲 Cameroun">{cmAgencies.map(a=><option key={a.id} value={a.id}>{a.name} — {a.city}</option>)}</optgroup>
              </select>
            </div>

            <div className="flex justify-end">
              <button onClick={()=>setStep(2)} disabled={!senderInfo.name||!senderInfo.phone||!senderInfo.email||!form.origin_agency_id} className="btn-primary">
                Suivant <ChevronRight className="w-4 h-4"/>
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2 : Destinataire ── */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-up">
            <h2 className="font-bold text-gray-800 text-lg flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-[#F26E22] text-white text-xs flex items-center justify-center font-black">2</span>
              Informations destinataire
            </h2>
            <p className="text-sm text-gray-500">La personne qui viendra retirer le colis en agence.</p>

            <div>
              <label className="label">Email destinataire *</label>
              <div className="flex gap-2">
                <input type="email" className="input flex-1"
                  value={recipientInfo.email} onChange={e=>setRecipient(p=>({...p,email:e.target.value}))}
                  placeholder="marie.ngom@email.cm" />
                <button type="button" onClick={()=>checkClient(recipientInfo.email,'recipient')}
                  disabled={!recipientInfo.email||checkingRecipient} className="btn-ghost btn-sm whitespace-nowrap">
                  {checkingRecipient?<span className="spinner w-4 h-4"/>:<Search className="w-4 h-4"/>}Vérifier
                </button>
              </div>
            </div>

            {recipientInfo.email && (
              <div className={`flex items-center gap-3 p-3 rounded-xl border ${recipientInfo.found?'bg-green-50 border-green-200':'bg-amber-50 border-amber-200'}`}>
                {recipientInfo.found
                  ? <><UserCheck className="w-5 h-5 text-green-600 flex-shrink-0"/><div><p className="text-sm font-semibold text-green-700">Client existant : {recipientInfo.name}</p></div></>
                  : <><UserX className="w-5 h-5 text-amber-600 flex-shrink-0"/><div><p className="text-sm font-semibold text-amber-700">Nouveau client — compte créé à la validation</p></div></>
                }
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">Nom complet *</label>
                <input className="input" value={recipientInfo.name} onChange={e=>setRecipient(p=>({...p,name:e.target.value}))} placeholder="Marie Ngom" />
              </div>
              <div>
                <label className="label">Téléphone *</label>
                <input className="input" value={recipientInfo.phone} onChange={e=>setRecipient(p=>({...p,phone:e.target.value}))} placeholder="+237 6 99 00 11 22" />
              </div>
            </div>

            <div>
              <label className="label">Agence de destination *</label>
              <select className="select" value={form.destination_agency_id} onChange={e=>setForm(f=>({...f,destination_agency_id:e.target.value}))}>
                <option value="">Sélectionner une agence</option>
                <optgroup label="🇫🇷 France">{frAgencies.map(a=><option key={a.id} value={a.id}>{a.name} — {a.city}</option>)}</optgroup>
                <optgroup label="🇨🇲 Cameroun">{cmAgencies.map(a=><option key={a.id} value={a.id}>{a.name} — {a.city}</option>)}</optgroup>
              </select>
            </div>

            <div className="flex justify-between">
              <button onClick={()=>setStep(1)} className="btn-ghost">← Retour</button>
              <button onClick={()=>setStep(3)} disabled={!recipientInfo.name||!recipientInfo.phone||!recipientInfo.email||!form.destination_agency_id} className="btn-primary">
                Suivant <ChevronRight className="w-4 h-4"/>
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3 : Colis ── */}
        {step === 3 && (
          <div className="space-y-5 animate-fade-up">
            <h2 className="font-bold text-gray-800 text-lg flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-[#F2561D] text-white text-xs flex items-center justify-center font-black">3</span>
              Détails du colis
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">Poids (kg) *</label>
                <input type="number" step="0.1" min="0.1" className="input" value={form.weight_kg}
                  onChange={e=>setForm(f=>({...f,weight_kg:parseFloat(e.target.value)||0}))} />
              </div>
              <div>
                <label className="label">Valeur déclarée (€/FCFA)</label>
                <input type="number" min="0" className="input" value={form.declared_value||''}
                  onChange={e=>setForm(f=>({...f,declared_value:parseFloat(e.target.value)||0}))} />
              </div>
            </div>

            <div>
              <label className="label">Mode de transport *</label>
              <div className="grid grid-cols-2 gap-3">
                {(['sea','air'] as const).map(t => (
                  <button key={t} type="button"
                    onClick={()=>setForm(f=>({...f,transport_type:t}))}
                    className={`p-4 border-2 rounded-2xl text-left transition-all ${form.transport_type===t?'border-[#1C4AA6] bg-blue-50':'border-gray-200 hover:border-gray-300 bg-white'}`}>
                    <div className="text-3xl mb-1">{t==='air'?'✈️':'🚢'}</div>
                    <div className="font-bold text-sm text-gray-900">{t==='air'?'Aérien':'Maritime'}</div>
                    <div className="text-xs text-gray-500">{t==='air'?'3–7 jours':'21–30 jours'}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Options</label>
              <div className="space-y-2">
                {[
                  {k:'is_fragile',l:'🪟 Fragile',d:'Manutention spéciale'},
                  {k:'is_insured',l:'🛡️ Assurance',d:'2% de la valeur déclarée'},
                  {k:'is_urgent', l:'⚡ Urgent',d:'+50% sur le tarif'},
                ].map(opt => (
                  <label key={opt.k} className="flex items-center justify-between p-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-[#F2F2F2] transition-colors">
                    <div><span className="text-sm font-semibold">{opt.l}</span><span className="text-xs text-gray-400 ml-2">{opt.d}</span></div>
                    <input type="checkbox" checked={(form as any)[opt.k]}
                      onChange={e=>setForm(f=>({...f,[opt.k]:e.target.checked}))}
                      className="w-4 h-4 text-[#1C4AA6] rounded" />
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Description du contenu</label>
              <textarea className="textarea" rows={2} value={form.description}
                onChange={e=>setForm(f=>({...f,description:e.target.value}))}
                placeholder="Vêtements, électronique, alimentaire non périssable…" />
            </div>

            <div className="flex justify-between">
              <button onClick={()=>setStep(2)} className="btn-ghost">← Retour</button>
              <button onClick={()=>{calcPriceNow();setStep(4)}} className="btn-primary">
                Calculer le tarif <ChevronRight className="w-4 h-4"/>
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4 : Tarif ── */}
        {step === 4 && (
          <div className="space-y-5 animate-fade-up">
            <h2 className="font-bold text-gray-800 text-lg flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-green-600 text-white text-xs flex items-center justify-center font-black">4</span>
              Tarif calculé
            </h2>

            {calcPrice ? (
              <div className="space-y-4">
                <div className="p-5 bg-[#F2F2F2] rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-gray-700">Prix d'expédition</span>
                    <span className="text-3xl font-black text-[#1C4AA6]">{formatPrice(calcPrice.price, calcPrice.currency)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm text-gray-500">
                    <div>Transport : <strong className="text-gray-700">{form.transport_type==='air'?'✈️ Aérien':'🚢 Maritime'}</strong></div>
                    <div>ETA : <strong className="text-gray-700">~{calcPrice.eta_days} jours</strong></div>
                    <div>Poids : <strong className="text-gray-700">{form.weight_kg} kg</strong></div>
                    <div>Devise : <strong className="text-gray-700">{calcPrice.currency}</strong></div>
                  </div>
                </div>
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-700">
                  <p className="font-semibold mb-1">📧 Processus de paiement</p>
                  <p>Après validation, un email avec lien de paiement sera envoyé automatiquement à <strong>{senderInfo.email}</strong>. L'envoi sera confirmé après règlement.</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-[#1C4AA6] border-t-transparent rounded-full animate-spin mx-auto mb-3"/>
                <p className="text-gray-500 text-sm">Calcul en cours…</p>
              </div>
            )}

            <div className="flex justify-between">
              <button onClick={()=>setStep(3)} className="btn-ghost">← Retour</button>
              <button onClick={()=>setStep(5)} disabled={!calcPrice} className="btn-primary">
                Récapitulatif <ChevronRight className="w-4 h-4"/>
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 5 : Récap ── */}
        {step === 5 && (
          <div className="space-y-5 animate-fade-up">
            <h2 className="font-bold text-gray-800 text-lg flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-gray-700 text-white text-xs flex items-center justify-center font-black">5</span>
              Récapitulatif final
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-xs font-bold text-[#1C4AA6] uppercase mb-2">Expéditeur</p>
                <p className="font-bold text-gray-900">{senderInfo.name}</p>
                <p className="text-sm text-gray-500">{senderInfo.phone}</p>
                <p className="text-xs text-gray-400">{senderInfo.email}</p>
                {senderInfo.found && <span className="badge bg-green-100 text-green-700 mt-1">✓ Compte existant</span>}
                {!senderInfo.found && <span className="badge bg-amber-100 text-amber-700 mt-1">Nouveau compte</span>}
              </div>
              <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                <p className="text-xs font-bold text-[#F26E22] uppercase mb-2">Destinataire</p>
                <p className="font-bold text-gray-900">{recipientInfo.name}</p>
                <p className="text-sm text-gray-500">{recipientInfo.phone}</p>
                <p className="text-xs text-gray-400">{recipientInfo.email}</p>
                {recipientInfo.found && <span className="badge bg-green-100 text-green-700 mt-1">✓ Compte existant</span>}
                {!recipientInfo.found && <span className="badge bg-amber-100 text-amber-700 mt-1">Nouveau compte</span>}
              </div>
            </div>

            <div className="p-4 bg-[#F2F2F2] rounded-2xl grid grid-cols-3 gap-4 text-sm">
              <div><p className="text-gray-400 text-xs">Transport</p><p className="font-bold">{form.transport_type==='air'?'✈️ Aérien':'🚢 Maritime'}</p></div>
              <div><p className="text-gray-400 text-xs">Poids</p><p className="font-bold">{form.weight_kg} kg</p></div>
              <div>
                <p className="text-gray-400 text-xs">Options</p>
                <div className="flex flex-wrap gap-0.5">
                  {form.is_fragile&&<span className="badge bg-orange-100 text-orange-600 text-[10px]">Fragile</span>}
                  {form.is_insured&&<span className="badge bg-blue-100 text-blue-600 text-[10px]">Assuré</span>}
                  {form.is_urgent&&<span className="badge bg-red-100 text-red-600 text-[10px]">Urgent</span>}
                  {!form.is_fragile&&!form.is_insured&&!form.is_urgent&&<span className="text-gray-400 text-xs">Aucune</span>}
                </div>
              </div>
            </div>

            {calcPrice && (
              <div className="flex items-center justify-between p-4 border-2 border-[#1C4AA6] bg-blue-50 rounded-2xl">
                <span className="font-bold text-[#1C4AA6]">Montant à facturer</span>
                <span className="text-2xl font-black text-[#1C4AA6]">{formatPrice(calcPrice.price, calcPrice.currency)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <button onClick={()=>setStep(4)} className="btn-ghost">← Retour</button>
              <button onClick={handleSubmit} disabled={mutation.isPending} className="btn-primary">
                {mutation.isPending ? <span className="spinner"/> : <><Package className="w-4 h-4"/>Valider et envoyer</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
