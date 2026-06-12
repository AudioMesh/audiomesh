// AudioMesh API routes definition
export const MESH_API_ROUTES = {
  ROOMS: {
    CREATE: '/mesh/rooms',
    LIST: '/mesh/rooms',
    GET: (id: string) => `/mesh/rooms/${id}`,
    DELETE: (id: string) => `/mesh/rooms/${id}`,
    TOPOLOGY: (id: string) => `/mesh/rooms/${id}/topology`,
    RTT: (id: string) => `/mesh/rooms/${id}/topology/rtt`,
  },
  WS: {
    SIGNALING: (roomId: string) => `/ws/signaling/${roomId}`,
    SFU: (roomId: string) => `/ws/sfu/${roomId}`,
    SYNC: (roomId: string) => `/ws/sync/${roomId}`,
  },
} as const;
