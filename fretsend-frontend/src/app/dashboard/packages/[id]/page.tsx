'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Clock, Edit2, MapPin, ExternalLink, Wifi } from 'lucide-react';
import { pkgApi, agencyApi } from '@/lib/api';
import { useAuth } from '@/store/auth.store';
import { useTrackingSocket } from '@/lib/socket';
import { STATUS_LABEL, STATUS_COLOR, STATUS_ICON, STATUS_ORDER, fmtDateTime, fmtDate, formatPrice, progressPercent, AGENCY_COORDS, type PackageStatus } from '@/lib/utils';
import { toast } from 'sonner';

const NEXT: Record<PackageStatus, PackageStatus[]> = {
  created:['processing'], processing:['in_transit'], in_transit:['at_customs','arrived_hub'],
  at_customs:['arrived_hub'], arrived_hub:['dispatched'], dispatched:['available'],
  available:['delivered','returned'], delivered:[], returned:[],
};

export default function PackageDetailPage() {
  const { id }           = useParams<{ id: string }>();
  const { isRole }       = useAuth();
  const qc               = useQueryClient();
  const mapRef           = useRef<HTMLDivElement>(null);
  const mapObj           = useRef<any>(null);
  const [modal, setModal]     = useState(false);
  const [newStatus, setNew]   = useState('');
  const [note, setNote]       = useState('');
  const [wsLive, setWsLive]  = useState(false);

  const { data: pkg, refetch } = useQuery({ queryKey:['package',id], queryFn:()=>pkgApi.byId(id), enabled:!!id });
  const { data: agencies }     = useQuery({ queryKey:['agencies'], queryFn:()=>agencyApi.list() });

  const mutation = useMutation({
    mutationFn: (d: any) => pkgApi.updateStatus(id, d),
    onSuccess: () => { toast.success('Statut mis à jour !'); setModal(false); setNew(''); setNote(''); refetch(); qc.invalidateQueries({queryKey:['packages']}); },
    onError:   (e: any) => toast.error(e.message),
  });

  // WebSocket
  useTrackingSocket((pkg as any)?.tracking_number || null, () => { refetch(); setWsLive(true); });
  useEffect(() => { setWsLive(true); }, []);

  // MapLibre map
  useEffect(() => {
    if (!mapRef.current || mapObj.current || !pkg) return;
    import('maplibre-gl').then(({ default: ml }) => {
      const map = new ml.Map({
        container: mapRef.current!,
        style: { version:8, sources:{ osm:{ type:'raster', tiles:['https://tile.openstreetmap.org/{z}/{x}/{y}.png'], tileSize:256, attribution:'© OpenStreetMap' } }, layers:[{id:'osm',type:'raster',source:'osm'}] },
        center: [5, 25], zoom: 2.5,
      });
      map.addControl(new ml.NavigationControl(), 'top-right');
      mapObj.current = map;
      const p = pkg as any;
      map.on('load', () => {
        const addMarker = (city: string, color: string, label: string) => {
          const c = AGENCY_COORDS[city]; if (!c) return;
          const el = document.createElement('div');
          el.style.cssText = `width:32px;height:32px;border-radius:50%;background:${color};border:2px solid white;display:flex;align-items:center;justify-content:center;color:white;font-size:11px;font-weight:bold;box-shadow:0 2px 8px rgba(0,0,0,.3);cursor:pointer`;
          el.textContent = label;
          new ml.Marker({ element: el }).setLngLat(c).setPopup(new ml.Popup({offset:25}).setHTML(`<strong>${city}</strong>`)).addTo(map);
        };
        if (p.origin_city) addMarker(p.origin_city, '#1C4AA6', 'D');
        if (p.destination_city) addMarker(p.destination_city, '#F26E22', 'A');
        const oC = AGENCY_COORDS[p.origin_city], dC = AGENCY_COORDS[p.destination_city];
        if (oC && dC) {
          map.addSource('route', { type:'geojson', data:{ type:'Feature', properties:{}, geometry:{ type:'LineString', coordinates:[oC,[-15,20],dC] } } });
          map.addLayer({ id:'route', type:'line', source:'route', layout:{'line-join':'round','line-cap':'round'}, paint:{'line-color':'#F26E22','line-width':2,'line-dasharray':[3,3]} });
          map.fitBounds([oC,dC], { padding:80 });
        }
      });
    });
    return () => { mapObj.current?.remove(); mapObj.current = null; };
  }, [pkg]);

  if (!pkg) return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-[#1C4AA6] border-t-transparent rounded-full animate-spin" /></div>;

  const p          = pkg as any;
  const curStatus  = p.status as PackageStatus;
  const progress   = progressPercent(curStatus);
  const nextStatuses = NEXT[curStatus] || [];
  const canUpdate  = isRole('admin','agency_manager','agent');

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/packages" className="btn-icon"><ArrowLeft className="w-4 h-4" /></Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-black text-gray-900 font-mono">{p.tracking_number}</h1>
            <span className={`badge ${STATUS_COLOR[curStatus]} text-sm`}>{STATUS_ICON[curStatus]} {STATUS_LABEL[curStatus]}</span>
            <div className={`flex items-center gap-1 text-xs ${wsLive ? 'text-green-500' : 'text-gray-400'}`}>
              <Wifi className="w-3 h-3" />{wsLive ? 'Live' : '…'}
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">Créé le {fmtDateTime(p.created_at)}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/track/${p.tracking_number}`} target="_blank" className="btn-ghost btn-sm">
            <ExternalLink className="w-3.5 h-3.5" />Tracking public
          </Link>
          {canUpdate && nextStatuses.length > 0 && (
            <button onClick={() => setModal(true)} className="btn-primary btn-sm">
              <Edit2 className="w-3.5 h-3.5" />Mettre à jour
            </button>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="card p-5">
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>Enregistré</span><span>En transit</span><span>Disponible</span><span>Livré</span>
        </div>
        <div className="progress-track mb-2">
          <div className="progress-bar" style={{ width:`${progress}%` }} />
        </div>
        <div className="flex gap-1 overflow-x-auto pb-1">
          {STATUS_ORDER.map((s, i) => {
            const idx  = STATUS_ORDER.indexOf(curStatus);
            const done = i <= idx; const curr = i === idx;
            return (
              <div key={s} className={`flex-1 min-w-0 text-center py-1.5 px-1 rounded-lg text-[10px] font-medium transition-all ${
                curr ? 'bg-[#1C4AA6] text-white' : done ? 'bg-blue-50 text-[#1C4AA6]' : 'bg-gray-100 text-gray-400'
              }`}>
                <div>{STATUS_ICON[s]}</div>
                <div className="hidden sm:block truncate text-[9px] mt-0.5">{STATUS_LABEL[s].split(' ')[0]}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
          {/* Parties */}
          <div className="card p-5 grid md:grid-cols-2 gap-5">
            <div>
              <p className="text-xs font-bold text-[#1C4AA6] uppercase tracking-wide mb-2">Expéditeur</p>
              <p className="font-bold text-gray-900">{p.sender_name}</p>
              <p className="text-sm text-gray-500">{p.sender_phone}</p>
              {p.sender_email && <p className="text-xs text-gray-400">{p.sender_email}</p>}
              <div className="mt-2 p-2.5 bg-[#F2F2F2] rounded-xl">
                <p className="text-xs font-semibold text-gray-700">{p.origin_agency_name}</p>
                <p className="text-xs text-gray-400">{p.origin_city}, {p.origin_country}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-[#F26E22] uppercase tracking-wide mb-2">Destinataire</p>
              <p className="font-bold text-gray-900">{p.recipient_name}</p>
              <p className="text-sm text-gray-500">{p.recipient_phone}</p>
              {p.recipient_email && <p className="text-xs text-gray-400">{p.recipient_email}</p>}
              <div className="mt-2 p-2.5 bg-[#F2F2F2] rounded-xl">
                <p className="text-xs font-semibold text-gray-700">{p.destination_agency_name}</p>
                <p className="text-xs text-gray-400">{p.destination_city}, {p.destination_country}</p>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#F26E22]" />
              <span className="font-semibold text-gray-800 text-sm">Carte du trajet — OpenStreetMap</span>
            </div>
            <div ref={mapRef} className="h-52 w-full bg-gray-100" />
          </div>

          {/* Timeline */}
          <div className="card p-5">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#1C4AA6]" />Historique complet
            </h3>
            {p.tracking_events?.map((ev: any, i: number) => (
              <div key={ev.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`timeline-dot text-sm ${i===0 ? 'bg-[#1C4AA6] text-white ring-4 ring-blue-100' : 'bg-gray-100 text-gray-500'}`}>
                    {STATUS_ICON[ev.status as PackageStatus]||'•'}
                  </div>
                  {i < p.tracking_events.length-1 && <div className="timeline-line" />}
                </div>
                <div className="pb-4 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className={`font-semibold text-sm ${i===0 ? 'text-[#1C4AA6]' : 'text-gray-700'}`}>{ev.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{ev.description}</p>
                    </div>
                    <p className="text-xs text-gray-400 whitespace-nowrap">{fmtDateTime(ev.created_at)}</p>
                  </div>
                </div>
              </div>
            ))}
            {!p.tracking_events?.length && <p className="text-gray-400 text-sm">Aucun événement.</p>}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card p-4">
            <p className="text-xs font-bold text-gray-500 uppercase mb-3">Caractéristiques</p>
            <div className="space-y-2 text-sm">
              {[
                ['Poids',        `${p.weight_kg} kg`],
                ['Transport',    p.transport_type==='air'?'✈️ Aérien':'🚢 Maritime'],
                ['Tarif',        formatPrice(p.price, p.currency)],
                ['Paiement',     p.payment_status==='paid'?'✓ Payé':p.payment_status==='problem'?'⚠ Problème':'⏳ Attente'],
                ['Livr. estimée',fmtDate(p.estimated_delivery_date)],
              ].map(([k,v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-gray-500">{k}</span>
                  <span className="font-semibold text-gray-800">{v}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-1 mt-3">
              {p.is_fragile && <span className="badge bg-orange-100 text-orange-600">Fragile</span>}
              {p.is_insured && <span className="badge bg-blue-100 text-blue-600">Assuré</span>}
              {p.is_urgent  && <span className="badge bg-red-100 text-red-600">Urgent</span>}
            </div>
          </div>
          {p.description && (
            <div className="card p-4">
              <p className="text-xs font-bold text-gray-500 uppercase mb-2">Contenu</p>
              <p className="text-sm text-gray-700">{p.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Status modal */}
      {modal && (
        <div className="modal-overlay">
          <div className="modal-box p-6 animate-fade-up">
            <h2 className="font-bold text-gray-900 mb-4">Mettre à jour le statut</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Nouveau statut *</label>
                <select className="select" value={newStatus} onChange={e=>setNew(e.target.value)}>
                  <option value="">Choisir…</option>
                  {nextStatuses.map(s => <option key={s} value={s}>{STATUS_ICON[s]} {STATUS_LABEL[s]}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Agence (optionnel)</label>
                <select className="select" onChange={e=>{}}>
                  <option value="">Agence actuelle</option>
                  {(agencies as any[])?.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Note (optionnel)</label>
                <textarea className="textarea" rows={2} value={note} onChange={e=>setNote(e.target.value)} placeholder="Informations complémentaires…" />
              </div>
              <p className="text-xs text-amber-600 bg-amber-50 rounded-xl p-3">
                📧 Un email de notification sera envoyé automatiquement à l'expéditeur et au destinataire.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setModal(false)} className="btn-ghost flex-1 justify-center">Annuler</button>
                <button onClick={() => mutation.mutate({ status:newStatus, note })} disabled={!newStatus||mutation.isPending} className="btn-primary flex-1 justify-center">
                  {mutation.isPending ? <span className="spinner"/> : 'Confirmer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
