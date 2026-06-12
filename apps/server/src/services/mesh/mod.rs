pub mod room_registry;
pub mod time_sync;
pub mod topology;

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

/// The mesh operating mode for a room.
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum MeshMode {
    #[serde(rename = "direct_p2p")]
    DirectP2P,
    #[serde(rename = "daisy_chain")]
    DaisyChain,
    #[serde(rename = "sfu")]
    SFU,
}

/// A mesh audio room — an isolated session where devices connect to play synchronized audio.
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Room {
    pub id: String,
    pub name: String,
    pub mode: MeshMode,
    pub host_peer_id: String,
    pub created_at: DateTime<Utc>,
    pub max_nodes: usize,
}

/// The type of physical device in the mesh.
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum DeviceType {
    Desktop,
    Phone,
    Tablet,
    Speaker,
    Browser,
}

/// The transport protocol a peer is using.
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum ConnectionType {
    WiFi,
    Bluetooth,
    WebSocket,
}

/// A connected device (peer) in a mesh room.
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Peer {
    pub id: String,
    pub display_name: String,
    pub device_type: DeviceType,
    pub connection_type: ConnectionType,
    pub joined_at: DateTime<Utc>,
    /// In Daisy-Chain mode, the peer this node receives audio from.
    /// `None` for the host node or in non-daisy-chain modes.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub parent_peer_id: Option<String>,
}

/// The health status of a connection edge between two peers.
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum EdgeStatus {
    Connecting,
    Synced,
    Degraded,
    Disconnected,
}

/// A directed connection edge between two peers in the topology graph.
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct TopologyEdge {
    pub from_peer_id: String,
    pub to_peer_id: String,
    /// Measured round-trip time in milliseconds between the two peers.
    pub rtt_ms: Option<f64>,
    pub status: EdgeStatus,
}

/// Default node limits per mesh mode.
impl MeshMode {
    pub fn default_max_nodes(&self) -> usize {
        match self {
            MeshMode::DirectP2P => 15,
            MeshMode::DaisyChain => 30,
            MeshMode::SFU => 50,
        }
    }
}
