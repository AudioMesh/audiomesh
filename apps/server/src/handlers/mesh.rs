use crate::services::mesh::{
    room_registry::RoomRegistry, time_sync::TimeSyncService, topology::TopologyManager,
    ConnectionType, DeviceType, MeshMode, Peer,
};
use axum::{
    extract::{
        ws::{Message, WebSocket},
        Path, State, WebSocketUpgrade,
    },
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use chrono::Utc;
use futures_util::{SinkExt, StreamExt};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

/// Shared application state for all mesh endpoints.
#[derive(Clone)]
pub struct MeshState {
    pub registry: Arc<RoomRegistry>,
    pub topology: Arc<TopologyManager>,
    pub time_sync: Arc<TimeSyncService>,
}

// ─── Request / Response Payloads ───────────────────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct CreateRoomPayload {
    pub name: String,
    pub mode: MeshMode,
    #[serde(default)]
    pub max_nodes: Option<usize>,
    pub host_peer_id: String,
}

#[derive(Debug, Deserialize)]
pub struct ReportRttPayload {
    pub from_peer_id: String,
    pub to_peer_id: String,
    pub rtt_ms: f64,
}

/// Signaling messages exchanged over the signaling WebSocket.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum SignalingMessage {
    /// Client -> Server: Join the signaling room.
    Join {
        peer_id: String,
        display_name: String,
        device_type: DeviceType,
        connection_type: ConnectionType,
    },
    /// Server -> Client: Current list of peers in the room.
    Peers { peers: Vec<PeerInfo> },
    /// Client -> Server: SDP offer to a specific peer.
    Offer {
        #[serde(default, skip_serializing_if = "Option::is_none")]
        from_peer_id: Option<String>,
        to_peer_id: String,
        sdp: String,
    },
    /// Client -> Server: SDP answer to a specific peer.
    Answer {
        #[serde(default, skip_serializing_if = "Option::is_none")]
        from_peer_id: Option<String>,
        to_peer_id: String,
        sdp: String,
    },
    /// Client -> Server: ICE candidate for a specific peer.
    Ice {
        #[serde(default, skip_serializing_if = "Option::is_none")]
        from_peer_id: Option<String>,
        to_peer_id: String,
        candidate: String,
    },
    /// Server -> Client: Topology assignment (Daisy-Chain mode).
    TopologyAssign { parent_peer_id: String },
    /// Server -> Client: A peer has left the room.
    PeerLeft { peer_id: String },
    /// Server -> Client: Error message.
    Error { message: String },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PeerInfo {
    pub id: String,
    pub display_name: String,
    pub device_type: DeviceType,
}

// ─── REST Handlers ─────────────────────────────────────────────────────────────

/// POST /mesh/rooms — Create a new mesh room.
pub async fn create_room(
    State(state): State<MeshState>,
    Json(payload): Json<CreateRoomPayload>,
) -> impl IntoResponse {
    match state.registry.create_room(
        payload.name,
        payload.mode.clone(),
        payload.host_peer_id,
        payload.max_nodes,
    ) {
        Ok(room) => {
            // Initialize topology tree for Daisy-Chain mode
            if payload.mode == MeshMode::DaisyChain {
                state.topology.init_room(&room.id);
            }
            (StatusCode::CREATED, Json(serde_json::json!(room))).into_response()
        }
        Err(err) => (
            StatusCode::BAD_REQUEST,
            Json(serde_json::json!({ "error": err })),
        )
            .into_response(),
    }
}

/// GET /mesh/rooms — List all active rooms.
pub async fn list_rooms(State(state): State<MeshState>) -> impl IntoResponse {
    let rooms = state.registry.list_rooms();
    Json(serde_json::json!(rooms))
}

/// GET /mesh/rooms/:id — Get a specific room with its peer list.
pub async fn get_room(
    State(state): State<MeshState>,
    Path(id): Path<String>,
) -> impl IntoResponse {
    match state.registry.get_room(&id) {
        Some(room) => {
            let peers = state.registry.get_peers(&id);
            (
                StatusCode::OK,
                Json(serde_json::json!({ "room": room, "peers": peers })),
            )
                .into_response()
        }
        None => (
            StatusCode::NOT_FOUND,
            Json(serde_json::json!({ "error": "Room not found." })),
        )
            .into_response(),
    }
}

