use super::{MeshMode, Peer, Room};
use chrono::Utc;
use dashmap::DashMap;
use std::sync::Arc;
use tokio::sync::broadcast;
use uuid::Uuid;

/// Thread-safe room registry backed by DashMap.
/// Manages the lifecycle of rooms and their connected peers.
#[derive(Debug)]
pub struct RoomRegistry {
    rooms: DashMap<String, Room>,
    peers: DashMap<String, Vec<Peer>>,
    /// Broadcast channels for SFU audio forwarding (room_id -> sender).
    sfu_channels: DashMap<String, broadcast::Sender<Arc<Vec<u8>>>>,
    /// Maximum number of concurrent rooms.
    pub max_rooms: usize,
    /// Default broadcast channel buffer size.
    pub sfu_buffer_size: usize,
}

impl RoomRegistry {
    /// Creates a new RoomRegistry with the given limits.
    pub fn new(max_rooms: usize, sfu_buffer_size: usize) -> Self {
        Self {
            rooms: DashMap::new(),
            peers: DashMap::new(),
            sfu_channels: DashMap::new(),
            max_rooms,
            sfu_buffer_size,
        }
    }

    /// Creates a new room and returns it.
    pub fn create_room(
        &self,
        name: String,
        mode: MeshMode,
        host_peer_id: String,
        max_nodes: Option<usize>,
    ) -> Result<Room, String> {
        if self.rooms.len() >= self.max_rooms {
            return Err(format!(
                "Maximum number of rooms ({}) reached.",
                self.max_rooms
            ));
        }

        let id = Uuid::new_v4().to_string();
        let max_nodes = max_nodes.unwrap_or_else(|| mode.default_max_nodes());

        let room = Room {
            id: id.clone(),
            name,
            mode,
            host_peer_id,
            created_at: Utc::now(),
            max_nodes,
        };

        self.rooms.insert(id.clone(), room.clone());
        self.peers.insert(id.clone(), Vec::new());

        // Create a broadcast channel for SFU mode
        let (tx, _rx) = broadcast::channel(self.sfu_buffer_size);
        self.sfu_channels.insert(id, tx);

        Ok(room)
    }

    /// Returns a room by ID.
    pub fn get_room(&self, room_id: &str) -> Option<Room> {
        self.rooms.get(room_id).map(|r| r.value().clone())
    }

    /// Lists all active rooms.
    pub fn list_rooms(&self) -> Vec<Room> {
        self.rooms.iter().map(|r| r.value().clone()).collect()
    }

    /// Deletes a room and all associated state.
    pub fn delete_room(&self, room_id: &str) -> bool {
        let removed = self.rooms.remove(room_id).is_some();
        self.peers.remove(room_id);
        self.sfu_channels.remove(room_id);
        removed
    }

    /// Adds a peer to a room.
    pub fn add_peer(&self, room_id: &str, peer: Peer) -> Result<(), String> {
        let room = self
            .rooms
            .get(room_id)
            .ok_or_else(|| format!("Room '{}' not found.", room_id))?;

        let mut peers = self
            .peers
            .get_mut(room_id)
            .ok_or_else(|| format!("Room '{}' peer list not found.", room_id))?;

        if peers.len() >= room.max_nodes {
            return Err(format!(
                "Room '{}' is full ({}/{} nodes).",
                room_id,
                peers.len(),
                room.max_nodes
            ));
        }

        // Prevent duplicate peer IDs
        if peers.iter().any(|p| p.id == peer.id) {
            return Err(format!(
                "Peer '{}' already exists in room '{}'.",
                peer.id, room_id
            ));
        }

        peers.push(peer);
        Ok(())
    }

    /// Removes a peer from a room by peer ID.
    pub fn remove_peer(&self, room_id: &str, peer_id: &str) -> bool {
        if let Some(mut peers) = self.peers.get_mut(room_id) {
            let before = peers.len();
            peers.retain(|p| p.id != peer_id);
            peers.len() < before
        } else {
            false
        }
    }

    /// Gets all peers in a room.
    pub fn get_peers(&self, room_id: &str) -> Vec<Peer> {
        self.peers
            .get(room_id)
            .map(|p| p.value().clone())
            .unwrap_or_default()
    }

    /// Returns the SFU broadcast sender for a room (for the host to publish audio).
    pub fn get_sfu_sender(&self, room_id: &str) -> Option<broadcast::Sender<Arc<Vec<u8>>>> {
        self.sfu_channels.get(room_id).map(|s| s.value().clone())
    }

    /// Subscribes to the SFU broadcast channel for a room (for clients to receive audio).
    pub fn subscribe_sfu(&self, room_id: &str) -> Option<broadcast::Receiver<Arc<Vec<u8>>>> {
        self.sfu_channels.get(room_id).map(|s| s.subscribe())
    }

