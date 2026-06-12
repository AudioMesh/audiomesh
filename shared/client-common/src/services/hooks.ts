import { useQuery } from '@tanstack/react-query';
import { apiClient } from './apiClient';
import {
  ServerHealthResponse,
  Room,
  Peer,
  TopologyEdge,
} from './types';

export const useServerHealth = () => {
  return useQuery<ServerHealthResponse>({
    queryKey: ['serverHealth'],
    queryFn: async () => {
      const startTime = Date.now();
      try {
        const res = await apiClient.checkHealth();
        const latency = Date.now() - startTime;
        if (res && res.status === 'ok') {
          return {
            status: 'connected',
            latency,
          };
        }
        return {
          status: 'error',
          latency: null,
        };
      } catch (err) {
        return {
          status: 'error',
          latency: null,
        };
      }
    },
    refetchInterval: false,
    retry: false,
    refetchOnWindowFocus: true,
  });
};

export const useRooms = () => {
  return useQuery<Room[]>({
    queryKey: ['rooms'],
    queryFn: () => apiClient.listRooms(),
    refetchInterval: 3000,
  });
};

export const useRoomDetails = (roomId: string | null | undefined) => {
  return useQuery<{ room: Room; peers: Peer[] } | null>({
    queryKey: ['room', roomId],
    queryFn: () => roomId ? apiClient.getRoom(roomId) : Promise.resolve(null),
    refetchInterval: roomId ? 2000 : false,
    enabled: !!roomId,
  });
};

export const useTopology = (roomId: string | null | undefined) => {
  return useQuery<{ edges: TopologyEdge[] } | null>({
    queryKey: ['topology', roomId],
    queryFn: () => roomId ? apiClient.getTopology(roomId) : Promise.resolve(null),
    refetchInterval: roomId ? 2000 : false,
    enabled: !!roomId,
  });
};