/// DELETE /mesh/rooms/:id — Close and delete a room.
pub async fn delete_room(
    State(state): State<MeshState>,
    Path(id): Path<String>,
) -> impl IntoResponse {
    state.topology.remove_room(&id);
    if state.registry.delete_room(&id) {
        (
            StatusCode::OK,
            Json(serde_json::json!({ "success": true })),
        )
            .into_response()
    } else {
        (
            StatusCode::NOT_FOUND,
            Json(serde_json::json!({ "error": "Room not found." })),
        )
            .into_response()
    }
}

/// GET /mesh/rooms/:id/topology — Get the current connection tree.
pub async fn get_topology(
    State(state): State<MeshState>,
    Path(id): Path<String>,
) -> impl IntoResponse {
    if state.registry.get_room(&id).is_none() {
        return (
            StatusCode::NOT_FOUND,
            Json(serde_json::json!({ "error": "Room not found." })),
        )
            .into_response();
    }

    let tree = state.topology.get_tree(&id);
    (StatusCode::OK, Json(serde_json::json!({ "edges": tree }))).into_response()
}

/// POST /mesh/rooms/:id/topology/rtt — Report RTT measurement between two peers.
pub async fn report_rtt(
    State(state): State<MeshState>,
    Path(id): Path<String>,
    Json(payload): Json<ReportRttPayload>,
) -> impl IntoResponse {
    if state.registry.get_room(&id).is_none() {
        return (
            StatusCode::NOT_FOUND,
            Json(serde_json::json!({ "error": "Room not found." })),
        )
            .into_response();
    }

    state
        .topology
        .update_rtt(&id, &payload.from_peer_id, &payload.to_peer_id, payload.rtt_ms);

    (
        StatusCode::OK,
        Json(serde_json::json!({ "success": true })),
    )
        .into_response()
}

// ─── WebSocket Handlers ────────────────────────────────────────────────────────

/// GET /ws/signaling/:room_id — WebSocket signaling for SDP/ICE exchange.
pub async fn ws_signaling(
    ws: WebSocketUpgrade,
    State(state): State<MeshState>,
    Path(room_id): Path<String>,
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| handle_signaling(socket, state, room_id))
}

/// GET /ws/sfu/:room_id — WebSocket SFU media channel.
pub async fn ws_sfu(
    ws: WebSocketUpgrade,
    State(state): State<MeshState>,
    Path(room_id): Path<String>,
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| handle_sfu(socket, state, room_id))
}

/// GET /ws/sync/:room_id — WebSocket time synchronization channel.
pub async fn ws_sync(
    ws: WebSocketUpgrade,
    State(state): State<MeshState>,
    Path(room_id): Path<String>,
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| handle_sync(socket, state, room_id))
}

// ─── WebSocket Implementation ──────────────────────────────────────────────────

