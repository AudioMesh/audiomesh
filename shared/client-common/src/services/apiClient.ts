import { Room, Peer, TopologyEdge, MeshMode } from './types';

export let API_BASE_URL =
  localStorage.getItem('audiomesh_api_url') ||
  process.env.REACT_APP_API_URL ||
  'http://127.0.0.1:50065';

export function setApiBaseUrl(url: string) {
  API_BASE_URL = url;
  localStorage.setItem('audiomesh_api_url', url);
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      errorBody.error || `HTTP error! status: ${response.status}`,
    );
  }

  return response.json();
}

export const apiClient = {
  checkHealth: () => request<{ status: string }>('/health'),

  // Mesh REST APIs
  createRoom: (name: string, mode: MeshMode, hostPeerId: string, maxNodes?: number) =>
    request<Room>('/mesh/rooms', {
      method: 'POST',
      body: JSON.stringify({ name, mode, host_peer_id: hostPeerId, max_nodes: maxNodes }),
    }),

  listRooms: () => request<Room[]>('/mesh/rooms'),

  getRoom: (id: string) => request<{ room: Room; peers: Peer[] }>(`/mesh/rooms/${id}`),

  deleteRoom: (id: string) =>
    request<{ success: boolean }>(`/mesh/rooms/${id}`, {
      method: 'DELETE',
    }),

  getTopology: (id: string) => request<{ edges: TopologyEdge[] }>(`/mesh/rooms/${id}/topology`),

  reportRtt: (id: string, fromPeerId: string, toPeerId: string, rttMs: number) =>
    request<{ success: boolean }>(`/mesh/rooms/${id}/topology/rtt`, {
      method: 'POST',
      body: JSON.stringify({ from_peer_id: fromPeerId, to_peer_id: toPeerId, rtt_ms: rttMs }),
    }),

  // WS URL helpers
  getSignalingWsUrl: (roomId: string) => {
    const wsBase = API_BASE_URL.replace(/^http/, 'ws');
    return `${wsBase}/ws/signaling/${roomId}`;
  },

  getSfuWsUrl: (roomId: string) => {
    const wsBase = API_BASE_URL.replace(/^http/, 'ws');
    return `${wsBase}/ws/sfu/${roomId}`;
  },

  getSyncWsUrl: (roomId: string) => {
    const wsBase = API_BASE_URL.replace(/^http/, 'ws');
    return `${wsBase}/ws/sync/${roomId}`;
  },
};

export type ApiClient = typeof apiClient;
