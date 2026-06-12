use crate::config::AppConfig;
use crate::services::mesh::{
    room_registry::RoomRegistry, time_sync::TimeSyncService, topology::TopologyManager,
};
use axum::{
    response::IntoResponse,
    routing::{delete, get, post},
    Json, Router,
};
use std::sync::Arc;
use tower_http::cors::{Any, CorsLayer};

pub mod mesh;

#[cfg(test)]
mod __tests__;

async fn health_check() -> impl IntoResponse {
    (axum::http::StatusCode::OK, Json(serde_json::json!({ "status": "ok" })))
}

pub fn create_router(config: &AppConfig) -> Router {
    // Setup CORS layer allowing local development requests
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Initialize mesh services
    let mesh_state = mesh::MeshState {
        registry: Arc::new(RoomRegistry::new(config.max_rooms, config.sfu_buffer_size)),
        topology: Arc::new(TopologyManager::new(config.max_children_per_node)),
        time_sync: Arc::new(TimeSyncService::new()),
    };

    // Mesh routes (no auth required — mesh uses its own room-level access)
    let mesh_routes = Router::new()
        .route("/mesh/rooms", post(mesh::create_room))
        .route("/mesh/rooms", get(mesh::list_rooms))
        .route("/mesh/rooms/:id", get(mesh::get_room))
        .route("/mesh/rooms/:id", delete(mesh::delete_room))
        .route("/mesh/rooms/:id/topology", get(mesh::get_topology))
        .route("/mesh/rooms/:id/topology/rtt", post(mesh::report_rtt))
        // WebSocket endpoints
        .route("/ws/signaling/:room_id", get(mesh::ws_signaling))
        .route("/ws/sfu/:room_id", get(mesh::ws_sfu))
        .route("/ws/sync/:room_id", get(mesh::ws_sync))
        .with_state(mesh_state);

    Router::new()
        // Health check endpoint
        .route("/health", get(health_check))
        // Merge mesh routes
        .merge(mesh_routes)
        .layer(cors)
        .layer(axum::extract::DefaultBodyLimit::max(20 * 1024 * 1024))
}
