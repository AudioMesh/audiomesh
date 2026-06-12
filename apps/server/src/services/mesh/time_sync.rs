use serde::{Deserialize, Serialize};
use std::time::Instant;

/// Request payload sent by clients for time synchronization.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimeSyncRequest {
    /// Timestamp (in microseconds since some client epoch) when the client sent this request.
    pub client_send_us: i64,
}

/// Response payload returned by the server for time synchronization.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimeSyncResponse {
    /// Echo of the client's send timestamp.
    pub client_send_us: i64,
    /// Server timestamp (in microseconds since server epoch) when the request was received.
    pub server_recv_us: i64,
    /// Server timestamp (in microseconds since server epoch) when the response is sent.
    pub server_send_us: i64,
}

/// Server-side time sync service.
///
/// Provides a reference clock for all peers in a mesh room.
/// Clients perform multiple round-trip exchanges and compute their clock offset:
///
/// ```text
/// offset = ((server_recv - client_send) + (server_send - client_recv)) / 2
/// ```
///
/// This follows the NTP symmetric algorithm. Multiple rounds are averaged
/// for sub-millisecond precision on local networks.
#[derive(Debug)]
pub struct TimeSyncService {
    /// The instant when this service was created, used as the server's epoch.
    epoch: Instant,
}

impl TimeSyncService {
    pub fn new() -> Self {
        Self {
            epoch: Instant::now(),
        }
    }

    /// Returns the current server time in microseconds since the server epoch.
    pub fn now_us(&self) -> i64 {
        self.epoch.elapsed().as_micros() as i64
    }

    /// Processes a time sync request and produces a response.
    pub fn process_sync(&self, request: TimeSyncRequest) -> TimeSyncResponse {
        let server_recv_us = self.now_us();

        TimeSyncResponse {
            client_send_us: request.client_send_us,
            server_recv_us,
            server_send_us: self.now_us(),
        }
    }
}

impl Default for TimeSyncService {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::thread::sleep;
    use std::time::Duration;

    #[test]
    fn test_time_sync_response_has_correct_echo() {
        let service = TimeSyncService::new();
        let request = TimeSyncRequest {
            client_send_us: 123456789,
        };

        let response = service.process_sync(request);
        assert_eq!(response.client_send_us, 123456789);
    }

    #[test]
    fn test_server_timestamps_are_ordered() {
        let service = TimeSyncService::new();

        // Small delay to ensure measurable time difference
        sleep(Duration::from_millis(1));

        let request = TimeSyncRequest {
            client_send_us: 1000,
        };

        let response = service.process_sync(request);
        assert!(response.server_recv_us > 0);
        assert!(response.server_send_us >= response.server_recv_us);
    }

    #[test]
    fn test_monotonic_clock() {
        let service = TimeSyncService::new();

        let t1 = service.now_us();
        sleep(Duration::from_millis(1));
        let t2 = service.now_us();

        assert!(t2 > t1);
    }
}
