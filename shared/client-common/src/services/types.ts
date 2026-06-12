export interface ServerHealthResponse {
  status: 'connected' | 'error';
  latency: number | null;
}

export type MeshMode = 'direct_p2p' | 'daisy_chain' | 'sfu';

export interface Room {
  id: string;
  name: string;
  mode: MeshMode;
  host_peer_id: string;
  created_at: string;
  max_nodes: number;
}

export interface Peer {
  id: string;
  display_name: string;
  device_type: 'desktop' | 'phone' | 'tablet' | 'speaker' | 'browser';
  connection_type: 'wifi' | 'bluetooth' | 'websocket';
  joined_at: string;
  parent_peer_id?: string | null;
}

export interface TopologyEdge {
  from_peer_id: string;
  to_peer_id: string;
  rtt_ms?: number | null;
  status: 'connecting' | 'synced' | 'degraded' | 'disconnected';
}
