import { apiClient } from './apiClient';
import { Peer, MeshMode } from './types';

export interface TimeSyncStats {
  rttMs: number;
  offsetUs: number; // local clock offset in microseconds: ServerTime = LocalTime + offsetUs
}

export class MeshConnection {
  private roomId: string;
  private peerId: string;
  private signalingSocket: WebSocket | null = null;
  private sfuSocket: WebSocket | null = null;
  private syncSocket: WebSocket | null = null;
  private syncIntervalId: any = null;

  // Callbacks
  public onPeersUpdated?: (peers: any[]) => void;
  public onTopologyAssigned?: (parentPeerId: string) => void;
  public onPeerLeft?: (peerId: string) => void;
  public onError?: (message: string) => void;
  public onTimeSyncUpdated?: (stats: TimeSyncStats) => void;
  public onSfuAudioFrame?: (data: ArrayBuffer) => void;

  public onSignalingStatusChanged?: (status: 'disconnected' | 'connecting' | 'connected') => void;
  public onTimeSyncStatusChanged?: (status: 'disconnected' | 'active') => void;
  public onSfuStatusChanged?: (status: 'disconnected' | 'connected') => void;

  constructor(roomId: string, peerId: string) {
    this.roomId = roomId;
    this.peerId = peerId;
  }