/// Handles the signaling WebSocket connection for a single peer.
///
/// Protocol:
/// 1. Client sends a `join` message with peer info.
/// 2. Server registers the peer and broadcasts the updated peer list.
/// 3. Client sends `offer`, `answer`, `ice` messages targeted at specific peers.
/// 4. Server forwards these messages to the targeted peer.
/// 5. On disconnect, server removes the peer and broadcasts `peer_left`.
async fn handle_signaling(socket: WebSocket, state: MeshState, room_id: String) {
    let (mut sender, mut receiver) = socket.split();
    let mut my_peer_id: Option<String> = None;

    while let Some(msg) = receiver.next().await {
        let msg = match msg {
            Ok(Message::Text(text)) => text,
            Ok(Message::Close(_)) | Err(_) => break,
            _ => continue,
        };

        let parsed: SignalingMessage = match serde_json::from_str(&msg) {
            Ok(m) => m,
            Err(e) => {
                let err = SignalingMessage::Error {
                    message: format!("Invalid message: {}", e),
                };
                let _ = sender
                    .send(Message::Text(serde_json::to_string(&err).unwrap().into()))
                    .await;
                continue;
            }
        };

        match parsed {
            SignalingMessage::Join {
                peer_id,
                display_name,
                device_type,
                connection_type,
            } => {
                let peer = Peer {
                    id: peer_id.clone(),
                    display_name: display_name.clone(),
                    device_type: device_type.clone(),
                    connection_type,
                    joined_at: Utc::now(),
                    parent_peer_id: None,
                };

                if let Err(e) = state.registry.add_peer(&room_id, peer) {
                    let err = SignalingMessage::Error { message: e };
                    let _ = sender
                        .send(Message::Text(serde_json::to_string(&err).unwrap().into()))
                        .await;
                    continue;
                }

                my_peer_id = Some(peer_id.clone());

                // If Daisy-Chain mode, assign a parent and notify the peer
                if let Some(room) = state.registry.get_room(&room_id) {
                    if room.mode == MeshMode::DaisyChain {
                        let all_peers: Vec<String> = state
                            .registry
                            .get_peers(&room_id)
                            .iter()
                            .map(|p| p.id.clone())
                            .collect();

                        if let Some(parent) = state.topology.assign_parent(
                            &room_id,
                            &peer_id,
                            &room.host_peer_id,
                            &all_peers,
                        ) {
                            state
                                .registry
                                .set_peer_parent(&room_id, &peer_id, Some(parent.clone()));

                            let assign = SignalingMessage::TopologyAssign {
                                parent_peer_id: parent,
                            };
                            let _ = sender
                                .send(Message::Text(
                                    serde_json::to_string(&assign).unwrap().into(),
                                ))
                                .await;
                        }
                    }
                }

                // Send current peer list
                let peers: Vec<PeerInfo> = state
                    .registry
                    .get_peers(&room_id)
                    .iter()
                    .map(|p| PeerInfo {
                        id: p.id.clone(),
                        display_name: p.display_name.clone(),
                        device_type: p.device_type.clone(),
                    })
                    .collect();

                let peers_msg = SignalingMessage::Peers { peers };
                let _ = sender
                    .send(Message::Text(
                        serde_json::to_string(&peers_msg).unwrap().into(),
                    ))
                    .await;
            }

            // For offer/answer/ice: In a full implementation, we would maintain
            // a map of peer_id -> sender and forward messages to the target peer.
            // For now, we acknowledge receipt. The forwarding mechanism requires
            // a shared sender registry (covered by the broadcast channel pattern).
            SignalingMessage::Offer { to_peer_id, sdp, .. } => {
                if let Some(ref pid) = my_peer_id {
                    tracing::info!(
                        "Signaling: {} -> {} (offer, {} bytes SDP)",
                        pid,
                        to_peer_id,
                        sdp.len()
                    );
                }
                // TODO: Forward to target peer via shared sender registry
            }

            SignalingMessage::Answer { to_peer_id, sdp, .. } => {
                if let Some(ref pid) = my_peer_id {
                    tracing::info!(
                        "Signaling: {} -> {} (answer, {} bytes SDP)",
                        pid,
                        to_peer_id,
                        sdp.len()
                    );
                }
                // TODO: Forward to target peer via shared sender registry
            }

            SignalingMessage::Ice {
                to_peer_id,
                candidate,
                ..
            } => {
                if let Some(ref pid) = my_peer_id {
                    tracing::info!(
                        "Signaling: {} -> {} (ice, {} bytes)",
                        pid,
                        to_peer_id,
                        candidate.len()
                    );
                }
                // TODO: Forward to target peer via shared sender registry
            }

            _ => {
                // Ignore server-originated message types from clients
            }
        }
    }

    // Cleanup on disconnect
    if let Some(peer_id) = my_peer_id {
        // Remove from topology first (to re-parent children)
        let orphans = state.topology.remove_node(&room_id, &peer_id);
        for orphan in &orphans {
            tracing::info!(
                "Daisy-chain self-heal: re-parented '{}' after '{}' disconnected",
                orphan,
                peer_id
            );
        }

        state.registry.remove_peer(&room_id, &peer_id);
        tracing::info!("Peer '{}' left room '{}'", peer_id, room_id);
    }
}

