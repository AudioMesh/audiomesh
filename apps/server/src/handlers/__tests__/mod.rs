#[path = "mesh.test.rs"]
mod mesh_test;

// Common test helper imports
use crate::config::AppConfig;
use crate::handlers::create_router;
use axum::{
    body::{Body, Bytes},
    http::{Request, StatusCode},
    Router,
};
use serde_json::Value;
use tower::ServiceExt; // for oneshot

/// Default test configuration with permissive limits.
fn test_config() -> AppConfig {
    AppConfig {
        host: "127.0.0.1".to_string(),
        port: 50065,
        max_rooms: 100,
        max_nodes_per_room: 50,
        sfu_buffer_size: 256,
        max_children_per_node: 3,
    }
}

// Helper function to create the test router
fn setup_app() -> Router {
    create_router(&test_config())
}

// Helper to send a general request to the router
async fn send_request(app: Router, method: &str, uri: &str, body: Body) -> (StatusCode, Bytes) {
    let req = Request::builder()
        .method(method)
        .uri(uri)
        .header("content-type", "application/json")
        .body(body)
        .unwrap();

    let res = app.oneshot(req).await.unwrap();
    let status = res.status();
    let body_bytes = axum::body::to_bytes(res.into_body(), 1024 * 1024)
        .await
        .unwrap();
    (status, body_bytes)
}

// Helper to send a POST request with JSON payload
async fn post_json(app: Router, uri: &str, payload: Value) -> (StatusCode, Value) {
    let body = Body::from(payload.to_string());
    let (status, bytes) = send_request(app, "POST", uri, body).await;
    let json_val: Value = serde_json::from_slice(&bytes).unwrap_or(Value::Null);
    (status, json_val)
}

// Helper to send a GET request
async fn get_json(app: Router, uri: &str) -> (StatusCode, Value) {
    let (status, bytes) = send_request(app, "GET", uri, Body::empty()).await;
    let json_val: Value = serde_json::from_slice(&bytes).unwrap_or(Value::Null);
    (status, json_val)
}

// Helper to send a DELETE request
async fn delete_json(app: Router, uri: &str) -> (StatusCode, Value) {
    let (status, bytes) = send_request(app, "DELETE", uri, Body::empty()).await;
    let json_val: Value = serde_json::from_slice(&bytes).unwrap_or(Value::Null);
    (status, json_val)
}
