use std::env;

#[derive(Clone, Debug)]
pub struct AppConfig {
    pub host: String,
    pub port: u16,
    /// Maximum number of concurrent mesh rooms.
    pub max_rooms: usize,
    /// Maximum number of nodes per room (default, can be overridden per room).
    pub max_nodes_per_room: usize,
    /// Broadcast channel buffer size for SFU audio forwarding.
    pub sfu_buffer_size: usize,
    /// Maximum children per node in Daisy-Chain topology.
    pub max_children_per_node: usize,
}

impl AppConfig {
    pub fn from_env() -> Self {
        // Load configuration from environment variables, using sensible defaults
        let host = env::var("HOST").unwrap_or_else(|_| "127.0.0.1".to_string());

        let port = env::var("PORT")
            .ok()
            .and_then(|p| p.parse().ok())
            .unwrap_or(50065);

        let max_rooms = env::var("MAX_ROOMS")
            .ok()
            .and_then(|v| v.parse().ok())
            .unwrap_or(10);

        let max_nodes_per_room = env::var("MAX_NODES_PER_ROOM")
            .ok()
            .and_then(|v| v.parse().ok())
            .unwrap_or(50);

        let sfu_buffer_size = env::var("SFU_BUFFER_SIZE")
            .ok()
            .and_then(|v| v.parse().ok())
            .unwrap_or(256);

        let max_children_per_node = env::var("MAX_CHILDREN_PER_NODE")
            .ok()
            .and_then(|v| v.parse().ok())
            .unwrap_or(3);

        Self {
            host,
            port,
            max_rooms,
            max_nodes_per_room,
            sfu_buffer_size,
            max_children_per_node,
        }
    }
}