    /// Updates a peer's parent_peer_id (used in Daisy-Chain mode for topology assignment).
    pub fn set_peer_parent(
        &self,
        room_id: &str,
        peer_id: &str,
        parent_peer_id: Option<String>,
    ) -> bool {
        if let Some(mut peers) = self.peers.get_mut(room_id) {
            if let Some(peer) = peers.iter_mut().find(|p| p.id == peer_id) {
                peer.parent_peer_id = parent_peer_id;
                return true;
            }
        }
        false
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::services::mesh::{ConnectionType, DeviceType, MeshMode};

    fn make_peer(id: &str, name: &str) -> Peer {
        Peer {
            id: id.to_string(),
            display_name: name.to_string(),
            device_type: DeviceType::Phone,
            connection_type: ConnectionType::WiFi,
            joined_at: Utc::now(),
            parent_peer_id: None,
        }
    }

    #[test]
    fn test_create_and_get_room() {
        let registry = RoomRegistry::new(10, 256);
        let room = registry
            .create_room(
                "Test Room".into(),
                MeshMode::SFU,
                "host-1".into(),
                None,
            )
            .unwrap();

        assert_eq!(room.name, "Test Room");
        assert_eq!(room.mode, MeshMode::SFU);
        assert_eq!(room.max_nodes, 50);

        let fetched = registry.get_room(&room.id).unwrap();
        assert_eq!(fetched.id, room.id);
    }

    #[test]
    fn test_list_rooms() {
        let registry = RoomRegistry::new(10, 256);
        registry
            .create_room("Room A".into(), MeshMode::DirectP2P, "host-1".into(), None)
            .unwrap();
        registry
            .create_room("Room B".into(), MeshMode::SFU, "host-2".into(), None)
            .unwrap();

        let rooms = registry.list_rooms();
        assert_eq!(rooms.len(), 2);
    }

    #[test]
    fn test_delete_room() {
        let registry = RoomRegistry::new(10, 256);
        let room = registry
            .create_room("Temp".into(), MeshMode::SFU, "host-1".into(), None)
            .unwrap();

        assert!(registry.delete_room(&room.id));
        assert!(registry.get_room(&room.id).is_none());
    }

    #[test]
    fn test_max_rooms_limit() {
        let registry = RoomRegistry::new(1, 256);
        registry
            .create_room("Room 1".into(), MeshMode::SFU, "host-1".into(), None)
            .unwrap();
        let result = registry.create_room("Room 2".into(), MeshMode::SFU, "host-2".into(), None);
        assert!(result.is_err());
    }

    #[test]
    fn test_add_and_get_peers() {
        let registry = RoomRegistry::new(10, 256);
        let room = registry
            .create_room("Test".into(), MeshMode::SFU, "host-1".into(), None)
            .unwrap();

        registry
            .add_peer(&room.id, make_peer("peer-1", "iPhone 15"))
            .unwrap();
        registry
            .add_peer(&room.id, make_peer("peer-2", "iPad Pro"))
            .unwrap();

        let peers = registry.get_peers(&room.id);
        assert_eq!(peers.len(), 2);
        assert_eq!(peers[0].display_name, "iPhone 15");
    }

    #[test]
    fn test_remove_peer() {
        let registry = RoomRegistry::new(10, 256);
        let room = registry
            .create_room("Test".into(), MeshMode::SFU, "host-1".into(), None)
            .unwrap();

        registry
            .add_peer(&room.id, make_peer("peer-1", "Phone"))
            .unwrap();
        assert!(registry.remove_peer(&room.id, "peer-1"));
        assert_eq!(registry.get_peers(&room.id).len(), 0);
    }

    #[test]
    fn test_duplicate_peer_rejected() {
        let registry = RoomRegistry::new(10, 256);
        let room = registry
            .create_room("Test".into(), MeshMode::SFU, "host-1".into(), None)
            .unwrap();

        registry
            .add_peer(&room.id, make_peer("peer-1", "Phone"))
            .unwrap();
        let result = registry.add_peer(&room.id, make_peer("peer-1", "Phone Again"));
        assert!(result.is_err());
    }

    #[test]
    fn test_max_nodes_limit() {
        let registry = RoomRegistry::new(10, 256);
        let room = registry
            .create_room("Tiny".into(), MeshMode::SFU, "host-1".into(), Some(2))
            .unwrap();

        registry
            .add_peer(&room.id, make_peer("p1", "Dev 1"))
            .unwrap();
        registry
            .add_peer(&room.id, make_peer("p2", "Dev 2"))
            .unwrap();
        let result = registry.add_peer(&room.id, make_peer("p3", "Dev 3"));
        assert!(result.is_err());
    }

    #[test]
    fn test_sfu_channel() {
        let registry = RoomRegistry::new(10, 256);
        let room = registry
            .create_room("SFU Test".into(), MeshMode::SFU, "host-1".into(), None)
            .unwrap();

        let sender = registry.get_sfu_sender(&room.id);
        assert!(sender.is_some());

        let mut receiver = registry.subscribe_sfu(&room.id).unwrap();

        let data = Arc::new(vec![1u8, 2, 3, 4]);
        sender.unwrap().send(data.clone()).unwrap();

        let received = receiver.try_recv().unwrap();
        assert_eq!(*received, vec![1u8, 2, 3, 4]);
    }
}
