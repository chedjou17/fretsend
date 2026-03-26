'use client';
import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

const WS = process.env.NEXT_PUBLIC_WS_URL || 'https://fretsend.onrender.com/api/v1';
let socket: Socket | null = null;

function getSocket() {
  if (!socket || !socket.connected) {
    socket = io(`${WS}/tracking`, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1500,
    });
  }
  return socket;
}

export interface TrackingUpdate {
  packageId: string; trackingNumber: string; status: string;
  title: string; timestamp: string; latitude?: number; longitude?: number;
}

export function useTrackingSocket(trackingNumber: string | null, onUpdate: (d: TrackingUpdate) => void) {
  useEffect(() => {
    if (!trackingNumber) return;
    const s = getSocket();
    s.emit('subscribe:tracking', { trackingNumber });
    s.on('tracking:update', (d: TrackingUpdate) => { if (d.trackingNumber === trackingNumber) onUpdate(d); });
    return () => { s.emit('unsubscribe:tracking', { trackingNumber }); s.off('tracking:update'); };
  }, [trackingNumber]);
}

export function useDashboardSocket(onUpdate: (d: TrackingUpdate) => void) {
  useEffect(() => {
    const s = getSocket();
    s.emit('subscribe:dashboard');
    s.on('tracking:update', onUpdate);
    return () => { s.off('tracking:update', onUpdate); };
  }, []);
}