/// Handles the SFU WebSocket connection.
///
/// Protocol:
/// - First binary message determines the role:
///   - Text message `{"role":"host"}` -> this is the audio uplink (host publishes)
///   - Text message `{"role":"client"}` -> this is a downlink (client subscribes)
/// - Host sends binary frames: [8-byte timestamp][Opus audio data]
/// - Server fans out binary frames to all subscribed clients via broadcast channel.
async fn handle_sfu(socket: WebSocket, state: MeshState, room_id: String) {
    let (mut sender, mut receiver) = socket.split();

    // Wait for the role identification message
    let role_msg = match receiver.next().await {
        Some(Ok(Message::Text(text))) => text.to_string(),
        _ => return,
    };

    #[derive(Deserialize)]
    struct RoleMsg {
        role: String,
    }

    let role: RoleMsg = match serde_json::from_str(&role_msg) {
        Ok(r) => r,
        Err(_) => return,
    };

    match role.role.as_str() {
        "host" => {
            // Host uplink: read binary frames and publish to broadcast channel
            let sfu_sender = match state.registry.get_sfu_sender(&room_id) {
                Some(s) => s,
                None => return,
            };

            tracing::info!("SFU: Host connected as uplink for room '{}'", room_id);

            while let Some(msg) = receiver.next().await {
                match msg {
                    Ok(Message::Binary(data)) => {
                        // Publish to all subscribers; ignore send errors
                        // (happens when no subscribers are connected)
                        let _ = sfu_sender.send(Arc::new(data.to_vec()));
                    }
                    Ok(Message::Close(_)) | Err(_) => break,
                    _ => continue,
                }
            }

            tracing::info!("SFU: Host disconnected from room '{}'", room_id);
        }

        "client" => {
            // Client downlink: subscribe to broadcast and forward frames
            let mut sfu_receiver = match state.registry.subscribe_sfu(&room_id) {
                Some(r) => r,
                None => return,
            };

            tracing::info!("SFU: Client subscribed to room '{}'", room_id);

            loop {
                match sfu_receiver.recv().await {
                    Ok(data) => {
                        if sender
                            .send(Message::Binary(data.as_ref().clone().into()))
                            .await
                            .is_err()
                        {
                            break;
                        }
                    }
                    Err(broadcast::error::RecvError::Lagged(n)) => {
                        tracing::warn!("SFU: Client lagged by {} frames, skipping", n);
                        continue;
                    }
                    Err(broadcast::error::RecvError::Closed) => break,
                }
            }

            tracing::info!("SFU: Client disconnected from room '{}'", room_id);
        }

        _ => {
            tracing::warn!("SFU: Unknown role '{}', disconnecting", role.role);
        }
    }
}

use tokio::sync::broadcast;

/// Handles the time sync WebSocket connection.
///
/// Protocol: Client sends JSON `{ "client_send_us": <i64> }`,
/// server responds with `{ "client_send_us", "server_recv_us", "server_send_us" }`.
/// Client performs multiple rounds and averages the clock offset.
async fn handle_sync(socket: WebSocket, state: MeshState, room_id: String) {
    if state.registry.get_room(&room_id).is_none() {
        return;
    }

    let (mut sender, mut receiver) = socket.split();

    while let Some(msg) = receiver.next().await {
        let text = match msg {
            Ok(Message::Text(t)) => t.to_string(),
            Ok(Message::Close(_)) | Err(_) => break,
            _ => continue,
        };

        let request: crate::services::mesh::time_sync::TimeSyncRequest =
            match serde_json::from_str(&text) {
                Ok(r) => r,
                Err(_) => continue,
            };

        let response = state.time_sync.process_sync(request);

        if sender
            .send(Message::Text(
                serde_json::to_string(&response).unwrap().into(),
            ))
            .await
            .is_err()
        {
            break;
        }
    }
}
