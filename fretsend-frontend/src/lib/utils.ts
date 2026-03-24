import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export const cn = (...i: ClassValue[]) => twMerge(clsx(i));

export const fmtDate     = (d?: string | null) => d ? format(new Date(d), 'dd/MM/yyyy', { locale: fr }) : '—';
export const fmtDateTime = (d?: string | null) => d ? format(new Date(d), 'dd/MM/yyyy HH:mm', { locale: fr }) : '—';
export const timeAgo     = (d?: string | null) => d ? formatDistanceToNow(new Date(d), { addSuffix: true, locale: fr }) : '—';

export type PackageStatus = 'created'|'processing'|'in_transit'|'at_customs'|'arrived_hub'|'dispatched'|'available'|'delivered'|'returned';

export const STATUS_ORDER: PackageStatus[] = [
  'created','processing','in_transit','at_customs','arrived_hub','dispatched','available','delivered'
];

export const STATUS_LABEL: Record<PackageStatus, string> = {
  created:     'Enregistré',
  processing:  'En traitement',
  in_transit:  'En transit',
  at_customs:  'En douane',
  arrived_hub: 'Arrivé au hub',
  dispatched:  'En route vers agence',
  available:   'Disponible en agence',
  delivered:   'Livré',
  returned:    'Retourné',
};

export const STATUS_COLOR: Record<PackageStatus, string> = {
  created:     'status-created',
  processing:  'status-processing',
  in_transit:  'status-in_transit',
  at_customs:  'status-at_customs',
  arrived_hub: 'status-arrived_hub',
  dispatched:  'status-dispatched',
  available:   'status-available',
  delivered:   'status-delivered',
  returned:    'status-returned',
};

export const STATUS_ICON: Record<PackageStatus, string> = {
  created:     '📦', processing: '⚙️', in_transit: '🚢',
  at_customs:  '🛃', arrived_hub:'🏭', dispatched: '🚚',
  available:   '✅', delivered:  '🎉', returned:   '↩️',
};

export const STATUS_DESC: Record<PackageStatus, string> = {
  created:     'Votre colis a été enregistré en agence.',
  processing:  'Votre colis est en cours de traitement et de groupage.',
  in_transit:  'Votre colis est en transit international.',
  at_customs:  'Votre colis est en cours de dédouanement.',
  arrived_hub: 'Votre colis est arrivé au hub de destination.',
  dispatched:  'Votre colis est en route vers l\'agence de retrait.',
  available:   'Votre colis est disponible en agence. Venez le récupérer !',
  delivered:   'Votre colis a été remis au destinataire.',
  returned:    'Votre colis est retourné à l\'expéditeur.',
};

export const ROLE_LABEL: Record<string,string> = {
  admin: 'Administrateur', agency_manager: 'Chef d\'agence',
  agent: 'Agent', client: 'Client',
};

export const SHIP_LABEL: Record<string,string> = {
  preparing:'En préparation', departed:'Parti', in_transit:'En transit',
  arrived:'Arrivé', closed:'Clôturé',
};

export function formatPrice(amount?: number|null, currency = 'EUR') {
  if (amount == null) return '—';
  return currency === 'EUR'
    ? new Intl.NumberFormat('fr-FR', { style:'currency', currency:'EUR' }).format(amount)
    : new Intl.NumberFormat('fr-CM', { style:'currency', currency:'XAF', minimumFractionDigits:0 }).format(amount);
}

export function downloadCSV(rows: Record<string,unknown>[], filename: string) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const lines   = rows.map(r => headers.map(h => {
    const v = r[h]; return v == null ? '' : String(v).includes(',') ? `"${v}"` : String(v);
  }).join(','));
  const csv = [headers.join(','), ...lines].join('\n');
  const a   = document.createElement('a');
  a.href    = URL.createObjectURL(new Blob([csv], { type:'text/csv' }));
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

// Agency coordinates for MapLibre
export const AGENCY_COORDS: Record<string,[number,number]> = {
  'Paris':    [2.3522,  48.8566],
  'Lyon':     [4.8357,  45.7640],
  'Marseille':[5.3698,  43.2965],
  'Bordeaux': [-0.5792, 44.8378],
  'Douala':   [9.7085,  4.0511],
  'Yaoundé':  [11.5021, 3.8480],
  'Bafoussam':[10.4160, 5.4764],
  'Bamenda':  [10.1591, 5.9597],
};

export const progressPercent = (status: PackageStatus): number => {
  const idx = STATUS_ORDER.indexOf(status);
  if (idx < 0) return 0;
  return Math.round(((idx + 1) / STATUS_ORDER.length) * 100);
};
