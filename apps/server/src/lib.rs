pub mod config;
pub mod handlers;
pub mod services;

use config::AppConfig;
use handlers::create_router;
use std::net::SocketAddr;

pub async fn run_server(addr: SocketAddr) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    // Load configuration
    let config = AppConfig::from_env();
    tracing::info!("Loaded server configuration: {:?}", config);

    // Create Axum Router with mesh services
    let app = create_router(&config);

    tracing::info!("AudioMesh Rust backend server listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(&addr).await?;

    axum::serve(listener, app).await?;

    Ok(())
}
