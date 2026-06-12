use super::*;

#[tokio::test]
async fn test_create_room() {
    let app = setup_app();
    let (status, body) = post_json(
        app,
        "/mesh/rooms",
        serde_json::json!({
            "name": "Living Room Party",
            "mode": "sfu",
            "host_peer_id": "host-device-1"
        }),
    )
    .await;

    assert_eq!(status, StatusCode::CREATED);
    assert_eq!(body["name"], "Living Room Party");
    assert_eq!(body["mode"], "sfu");
    assert_eq!(body["host_peer_id"], "host-device-1");
    assert!(body["id"].is_string());
    assert_eq!(body["max_nodes"], 50); // SFU default
}

#[tokio::test]
async fn test_create_room_direct_p2p_defaults() {
    let app = setup_app();
    let (status, body) = post_json(
        app,
        "/mesh/rooms",
        serde_json::json!({
            "name": "P2P Room",
            "mode": "direct_p2p",
            "host_peer_id": "host-1"
        }),
    )
    .await;

    assert_eq!(status, StatusCode::CREATED);
    assert_eq!(body["max_nodes"], 15); // DirectP2P default
}

#[tokio::test]
async fn test_create_room_daisy_chain_defaults() {
    let app = setup_app();
    let (status, body) = post_json(
        app,
        "/mesh/rooms",
        serde_json::json!({
            "name": "Daisy Room",
            "mode": "daisy_chain",
            "host_peer_id": "host-1"
        }),
    )
    .await;

    assert_eq!(status, StatusCode::CREATED);
    assert_eq!(body["max_nodes"], 30); // DaisyChain default
}

#[tokio::test]
async fn test_create_room_custom_max_nodes() {
    let app = setup_app();
    let (status, body) = post_json(
        app,
        "/mesh/rooms",
        serde_json::json!({
            "name": "Small Room",
            "mode": "sfu",
            "host_peer_id": "host-1",
            "max_nodes": 5
        }),
    )
    .await;

    assert_eq!(status, StatusCode::CREATED);
    assert_eq!(body["max_nodes"], 5);
}

#[tokio::test]
async fn test_list_rooms() {
    let app = setup_app();

    // Create two rooms
    let _ = post_json(
        app.clone(),
        "/mesh/rooms",
        serde_json::json!({
            "name": "Room A",
            "mode": "sfu",
            "host_peer_id": "host-1"
        }),
    )
    .await;

    let _ = post_json(
        app.clone(),
        "/mesh/rooms",
        serde_json::json!({
            "name": "Room B",
            "mode": "direct_p2p",
            "host_peer_id": "host-2"
        }),
    )
    .await;

    let (status, body) = get_json(app, "/mesh/rooms").await;

    assert_eq!(status, StatusCode::OK);
    assert!(body.as_array().unwrap().len() >= 2);
}

#[tokio::test]
async fn test_get_room() {
    let app = setup_app();

    let (_, created) = post_json(
        app.clone(),
        "/mesh/rooms",
        serde_json::json!({
            "name": "Get Test",
            "mode": "sfu",
            "host_peer_id": "host-1"
        }),
    )
    .await;

    let room_id = created["id"].as_str().unwrap();
    let (status, body) = get_json(app, &format!("/mesh/rooms/{}", room_id)).await;

    assert_eq!(status, StatusCode::OK);
    assert_eq!(body["room"]["name"], "Get Test");
    assert!(body["peers"].as_array().unwrap().is_empty());
}

#[tokio::test]
async fn test_get_room_not_found() {
    let app = setup_app();
    let (status, body) = get_json(app, "/mesh/rooms/nonexistent-id").await;

    assert_eq!(status, StatusCode::NOT_FOUND);
    assert!(body["error"].as_str().unwrap().contains("not found"));
}

#[tokio::test]
async fn test_delete_room() {
    let app = setup_app();

    let (_, created) = post_json(
        app.clone(),
        "/mesh/rooms",
        serde_json::json!({
            "name": "Delete Test",
            "mode": "sfu",
            "host_peer_id": "host-1"
        }),
    )
    .await;

    let room_id = created["id"].as_str().unwrap();
    let (status, body) = delete_json(app.clone(), &format!("/mesh/rooms/{}", room_id)).await;

    assert_eq!(status, StatusCode::OK);
    assert_eq!(body["success"], true);

    // Verify it's gone
    let (status, _) = get_json(app, &format!("/mesh/rooms/{}", room_id)).await;
    assert_eq!(status, StatusCode::NOT_FOUND);
}

#[tokio::test]
async fn test_delete_room_not_found() {
    let app = setup_app();
    let (status, _) = delete_json(app, "/mesh/rooms/nonexistent-id").await;
    assert_eq!(status, StatusCode::NOT_FOUND);
}

#[tokio::test]
async fn test_get_topology_empty() {
    let app = setup_app();

    let (_, created) = post_json(
        app.clone(),
        "/mesh/rooms",
        serde_json::json!({
            "name": "Topo Test",
            "mode": "daisy_chain",
            "host_peer_id": "host-1"
        }),
    )
    .await;

    let room_id = created["id"].as_str().unwrap();
    let (status, body) = get_json(app, &format!("/mesh/rooms/{}/topology", room_id)).await;

    assert_eq!(status, StatusCode::OK);
    assert!(body["edges"].as_array().unwrap().is_empty());
}

#[tokio::test]
async fn test_get_topology_not_found() {
    let app = setup_app();
    let (status, _) = get_json(app, "/mesh/rooms/nonexistent/topology").await;
    assert_eq!(status, StatusCode::NOT_FOUND);
}

#[tokio::test]
async fn test_report_rtt() {
    let app = setup_app();

    let (_, created) = post_json(
        app.clone(),
        "/mesh/rooms",
        serde_json::json!({
            "name": "RTT Test",
            "mode": "daisy_chain",
            "host_peer_id": "host-1"
        }),
    )
    .await;

    let room_id = created["id"].as_str().unwrap();
    let (status, body) = post_json(
        app,
        &format!("/mesh/rooms/{}/topology/rtt", room_id),
        serde_json::json!({
            "from_peer_id": "host-1",
            "to_peer_id": "peer-1",
            "rtt_ms": 12.5
        }),
    )
    .await;

    assert_eq!(status, StatusCode::OK);
    assert_eq!(body["success"], true);
}

#[tokio::test]
async fn test_report_rtt_room_not_found() {
    let app = setup_app();
    let (status, _) = post_json(
        app,
        "/mesh/rooms/nonexistent/topology/rtt",
        serde_json::json!({
            "from_peer_id": "a",
            "to_peer_id": "b",
            "rtt_ms": 10.0
        }),
    )
    .await;

    assert_eq!(status, StatusCode::NOT_FOUND);
}

#[tokio::test]
async fn test_health_check_still_works() {
    let app = setup_app();
    let (status, body) = get_json(app, "/health").await;

    assert_eq!(status, StatusCode::OK);
    assert_eq!(body["status"], "ok");
}
