export interface Node {
  id: 'macbook' | 'ipad' | 'iphone' | 'android' | 'speaker';
  name: string;
  volume: number;
  latency: number;
  status: 'active' | 'syncing' | 'muted';
}

export interface MelodyNote {
  f: number; // frequency in Hz
  d: number; // duration in seconds
  g?: number; // optional quiet gap after note in seconds
}
