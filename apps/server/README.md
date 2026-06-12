# AudioMesh Server — Mesh Audio Gateway

The AudioMesh server is a high-performance local gateway daemon written in Rust. It manages room lifecycle, peer connections, real-time tree topologies, low-latency audio packet routing (SFU), and sub-millisecond clock synchronization across local client devices.

---

## Architecture

The mesh server implements three main connection modes:
1. **Direct P2P**: Host establishes direct WebRTC connections to each client (best for small groups, up to 15 nodes).
2. **Daisy-Chain**: Peer-to-peer relaying where the host sends audio to a subset of peers, which recursively forward the stream down a balanced tree topology (best for large groups, up to 30 nodes, auto-balances and self-heals on disconnect).
3. **SFU (Selective Forwarding Unit)**: Host uploads audio to the server over a single WebSocket uplink, and the server fans it out to all clients over WebSocket downlinks (best for large venues or heavy local interference, up to 50 nodes).

---

## Configuration

The server configuration is loaded from environment variables (or defaults) in `config.rs`:

| Variable | Description | Default |
|---|---|---|
| `HOST` | The bind address | `127.0.0.1` |
| `PORT` | The port to listen on | `3000` |
| `MAX_ROOMS` | Maximum concurrent active rooms | `100` |
| `MAX_NODES_PER_ROOM` | Default maximum nodes per room | `50` |
| `SFU_BUFFER_SIZE` | Under-the-hood frame broadcast buffer size | `128` |
| `MAX_CHILDREN_PER_NODE` | Maximum branch factor for Daisy-Chain trees | `3` |

---

## API Endpoints

### 1. REST API

All mesh endpoints are public and do not require user authentication (rooms are secured via room IDs).

#### Create a Room
* **Endpoint**: `POST /mesh/rooms`
* **Request Payload**:
  ```json
  {
    "name": "Living Room Party",
    "mode": "sfu", // "direct_p2p" | "daisy_chain" | "sfu"
    "host_peer_id": "host-device-1",
    "max_nodes": 50 // Optional: overrides the default limit
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "id": "7a3b...",
    "name": "Living Room Party",
    "mode": "sfu",
    "host_peer_id": "host-device-1",
    "created_at": "2026-06-12T23:36:00Z",
    "max_nodes": 50
  }
  ```

#### List Rooms
* **Endpoint**: `GET /mesh/rooms`
* **Response (200 OK)**:
  ```json
  [
    {
      "id": "7a3b...",
      "name": "Living Room Party",
      "mode": "sfu",
      "host_peer_id": "host-device-1",
      "created_at": "2026-06-12T23:36:00Z",
      "max_nodes": 50
    }
  ]
  ```

#### Get Room Details & Peers
* **Endpoint**: `GET /mesh/rooms/:id`
* **Response (200 OK)**:
  ```json
  {
    "room": {
      "id": "7a3b...",
      "name": "Living Room Party",
      "mode": "sfu",
      "host_peer_id": "host-device-1",
      "created_at": "2026-06-12T23:36:00Z",
      "max_nodes": 50
    },
    "peers": [
      {
        "id": "client-1",
        "display_name": "iPhone 15",
        "device_type": "phone",
        "connection_type": "wifi",
        "joined_at": "2026-06-12T23:36:10Z"
      }
    ]
  }
  ```

#### Close/Delete a Room
* **Endpoint**: `DELETE /mesh/rooms/:id`
* **Response (200 OK)**:
  ```json
  {
    "success": true
  }
  ```

#### Get Topology Tree (Daisy-Chain only)
* **Endpoint**: `GET /mesh/rooms/:id/topology`
* **Response (200 OK)**:
  ```json
  {
    "edges": [
      {
        "from_peer_id": "host-device-1",
        "to_peer_id": "client-1",
        "rtt_ms": 12.5,
        "status": "synced" // "connecting" | "synced" | "degraded" | "disconnected"
      }
    ]
  }
  ```

#### Report RTT Measurement
* **Endpoint**: `POST /mesh/rooms/:id/topology/rtt`
* **Request Payload**:
  ```json
  {
    "from_peer_id": "host-device-1",
    "to_peer_id": "client-1",
    "rtt_ms": 12.5
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true
  }
  ```

---

### 2. WebSocket Protocols

#### Signaling WebSocket
* **Endpoint**: `GET /ws/signaling/:room_id`
* **Usage**: Used by WebRTC nodes (Direct P2P / Daisy-Chain modes) to exchange SDP offers, answers, and ICE candidates, and to receive real-time parents for daisy-chaining.
* **Client Handshake**: The client connects and sends a `join` frame:
  ```json
  {
    "type": "join",
    "peer_id": "client-1",
    "display_name": "iPhone 15",
    "device_type": "phone", // "desktop" | "phone" | "tablet" | "speaker" | "browser"
    "connection_type": "wifi" // "wifi" | "bluetooth" | "websocket"
  }
  ```
* **Server Responses**:
  - `peers`: Server broadcasts the full room peer list to all peers upon changes.
  - `topology_assign`: Server assigns the client a parent node if the room is in Daisy-Chain mode.
  - `peer_left`: Server notifies the remaining nodes when a peer leaves.

#### SFU Media Stream WebSocket
* **Endpoint**: `GET /ws/sfu/:room_id`
* **Usage**: Relays low-latency binary audio frames.
* **Handshake**:
  1. The client connects and sends a JSON text frame specifying their role:
     - Host (uplink): `{"role": "host"}`
     - Client (downlink): `{"role": "client"}`
  2. The Host streams binary frames: `[8-byte timestamp][Raw Opus Audio Data]`.
  3. The Server utilizes a zero-copy lock-free broadcast channel to forward frames to all connected client downlinks.
  4. If a client lags, the server skips lagged frames to prioritize real-time playback.

#### NTP Time Sync WebSocket
* **Endpoint**: `GET /ws/sync/:room_id`
* **Usage**: Performs high-frequency NTP-style clock drift calculations.
* **Handshake**:
  1. Client sends a JSON message:
     ```json
     { "client_send_us": 1718223400000000 }
     ```
  2. Server immediately processes it and replies:
     ```json
     {
       "client_send_us": 1718223400000000,
       "server_recv_us": 1718223400000120,
       "server_send_us": 1718223400000140
     }
     ```
  3. The client performs multiple cycles of this exchange to calculate average round-trip delay and precise clock offset relative to the host's session clock.

---

## Testing

To run the complete test suite:
```bash
cargo test
```
