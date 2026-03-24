'use client';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Clock, MapPin, AlertCircle, CheckCircle, Wifi, WifiOff } from 'lucide-react';
import { pkgApi } from '@/lib/api';
import { useTrackingSocket } from '@/lib/socket';
import {
  STATUS_LABEL, STATUS_COLOR, STATUS_ICON, STATUS_DESC, STATUS_ORDER,
  fmtDateTime, fmtDate, formatPrice, progressPercent, AGENCY_COORDS,
  type PackageStatus,
} from '@/lib/utils';
import TrackBar from '@/components/shared/TrackBar';

export default function TrackPage() {
  const { trackingNumber } = useParams<{ trackingNumber: string }>();
  const mapRef    = useRef<HTMLDivElement>(null);
  const mapObj    = useRef<any>(null);
  const [wsOk,  setWsOk]  = useState(false);
  const [liveStatus, setLive] = useState<string | null>(null);

  const { data: pkg, isLoading, error, refetch } = useQuery({
    queryKey:  ['track', trackingNumber],
    queryFn:   () => pkgApi.track(trackingNumber),
    enabled:   !!trackingNumber,
    refetchInterval: false,
  });

  // WebSocket live updates
  useTrackingSocket(trackingNumber, (upd) => {
    setLive(upd.status);
    setWsOk(true);
    refetch();
  });

  useEffect(() => { setWsOk(true); }, []);

  // Build MapLibre map with OpenStreetMap tiles
  useEffect(() => {
    if (!mapRef.current || mapObj.current || !pkg) return;
    import('maplibre-gl').then(({ default: maplibregl }) => {
      const map = new maplibregl.Map({
        container: mapRef.current!,
        style: {
          version: 8,
          sources: {
            osm: {
              type: 'raster',
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution: '© OpenStreetMap contributors',
            },
          },
          layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
        },
        center: [5, 25],
        zoom:   2.5,
      });

      map.addControl(new maplibregl.NavigationControl(), 'top-right');
      mapObj.current = map;

      map.on('load', () => {
        const p = pkg as any;
        const oCoords = AGENCY_COORDS[p.origin_city];
        const dCoords = AGENCY_COORDS[p.destination_city];

        // Origin marker (blue)
        if (oCoords) {
          const el = document.createElement('div');
          el.className = 'w-8 h-8 rounded-full bg-[#1C4AA6] border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold';
          el.textContent = 'D';
          new maplibregl.Marker({ element: el })
            .setLngLat(oCoords)
            .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(`<strong>Départ</strong><br/>${p.origin_agency_name}<br/>${p.origin_city}`))
            .addTo(map);
        }

        // Destination marker (orange)
        if (dCoords) {
          const el = document.createElement('div');
          el.className = 'w-8 h-8 rounded-full bg-[#F26E22] border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold';
          el.textContent = 'A';
          new maplibregl.Marker({ element: el })
            .setLngLat(dCoords)
            .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(`<strong>Arrivée</strong><br/>${p.destination_agency_name}<br/>${p.destination_city}`))
            .addTo(map);
        }

        // Route line
        if (oCoords && dCoords) {
          const mid: [number, number] = [-15, 20];
          map.addSource('route', {
            type: 'geojson',
            data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [oCoords, mid, dCoords] } },
          });
          map.addLayer({ id: 'route', type: 'line', source: 'route',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: { 'line-color': '#F26E22', 'line-width': 2, 'line-dasharray': [3, 3] },
          });
          map.fitBounds([oCoords, dCoords], { padding: 80 });
        }
      });
    });
    return () => { mapObj.current?.remove(); mapObj.current = null; };
  }, [pkg]);

  const p          = pkg as any;
  const curStatus  = (liveStatus || p?.status) as PackageStatus;
  const progress   = curStatus ? progressPercent(curStatus) : 0;

  return (
    <div className="min-h-screen bg-[#F2F2F2]">
      {/* Header */}
      <div className="bg-[#1C4AA6] text-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-5 text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <Image src="/images/logo.png" alt="FretSend" width={20} height={20} className="rounded" />
            FretSend
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
            <div>
              <h1 className="text-xl font-black flex items-center gap-2">
                <span>📦</span> Suivi de colis
              </h1>
              <p className="font-mono text-white/60 text-sm mt-0.5">{trackingNumber}</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {wsOk
                ? <><Wifi className="w-4 h-4 text-green-300" /><span className="text-green-300">Temps réel actif</span></>
                : <><WifiOff className="w-4 h-4 text-white/40" /><span className="text-white/40">Connexion…</span></>}
            </div>
          </div>
          <TrackBar dark />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-5">

        {/* Loading */}
        {isLoading && (
          <div className="card p-16 text-center">
            <div className="w-12 h-12 border-4 border-[#1C4AA6] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Recherche en cours…</p>
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className="card p-12 text-center">
            <AlertCircle className="w-14 h-14 text-red-300 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-900 mb-2">Colis introuvable</h2>
            <p className="text-gray-500 text-sm">Vérifiez le numéro et réessayez.</p>
          </div>
        )}

        {p && (
          <>
            {/* ── Status card ────────────────────────────────── */}
            <div className="card p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
                <div>
                  <span className={`badge ${STATUS_COLOR[curStatus]} text-sm mb-3`}>
                    {STATUS_ICON[curStatus]} {STATUS_LABEL[curStatus]}
                  </span>
                  <h2 className="text-lg font-bold text-gray-900">
                    {p.origin_city} ({p.origin_country}) → {p.destination_city} ({p.destination_country})
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">{STATUS_DESC[curStatus]}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 flex-wrap">
                    <span>{p.transport_type === 'air' ? '✈️ Aérien' : '🚢 Maritime'}</span>
                    {p.estimated_delivery_date && (
                      <span>ETA : <strong className="text-gray-600">{fmtDate(p.estimated_delivery_date)}</strong></span>
                    )}
                    <span>Poids : <strong className="text-gray-600">{p.weight_kg} kg</strong></span>
                  </div>
                </div>
                {curStatus === 'available' && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
                    <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-1" />
                    <p className="text-sm font-bold text-emerald-700">Disponible</p>
                    <p className="text-xs text-emerald-600">en agence</p>
                  </div>
                )}
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Enregistré</span>
                  <span>En transit</span>
                  <span>Disponible</span>
                  <span>Livré</span>
                </div>
                <div className="progress-track">
                  <div className="progress-bar" style={{ width: `${progress}%` }} />
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>0%</span>
                  <span className="font-semibold text-[#1C4AA6]">{progress}%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Status steps */}
              <div className="flex gap-1 mt-4 overflow-x-auto pb-1">
                {STATUS_ORDER.map((s, i) => {
                  const idx = STATUS_ORDER.indexOf(curStatus);
                  const done = i <= idx;
                  const curr = i === idx;
                  return (
                    <div key={s} className={`flex-1 min-w-0 text-center py-2 px-1 rounded-lg text-[10px] font-medium transition-all ${
                      curr ? 'bg-[#1C4AA6] text-white' :
                      done ? 'bg-[#1C4AA6]/10 text-[#1C4AA6]' :
                             'bg-gray-100 text-gray-400'
                    }`}>
                      <div className="text-base mb-0.5">{STATUS_ICON[s]}</div>
                      <div className="hidden sm:block truncate">{STATUS_LABEL[s].split(' ')[0]}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Map ────────────────────────────────────────── */}
            <div className="card overflow-hidden">
              <div className="p-4 border-b border-surface-border flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#F26E22]" />
                <span className="font-semibold text-gray-800 text-sm">Carte du trajet</span>
                <span className="text-xs text-gray-400">— OpenStreetMap</span>
              </div>
              <div ref={mapRef} className="h-64 w-full bg-gray-100" />
            </div>

            {/* ── Parties ────────────────────────────────────── */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="card p-5">
                <p className="text-xs font-bold text-[#1C4AA6] uppercase tracking-wide mb-3">Expéditeur</p>
                <p className="font-bold text-gray-900">{p.sender_name}</p>
                <p className="text-sm text-gray-500">{p.sender_phone}</p>
                <div className="mt-3 p-3 bg-[#F2F2F2] rounded-xl">
                  <p className="text-xs font-semibold text-gray-700">{p.origin_agency_name}</p>
                  <p className="text-xs text-gray-400">{p.origin_city}, {p.origin_country}</p>
                </div>
              </div>
              <div className="card p-5">
                <p className="text-xs font-bold text-[#F26E22] uppercase tracking-wide mb-3">Destinataire</p>
                <p className="font-bold text-gray-900">{p.recipient_name}</p>
                <p className="text-sm text-gray-500">{p.recipient_phone}</p>
                <div className="mt-3 p-3 bg-[#F2F2F2] rounded-xl">
                  <p className="text-xs font-semibold text-gray-700">{p.destination_agency_name}</p>
                  <p className="text-xs text-gray-400">{p.destination_city}, {p.destination_country}</p>
                </div>
              </div>
            </div>

            {/* ── Timeline ───────────────────────────────────── */}
            <div className="card p-6">
              <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#1C4AA6]" /> Historique complet
              </h3>
              {p.tracking_events?.length > 0 ? (
                <div>
                  {p.tracking_events.map((ev: any, i: number) => (
                    <div key={ev.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`timeline-dot ${i === 0 ? 'bg-[#1C4AA6] text-white ring-4 ring-[#1C4AA6]/20' : 'bg-gray-100 text-gray-500'}`}>
                          {STATUS_ICON[ev.status as PackageStatus] || '•'}
                        </div>
                        {i < p.tracking_events.length - 1 && <div className="timeline-line" />}
                      </div>
                      <div className="pb-5 flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className={`font-semibold text-sm ${i === 0 ? 'text-[#1C4AA6]' : 'text-gray-700'}`}>{ev.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{ev.description}</p>
                            {ev.location && (
                              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />{ev.location}
                              </p>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 whitespace-nowrap">{fmtDateTime(ev.created_at)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">Aucun événement enregistré pour l'instant.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
