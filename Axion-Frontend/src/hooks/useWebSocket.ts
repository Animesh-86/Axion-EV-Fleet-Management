import { useEffect, useState, useCallback, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export type ConnectionStatus = 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING';

export interface WebSocketMessage {
  type: string;
  vehicleId: string;
  data?: any;
  from?: string;
  to?: string;
  severity?: string;
  message?: string;
}

export function useWebSocket() {
  const [status, setStatus] = useState<ConnectionStatus>('CONNECTING');
  const clientRef = useRef<Client | null>(null);
  
  // Callbacks for different topics
  const fleetUpdatesCallbacks = useRef<Set<(msg: WebSocketMessage) => void>>(new Set());
  const vehicleUpdatesCallbacks = useRef<Map<string, { callbacks: Set<(msg: WebSocketMessage) => void>, subscription: any }>>(new Map());

  useEffect(() => {
    // Rely on HttpOnly cookie for auth; do not send Authorization header from client
    const client = new Client({
      // Provide SockJS factory
      webSocketFactory: () => new SockJS(`${BASE_URL}/ws`),
      connectHeaders: {},
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      setStatus('CONNECTED');
      
      // Subscribe to global fleet updates
      client.subscribe('/topic/fleet/updates', (message) => {
        const payload: WebSocketMessage = JSON.parse(message.body);
        fleetUpdatesCallbacks.current.forEach(cb => cb(payload));
      });
      
      // Subscribe to individual vehicle updates dynamically based on active callbacks
      vehicleUpdatesCallbacks.current.forEach((callbacks, vehicleId) => {
        client.subscribe(`/topic/vehicle/${vehicleId}`, (message) => {
          const payload: WebSocketMessage = JSON.parse(message.body);
          callbacks.forEach(cb => cb(payload));
        });
      });
    };

    client.onDisconnect = () => setStatus('DISCONNECTED');
    client.onStompError = () => setStatus('DISCONNECTED');
    client.onWebSocketClose = () => setStatus('RECONNECTING');

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, []);

  const subscribeToFleet = useCallback((callback: (msg: WebSocketMessage) => void) => {
    fleetUpdatesCallbacks.current.add(callback);
    return () => {
      fleetUpdatesCallbacks.current.delete(callback);
    };
  }, []);

  const subscribeToVehicle = useCallback((vehicleId: string, callback: (msg: WebSocketMessage) => void) => {
    if (!vehicleUpdatesCallbacks.current.has(vehicleId)) {
      vehicleUpdatesCallbacks.current.set(vehicleId, { callbacks: new Set(), subscription: null });
      
      // If already connected, dynamically subscribe to this new topic
      if (clientRef.current && clientRef.current.connected) {
        const sub = clientRef.current.subscribe(`/topic/vehicle/${vehicleId}`, (message) => {
          const payload: WebSocketMessage = JSON.parse(message.body);
          const state = vehicleUpdatesCallbacks.current.get(vehicleId);
          if (state && state.callbacks) {
             state.callbacks.forEach(cb => cb(payload));
          }
        });
        const state = vehicleUpdatesCallbacks.current.get(vehicleId);
        if (state) state.subscription = sub;
      }
    }
    
    const state = vehicleUpdatesCallbacks.current.get(vehicleId)!;
    state.callbacks.add(callback);

    return () => {
      state.callbacks.delete(callback);
      if (state.callbacks.size === 0) {
        if (state.subscription) {
          state.subscription.unsubscribe();
        }
        vehicleUpdatesCallbacks.current.delete(vehicleId);
      }
    };
  }, []);

  return {
    status,
    subscribeToFleet,
    subscribeToVehicle,
  };
}