  /**
   * Connect to the WebRTC signaling WebSocket.
   */
  public connectSignaling(displayName: string, deviceType: string, connectionType: string) {
    this.disconnectSignaling();

    if (this.onSignalingStatusChanged) this.onSignalingStatusChanged('connecting');

    const url = apiClient.getSignalingWsUrl(this.roomId);
    this.signalingSocket = new WebSocket(url);

    this.signalingSocket.onopen = () => {
      if (this.onSignalingStatusChanged) this.onSignalingStatusChanged('connected');
      // Send Join payload
      const joinMsg = {
        type: 'join',
        peer_id: this.peerId,
        display_name: displayName,
        device_type: deviceType,
        connection_type: connectionType,
      };
      this.signalingSocket?.send(JSON.stringify(joinMsg));
    };

    this.signalingSocket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        switch (msg.type) {
          case 'peers':
            if (this.onPeersUpdated) this.onPeersUpdated(msg.peers);
            break;
          case 'topology_assign':
            if (this.onTopologyAssigned) this.onTopologyAssigned(msg.parent_peer_id);
            break;
          case 'peer_left':
            if (this.onPeerLeft) this.onPeerLeft(msg.peer_id);
            break;
          case 'error':
            if (this.onError) this.onError(msg.message);
            break;
        }
      } catch (e) {
        console.error('Failed to parse signaling socket message', e);
      }
    };

    this.signalingSocket.onclose = () => {
      this.signalingSocket = null;
      if (this.onSignalingStatusChanged) this.onSignalingStatusChanged('disconnected');
    };

    this.signalingSocket.onerror = (err) => {
      console.error('Signaling WebSocket error:', err);
      if (this.onSignalingStatusChanged) this.onSignalingStatusChanged('disconnected');
    };
  }

  public disconnectSignaling() {
    if (this.signalingSocket) {
      this.signalingSocket.close();
      this.signalingSocket = null;
    }
  }

  /**
   * Send WebRTC Offer signaling message.
   */
  public sendOffer(toPeerId: string, sdp: string) {
    this.signalingSocket?.send(
      JSON.stringify({
        type: 'offer',
        from_peer_id: this.peerId,
        to_peer_id: toPeerId,
        sdp,
      })
    );
  }

  /**
   * Send WebRTC Answer signaling message.
   */
  public sendAnswer(toPeerId: string, sdp: string) {
    this.signalingSocket?.send(
      JSON.stringify({
        type: 'answer',
        from_peer_id: this.peerId,
        to_peer_id: toPeerId,
        sdp,
      })
    );
  }

  /**
   * Send WebRTC ICE Candidate signaling message.
   */
  public sendIceCandidate(toPeerId: string, candidate: string) {
    this.signalingSocket?.send(
      JSON.stringify({
        type: 'ice',
        from_peer_id: this.peerId,
        to_peer_id: toPeerId,
        candidate,
      })
    );
  }

  /**
   * Connect to the NTP Time Sync socket to compute local clock offset.
   */
  public connectTimeSync(intervalMs: number = 3000) {
    this.disconnectTimeSync();

    const url = apiClient.getSyncWsUrl(this.roomId);
    this.syncSocket = new WebSocket(url);

    this.syncSocket.onopen = () => {
      if (this.onTimeSyncStatusChanged) this.onTimeSyncStatusChanged('active');
      // Start polling clock sync
      this.syncIntervalId = setInterval(() => {
        const clientSendUs = Date.now() * 1000;
        const req = { client_send_us: clientSendUs };
        this.syncSocket?.send(JSON.stringify(req));
      }, intervalMs);
    };

    this.syncSocket.onmessage = (event) => {
      const t4 = Date.now() * 1000; // Local receive time in microsec
      try {
        const res = JSON.parse(event.data);
        const t1 = res.client_send_us;
        const t2 = res.server_recv_us;
        const t3 = res.server_send_us;

        // NTP Calculations
        const rttUs = (t4 - t1) - (t3 - t2);
        const offsetUs = Math.round(((t2 - t1) + (t3 - t4)) / 2);

        if (this.onTimeSyncUpdated) {
          this.onTimeSyncUpdated({
            rttMs: rttUs / 1000,
            offsetUs,
          });
        }
      } catch (e) {
        console.error('Failed to parse time sync message', e);
      }
    };

    this.syncSocket.onclose = () => {
      this.disconnectTimeSync();
    };

    this.syncSocket.onerror = (err) => {
      console.error('Time Sync WebSocket error:', err);
      this.disconnectTimeSync();
    };
  }

  public disconnectTimeSync() {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
      this.syncIntervalId = null;
    }
    if (this.syncSocket) {
      const socket = this.syncSocket;
      this.syncSocket = null;
      socket.close();
    }
    if (this.onTimeSyncStatusChanged) {
      this.onTimeSyncStatusChanged('disconnected');
    }
  }

  /**
   * Connect to SFU WebSocket as uplink (host) or downlink (client).
   */
  public connectSfu(role: 'host' | 'client') {
    this.disconnectSfu();

    const url = apiClient.getSfuWsUrl(this.roomId);
    this.sfuSocket = new WebSocket(url);
    this.sfuSocket.binaryType = 'arraybuffer';

    this.sfuSocket.onopen = () => {
      if (this.onSfuStatusChanged) this.onSfuStatusChanged('connected');
      // Send handshake role identification
      const roleMsg = { role };
      this.sfuSocket?.send(JSON.stringify(roleMsg));
    };

    this.sfuSocket.onmessage = (event) => {
      if (event.data instanceof ArrayBuffer) {
        if (this.onSfuAudioFrame) {
          this.onSfuAudioFrame(event.data);
        }
      }
    };

    this.sfuSocket.onclose = () => {
      this.sfuSocket = null;
      if (this.onSfuStatusChanged) this.onSfuStatusChanged('disconnected');
    };

    this.sfuSocket.onerror = (err) => {
      console.error('SFU WebSocket error:', err);
      if (this.onSfuStatusChanged) this.onSfuStatusChanged('disconnected');
    };
  }

  /**
   * Send binary audio frame (Host only)
   * Frame Format: [8-byte timestamp][Raw Opus Audio Data]
   */
  public sendSfuAudioFrame(data: ArrayBuffer): boolean {
    if (this.sfuSocket && this.sfuSocket.readyState === WebSocket.OPEN) {
      this.sfuSocket.send(data);
      return true;
    }
    return false;
  }

  public disconnectSfu() {
    if (this.sfuSocket) {
      const socket = this.sfuSocket;
      this.sfuSocket = null;
      socket.close();
    }
    if (this.onSfuStatusChanged) {
      this.onSfuStatusChanged('disconnected');
    }
  }

  /**
   * Cleanup all sockets.
   */
  public disconnectAll() {
    this.disconnectSignaling();
    this.disconnectTimeSync();
    this.disconnectSfu();
  }
}
