import { useState, useEffect, useRef } from 'react';
import {
  Box,
  HStack,
  VStack,
  Text,
  Button,
  Heading,
  Flex,
  Badge,
  Input,
} from '@chakra-ui/react';
import { Logo } from '@assets';
import {
  apiClient,
  setApiBaseUrl,
  API_BASE_URL,
  MeshConnection,
  useRooms,
  useRoomDetails,
  useTopology,
} from '@services';

const Dashboard = () => {
  // ─────────────────────────────────────────────────────────────────────────────
  // LIVE CONNECTION STATE & LOGIC
  // ─────────────────────────────────────────────────────────────────────────────
  const [serverUrl, setServerUrl] = useState(API_BASE_URL);
  const [serverHealth, setServerHealth] = useState<'connected' | 'disconnected'>('disconnected');
  const [serverLatency, setServerLatency] = useState<number | null>(null);

  // Room Creation state
  const [newRoomName, setNewRoomName] = useState('My Live Session');
  const [newRoomMode, setNewRoomMode] = useState<'sfu' | 'daisy_chain' | 'direct_p2p'>('sfu');
  const [newRoomHostId, setNewRoomHostId] = useState(`peer-${Math.floor(Math.random() * 9000 + 1000)}`);
  const [newRoomMaxNodes, setNewRoomMaxNodes] = useState('50');

  // Rooms Query
  const { data: activeRooms, refetch: refetchRooms } = useRooms();

  // Active Connection state
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [myPeerId] = useState(`peer-${Math.floor(Math.random() * 9000 + 1000)}`);
  const [myDisplayName] = useState(`Device-${Math.floor(Math.random() * 900 + 100)}`);
  const [myDeviceType] = useState<'desktop' | 'phone' | 'tablet' | 'speaker' | 'browser'>('browser');
  const [myConnectionType] = useState<'wifi' | 'bluetooth' | 'websocket'>('websocket');

  // Live room details / topology
  const { data: activeRoomDetails } = useRoomDetails(activeRoomId);
  const { data: topologyData } = useTopology(activeRoomId);

  // WebSocket connection stats
  const [sigStatus, setSigStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [joinedPeers, setJoinedPeers] = useState<any[]>([]);
  const [assignedParent, setAssignedParent] = useState<string | null>(null);

  const [timeSyncStatus, setTimeSyncStatus] = useState<'disconnected' | 'active'>('disconnected');
  const [clockOffsetUs, setClockOffsetUs] = useState<number | null>(null);
  const [syncRttMs, setSyncRttMs] = useState<number | null>(null);

  const [sfuStatus, setSfuStatus] = useState<'disconnected' | 'connected'>('disconnected');
  const [sfuRole, setSfuRole] = useState<'host' | 'client'>('client');
  const [sfuReceivedCount, setSfuReceivedCount] = useState(0);
  const [sfuSentCount, setSfuSentCount] = useState(0);
  const [isStreamingFakeAudio, setIsStreamingFakeAudio] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [streamSource, setStreamSource] = useState<'melody' | 'loopback'>('melody');

  const connectionRef = useRef<MeshConnection | null>(null);

  // ── Loopback capture (host side) ──────────────────────────────────────────
  // We record the FULL getDisplayMedia stream (video+audio) using video/webm.
  // This avoids all track-extraction bugs: macOS ties audio lifetime to the
  // video track, so the full stream must stay intact while recording.
  const captureStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // ── MSE playback (client side) ────────────────────────────────────────────
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const mediaSourceRef = useRef<MediaSource | null>(null);
  const sourceBufferRef = useRef<SourceBuffer | null>(null);
  const mseQueueRef = useRef<ArrayBuffer[]>([]);
  const isAudioEnabledRef = useRef(false);

  // ── Melody synthesizer (host side, 'melody' stream source) ───────────────
  const SAMPLE_RATE = 44100;
  const SAMPLES_PER_FRAME = 882; // 20ms at 44100Hz
  const loopbackFifoRef = useRef<number[]>([]);
  const streamIntervalRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nextPlayTimeRef = useRef<number>(0);
  const anchorLocalTimeMsRef = useRef<number>(0);
  const anchorAudioTimeRef = useRef<number>(0);
  const clockOffsetUsRef = useRef<number | null>(null);
  const audioPhaseRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);

  const MELODY = [
    659.25, 622.25, 659.25, 622.25, 659.25, 493.88, 587.33, 523.25, 440.00, 0,
    261.63, 329.63, 440.00, 493.88, 0,
    329.63, 415.30, 493.88, 523.25, 0
  ];

  // Generate a synthesized melody frame (20ms) as raw float32 PCM samples
  const generateMusicFrame = (): ArrayBuffer => {
    // 8 bytes for timestamp + SAMPLES_PER_FRAME * 4 bytes for float32 PCM samples
    const buffer = new ArrayBuffer(8 + SAMPLES_PER_FRAME * 4);
    const view = new DataView(buffer);

    // Calculate synchronized NTP timestamp
    const offset = clockOffsetUsRef.current || 0;
    const ntpTimeUs = Date.now() * 1000 + offset;
    view.setBigUint64(0, BigInt(ntpTimeUs), false);

    // Determine current note frequency
    const noteDurationFrames = 12; // 240ms per note
    const currentFrame = frameCountRef.current;
    const noteIdx = Math.floor(currentFrame / noteDurationFrames) % MELODY.length;
    const freq = MELODY[noteIdx];

    let phase = audioPhaseRef.current;
    const floatView = new Float32Array(buffer, 8, SAMPLES_PER_FRAME);

    // Envelope calculation: simple linear decay over the note duration
    const totalSamplesInNote = noteDurationFrames * SAMPLES_PER_FRAME;
    const frameInNote = currentFrame % noteDurationFrames;
    const startSampleInNote = frameInNote * SAMPLES_PER_FRAME;

    for (let i = 0; i < SAMPLES_PER_FRAME; i++) {
      if (freq === 0) {
        floatView[i] = 0;
      } else {
        const sampleIdx = startSampleInNote + i;
        let envelope = Math.max(0, 1 - sampleIdx / totalSamplesInNote);
        
        // Attack envelope: linear ramp over the first 100 samples (9ms) to eliminate pops/clicks
        if (sampleIdx < 100) {
          envelope *= (sampleIdx / 100);
        }

        // Soft triangle wave provides a warm sound
        const t = (phase / (2 * Math.PI)) % 1.0;
        const triangle = 2.0 * Math.abs(2.0 * (t - Math.floor(t + 0.5))) - 1.0;
        
        floatView[i] = triangle * 0.12 * envelope;
        phase += (2 * Math.PI * freq) / SAMPLE_RATE;
      }
    }

    audioPhaseRef.current = phase % (2 * Math.PI);
    frameCountRef.current += 1;

    return buffer;
  };

  const generateLoopbackFrame = (): ArrayBuffer => {
    const buffer = new ArrayBuffer(8 + SAMPLES_PER_FRAME * 4);
    const view = new DataView(buffer);

    // Calculate synchronized NTP timestamp
    const offset = clockOffsetUsRef.current || 0;
    const ntpTimeUs = Date.now() * 1000 + offset;
    view.setBigUint64(0, BigInt(ntpTimeUs), false);

    const floatView = new Float32Array(buffer, 8, SAMPLES_PER_FRAME);
    const fifo = loopbackFifoRef.current;

    if (fifo.length >= SAMPLES_PER_FRAME) {
      for (let i = 0; i < SAMPLES_PER_FRAME; i++) {
        floatView[i] = fifo[i];
      }
      loopbackFifoRef.current = fifo.slice(SAMPLES_PER_FRAME);
    } else {
      for (let i = 0; i < SAMPLES_PER_FRAME; i++) {
        floatView[i] = i < fifo.length ? fifo[i] : 0;
      }
      loopbackFifoRef.current = [];
    }

    return buffer;
  };



  // ── MSE helpers ───────────────────────────────────────────────────────────

  /** Pick the best supported MIME type for audio streaming (Opus preferred). */
  const pickMimeType = (): string => {
    const candidates = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
    ];
    for (const mime of candidates) {
      if (MediaRecorder.isTypeSupported(mime) && MediaSource.isTypeSupported(mime)) {
        return mime;
      }
    }
    return 'audio/webm';
  };

  /** Drain the pending chunk queue into the SourceBuffer when it is not busy. */
  const drainMseQueue = () => {
    const sb = sourceBufferRef.current;
    const audio = audioElRef.current;
    if (!sb || sb.updating || mseQueueRef.current.length === 0) return;

    // Trim old buffered data (> 5s behind currentTime) to prevent QuotaExceededError.
    if (audio && sb.buffered.length > 0) {
      const trimTo = audio.currentTime - 5;
      if (trimTo > sb.buffered.start(0)) {
        try {
          sb.remove(sb.buffered.start(0), trimTo);
        } catch (_) {}
        return; // updateend will re-trigger drainMseQueue
      }
    }

    const chunk = mseQueueRef.current.shift()!;
    try {
      sb.appendBuffer(chunk);
    } catch (err: any) {
      if (err.name === 'QuotaExceededError') {
        mseQueueRef.current.unshift(chunk);
      } else {
        console.warn('[AudioMesh] MSE appendBuffer error:', err.message);
      }
    }
  };

  /** Bootstrap the MSE pipeline on the client side. */
  const initMsePlayback = () => {
    teardownMsePlayback();

    const mimeType = pickMimeType();
    console.log('[AudioMesh] MSE playback MIME:', mimeType);

    const ms = new MediaSource();
    mediaSourceRef.current = ms;
    mseQueueRef.current = [];

    const audio = new Audio();
    audio.autoplay = true;
    audioElRef.current = audio;

    ms.addEventListener('sourceopen', () => {
      try {
        const sb = ms.addSourceBuffer(mimeType);
        sourceBufferRef.current = sb;
        sb.addEventListener('updateend', drainMseQueue);
        drainMseQueue();
      } catch (err) {
        console.error('[AudioMesh] Failed to add SourceBuffer:', err);
      }
    });

    audio.src = URL.createObjectURL(ms);

    audio.addEventListener('stalled', () => {
      console.log('[AudioMesh] Playback stalled — resuming');
      audio.play().catch(() => {});
    });
    audio.addEventListener('error', () => {
      console.error('[AudioMesh] Playback error:', audio.error?.code, audio.error?.message);
    });

    audio.play().catch((e) => console.warn('[AudioMesh] play() blocked:', e));
  };

  /** Clean up MSE resources. */
  const teardownMsePlayback = () => {
    mseQueueRef.current = [];
    sourceBufferRef.current = null;
    if (mediaSourceRef.current && mediaSourceRef.current.readyState === 'open') {
      try { mediaSourceRef.current.endOfStream(); } catch (_) {}
    }
    mediaSourceRef.current = null;
    if (audioElRef.current) {
      audioElRef.current.pause();
      audioElRef.current.src = '';
      audioElRef.current = null;
    }
  };

  /** Called for every incoming binary WebSocket frame from the SFU. */
  const handleIncomingAudioChunk = (data: ArrayBuffer) => {
    if (!isAudioEnabledRef.current) return;
    mseQueueRef.current.push(data);
    drainMseQueue();
  };

  // ── Speaker toggle ────────────────────────────────────────────────────────
  const toggleAudioPlayback = () => {
    if (isAudioEnabledRef.current) {
      setIsAudioEnabled(false);
      isAudioEnabledRef.current = false;
      teardownMsePlayback();
    } else {
      setIsAudioEnabled(true);
      isAudioEnabledRef.current = true;
      // Init MSE eagerly inside user gesture so play() is permitted
      initMsePlayback();
    }
  };



  // Server health checker
  useEffect(() => {
    const checkHealth = async () => {
      const startTime = Date.now();
      try {
        const res = await apiClient.checkHealth();
        if (res && res.status === 'ok') {
          setServerHealth('connected');
          setServerLatency(Date.now() - startTime);
        } else {
          setServerHealth('disconnected');
          setServerLatency(null);
        }
      } catch (err) {
        setServerHealth('disconnected');
        setServerLatency(null);
      }
    };

    checkHealth();
    const id = setInterval(checkHealth, 5000);
    return () => clearInterval(id);
  }, [serverUrl]);

  // Update base URL
  const handleUpdateServerUrl = () => {
    setApiBaseUrl(serverUrl);
    refetchRooms();
  };

  // Create room
  const handleCreateRoom = async () => {
    try {
      const maxNodes = newRoomMaxNodes ? parseInt(newRoomMaxNodes, 10) : undefined;
      await apiClient.createRoom(newRoomName, newRoomMode, newRoomHostId, maxNodes);
      refetchRooms();
    } catch (e: any) {
      alert(`Error creating room: ${e.message}`);
    }
  };

  // Delete room
  const handleDeleteRoom = async (roomId: string) => {
    try {
      await apiClient.deleteRoom(roomId);
      if (activeRoomId === roomId) {
        handleDisconnectAll();
      }
      refetchRooms();
    } catch (e: any) {
      alert(`Error deleting room: ${e.message}`);
    }
  };

  // Connect to room (join WebSockets)
  const handleConnectToRoom = (roomId: string) => {
    handleDisconnectAll();
    setActiveRoomId(roomId);

    const conn = new MeshConnection(roomId, myPeerId);
    connectionRef.current = conn;

    // 1. Signaling
    setSigStatus('connecting');
    conn.onSignalingStatusChanged = (status) => {
      setSigStatus(status);
    };
    conn.onPeersUpdated = (peers) => {
      setJoinedPeers(peers);
    };
    conn.onTopologyAssigned = (parent) => {
      setAssignedParent(parent);
    };
    conn.onPeerLeft = (peerId) => {
      console.log(`Peer left: ${peerId}`);
    };
    conn.onError = (msg) => {
      console.error(`Signaling error: ${msg}`);
    };
    conn.connectSignaling(myDisplayName, myDeviceType, myConnectionType);

    // 2. Time Sync
    setTimeSyncStatus('disconnected');
    conn.onTimeSyncStatusChanged = (status) => {
      setTimeSyncStatus(status);
    };
    conn.onTimeSyncUpdated = (stats) => {
      setClockOffsetUs(stats.offsetUs);
      clockOffsetUsRef.current = stats.offsetUs;
      setSyncRttMs(stats.rttMs);
    };
    conn.connectTimeSync(2000);

    // 3. SFU (default client role)
    setSfuStatus('disconnected');
    setSfuRole('client');
    setSfuReceivedCount(0);
    setSfuSentCount(0);
    conn.onSfuStatusChanged = (status) => {
      setSfuStatus(status);
    };
    conn.onSfuAudioFrame = (data) => {
      setSfuReceivedCount((c) => c + 1);
      // Route incoming Opus/WebM chunk directly into the MSE pipeline
      handleIncomingAudioChunk(data);
    };
    conn.connectSfu('client');
  };

  // Change SFU role
  const handleToggleSfuRole = (role: 'host' | 'client') => {
    if (!connectionRef.current) return;

    // Stop streaming if switching from host
    if (role === 'client') {
      stopStreamingFakeAudio();
    }

    setSfuRole(role);
    setSfuReceivedCount(0);
    setSfuSentCount(0);

    connectionRef.current.connectSfu(role);
  };

  // ── Host streaming ────────────────────────────────────────────────────────

  /**
   * Start streaming audio.
   *
   * Loopback source:  getDisplayMedia → MediaRecorder (Opus) → WebSocket
   * Melody source:    synthesized PCM → setInterval → WebSocket (unchanged)
   */
  const startStreamingFakeAudio = async () => {
    if (!connectionRef.current || sfuRole !== 'host') return;

    if (streamSource === 'loopback') {
      // ── MediaRecorder path (audio/webm with Opus) ─────────────────
      // We MUST keep the video track alive in `captureStreamRef` to prevent macOS
      // from killing the capture session after 10 seconds.
      // But we ONLY feed the audio tracks into `MediaRecorder` using an audio-only
      // stream, so MSE playback isn't stalled waiting for video keyframes.
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });

        if (stream.getAudioTracks().length === 0) {
          alert('No audio track captured. Please check "Share tab audio" or "Share system audio" in the picker.');
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        // KEEP original stream alive (do NOT stop the video track!)
        captureStreamRef.current = stream;
        console.log('[AudioMesh] Capture stream tracks:', stream.getTracks().map(t => `${t.kind}:${t.label} [${t.readyState}]`));

        // Create an AUDIO-ONLY stream for MediaRecorder
        const audioTracks = stream.getAudioTracks();
        const audioOnlyStream = new MediaStream(audioTracks);

        const mimeType = pickMimeType();
        console.log('[AudioMesh] MediaRecorder MIME:', mimeType);

        // Record ONLY the audio stream.
        const recorder = new MediaRecorder(audioOnlyStream, {
          mimeType,
          audioBitsPerSecond:  128_000,  // 128kbps Opus
        });
        mediaRecorderRef.current = recorder;

        recorder.onstart = () => console.log('[AudioMesh] Recorder started');
        recorder.onstop  = () => console.log('[AudioMesh] Recorder stopped');
        recorder.onerror = (e: any) => console.error('[AudioMesh] Recorder error:', e.error ?? e);

        recorder.ondataavailable = async (e) => {
          if (e.data.size > 0 && connectionRef.current) {
            const buf = await e.data.arrayBuffer();
            const sent = connectionRef.current.sendSfuAudioFrame(buf);
            if (sent) setSfuSentCount((c) => c + 1);
          }
        };

        // Listen for track end (OS revoked permission, user stopped sharing, etc.)
        stream.getTracks().forEach((track) => {
          track.addEventListener('ended', () => {
            console.warn(`[AudioMesh] Track ${track.kind} ended`);
            if (stream.getTracks().every(t => t.readyState === 'ended')) {
              console.warn('[AudioMesh] All tracks ended — stopping streaming');
              stopStreamingFakeAudio();
            }
          });
        });

        recorder.start(250); // 250ms slices — good balance of latency vs. overhead
        console.log('[AudioMesh] recorder.start(250), state:', recorder.state);
        setIsStreamingFakeAudio(true);
      } catch (err: any) {
        console.error('Failed to capture loopback audio:', err);
        alert(`Failed to capture system audio: ${err.message}`);
      }
    } else {
      // ── Melody synthesizer path (legacy PCM setInterval) ────────────────
      audioPhaseRef.current = 0;
      frameCountRef.current = 0;
      loopbackFifoRef.current = [];
      setIsStreamingFakeAudio(true);

      streamIntervalRef.current = setInterval(() => {
        const buffer = generateMusicFrame();
        const sent = connectionRef.current?.sendSfuAudioFrame(buffer);
        if (sent) setSfuSentCount((c) => c + 1);
      }, 20);
    }
  };

  const stopStreamingFakeAudio = () => {
    setIsStreamingFakeAudio(false);

    // Stop MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;

    // Stop melody interval
    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
      streamIntervalRef.current = null;
    }

    // Stop ALL tracks on the original capture stream (video + audio)
    if (captureStreamRef.current) {
      captureStreamRef.current.getTracks().forEach((t) => t.stop());
      captureStreamRef.current = null;
    }
  };

  // Disconnect
  const handleDisconnectAll = () => {
    stopStreamingFakeAudio();
    if (connectionRef.current) {
      connectionRef.current.disconnectAll();
      connectionRef.current = null;
    }
    setActiveRoomId(null);
    setSigStatus('disconnected');
    setJoinedPeers([]);
    setAssignedParent(null);
    setTimeSyncStatus('disconnected');
    setClockOffsetUs(null);
    setSyncRttMs(null);
    setSfuStatus('disconnected');
    setSfuReceivedCount(0);
    setSfuSentCount(0);

    // Mute/close speaker playback on disconnect
    setIsAudioEnabled(false);
    isAudioEnabledRef.current = false;
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    nextPlayTimeRef.current = 0;
    clockOffsetUsRef.current = null;
    anchorLocalTimeMsRef.current = 0;
    anchorAudioTimeRef.current = 0;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      handleDisconnectAll();
    };
  }, []);

  return (
    <Box
      minH="calc(100vh - 38px)"
      display="flex"
      flexDirection="column"
      bg="bg.panel"
      color="fg"
    >
      {/* Top Header */}
      <HStack
        px={6}
        py={4}
        borderBottomWidth="1px"
        borderColor="border"
        justify="space-between"
      >
        <HStack gap={3}>
          <Box w={8} h={8}>
            <Logo size="100%" />
          </Box>
          <Heading size="md" fontWeight="extrabold">
            AudioMesh Dashboard
          </Heading>
        </HStack>
      </HStack>

      {/* LIVE WEBSOCKET CONNECTIONS / MESH TESTING VIEW */}
      <Flex direction={{ base: 'column', lg: 'row' }} flex={1} p={6} gap={6}>
        {/* LEFT PANEL: Server Health, Settings & Create Room */}
        <VStack flex={1} gap={6} align="stretch">
          {/* Server Settings */}
          <VStack
            bg="bg.default"
            p={5}
            borderRadius="xl"
            borderWidth="1px"
            borderColor="border"
            align="stretch"
            gap={3}
          >
            <Heading size="xs" fontWeight="bold">Server Connection Settings</Heading>
            <HStack gap={3}>
              <Input
                size="sm"
                bg="bg.panel"
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                placeholder="e.g. http://127.0.0.1:50065"
              />
              <Button size="sm" colorScheme="teal" onClick={handleUpdateServerUrl}>
                Save
              </Button>
            </HStack>
            <HStack justify="space-between">
              <Text fontSize="xs" color="fg.muted">Server Health Status:</Text>
              <HStack gap={2}>
                <Badge colorScheme={serverHealth === 'connected' ? 'green' : 'red'}>
                  {serverHealth === 'connected' ? 'ONLINE' : 'OFFLINE'}
                </Badge>
                {serverLatency !== null && (
                  <Text fontSize="2xs" color="fg.muted">({serverLatency}ms latency)</Text>
                )}
              </HStack>
            </HStack>
          </VStack>

          {/* Create Room Form */}
          <VStack
            bg="bg.default"
            p={5}
            borderRadius="xl"
            borderWidth="1px"
            borderColor="border"
            align="stretch"
            gap={4}
          >
            <Heading size="xs" fontWeight="bold">Create New Mesh Room</Heading>
            
            <VStack align="stretch" gap={2}>
              <Text fontSize="2xs" color="fg.muted">Session/Room Name:</Text>
              <Input
                size="sm"
                bg="bg.panel"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
              />
            </VStack>

            <HStack gap={4}>
              <VStack align="stretch" gap={2} flex={1}>
                <Text fontSize="2xs" color="fg.muted">Mesh Mode:</Text>
                <select
                  style={{
                    padding: '6px 12px',
                    fontSize: '13px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--chakra-colors-bg-panel)',
                    color: 'var(--chakra-colors-fg)',
                    border: '1px solid var(--chakra-colors-border)',
                    outline: 'none',
                  }}
                  value={newRoomMode}
                  onChange={(e: any) => setNewRoomMode(e.target.value)}
                >
                  <option value="sfu">SFU Mode</option>
                  <option value="daisy_chain">Daisy Chain</option>
                  <option value="direct_p2p">Direct P2P</option>
                </select>
              </VStack>

              <VStack align="stretch" gap={2} w="80px">
                <Text fontSize="2xs" color="fg.muted">Max Nodes:</Text>
                <Input
                  size="sm"
                  bg="bg.panel"
                  type="number"
                  value={newRoomMaxNodes}
                  onChange={(e) => setNewRoomMaxNodes(e.target.value)}
                />
              </VStack>
            </HStack>

            <VStack align="stretch" gap={2}>
              <Text fontSize="2xs" color="fg.muted">Session Host Peer ID:</Text>
              <Input
                size="sm"
                bg="bg.panel"
                value={newRoomHostId}
                onChange={(e) => setNewRoomHostId(e.target.value)}
              />
            </VStack>

            <Button size="sm" bg="primary" color="white" onClick={handleCreateRoom}>
              Create Room
            </Button>
          </VStack>

          {/* Room List */}
          <VStack
            bg="bg.default"
            p={5}
            borderRadius="xl"
            borderWidth="1px"
            borderColor="border"
            align="stretch"
            gap={3}
            flex={1}
          >
            <Heading size="xs" fontWeight="bold">Active Server Rooms</Heading>
            <VStack gap={3} align="stretch" overflowY="auto" maxH="220px">
              {!activeRooms || activeRooms.length === 0 ? (
                <Text fontSize="xs" color="fg.muted" textAlign="center" py={4}>
                  No active rooms found on the server.
                </Text>
              ) : (
                activeRooms.map((room) => (
                  <Box
                    key={room.id}
                    p={3}
                    bg="bg.panel"
                    borderRadius="lg"
                    borderWidth="1px"
                    borderColor={activeRoomId === room.id ? 'primary' : 'border'}
                  >
                    <HStack justify="space-between">
                      <VStack align="start" gap={0}>
                        <Text fontSize="sm" fontWeight="bold">{room.name}</Text>
                        <Text
                          fontSize="3xs"
                          color="fg.muted"
                          cursor="pointer"
                          _hover={{ color: 'primary' }}
                          onClick={() => {
                            navigator.clipboard.writeText(room.id);
                            alert('Room ID copied to clipboard!');
                          }}
                          title="Click to copy full Room ID"
                        >
                          ID: {room.id} (Click to Copy)
                        </Text>
                      </VStack>
                      <Badge colorScheme="teal" variant="subtle">
                        {room.mode.toUpperCase()}
                      </Badge>
                    </HStack>
                    <HStack justify="space-between" mt={2} pt={2} borderTopWidth="1px" borderColor="border">
                      <Text fontSize="3xs" color="fg.muted">Max Nodes: {room.max_nodes}</Text>
                      <HStack gap={2}>
                        <Button
                          size="2xs"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => handleDeleteRoom(room.id)}
                        >
                          Delete
                        </Button>
                        <Button
                          size="2xs"
                          colorScheme={activeRoomId === room.id ? 'green' : 'blue'}
                          onClick={() => handleConnectToRoom(room.id)}
                        >
                          {activeRoomId === room.id ? 'Connected' : 'Connect'}
                        </Button>
                      </HStack>
                    </HStack>
                  </Box>
                ))
              )}
            </VStack>
          </VStack>
        </VStack>

        {/* RIGHT PANEL: Live WebSocket controls / logs */}
        <VStack flex={1.3} gap={6} align="stretch">
          {activeRoomId ? (
            <VStack
              bg="bg.default"
              borderRadius="2xl"
              borderWidth="1px"
              borderColor="border"
              p={6}
              gap={5}
              align="stretch"
            >
              <HStack justify="space-between">
                <VStack align="start" gap={0}>
                  <Heading size="sm" fontWeight="bold">Connected Session Control Panel</Heading>
                  <Text
                    fontSize="3xs"
                    color="fg.muted"
                    cursor="pointer"
                    _hover={{ color: 'primary' }}
                    onClick={() => {
                      if (activeRoomId) {
                        navigator.clipboard.writeText(activeRoomId);
                        alert('Active Room ID copied to clipboard!');
                      }
                    }}
                    title="Click to copy Room ID"
                    mb={1}
                  >
                    Active Room ID: {activeRoomId} (Click to Copy)
                  </Text>
                  <Text fontSize="3xs" color="fg.muted">Joined Peer ID: {myPeerId} ({myDisplayName})</Text>
                </VStack>
                <Button size="xs" colorScheme="red" onClick={handleDisconnectAll}>
                  Disconnect
                </Button>
              </HStack>

              {/* 1. WebRTC Signaling Panel */}
              <Box p={4} bg="bg.panel" borderRadius="xl" borderWidth="1px" borderColor="border">
                <HStack justify="space-between" mb={2}>
                  <Heading size="xs" fontWeight="bold">Signaling WebSocket</Heading>
                  <Badge colorScheme={sigStatus === 'connected' ? 'green' : sigStatus === 'connecting' ? 'orange' : 'red'}>
                    {sigStatus.toUpperCase()}
                  </Badge>
                </HStack>
                <VStack align="stretch" gap={1}>
                  <Text fontSize="2xs" color="fg.muted">
                    Active Peers in Room ({joinedPeers.length}):
                  </Text>
                  {joinedPeers.length === 0 ? (
                    <Text fontSize="3xs" color="fg.muted">No other peers connected.</Text>
                  ) : (
                    <HStack gap={2} flexWrap="wrap">
                      {joinedPeers.map((p) => (
                        <Badge key={p.id} colorScheme="blue" variant="outline" size="xs">
                          {p.display_name} ({p.id.substring(0, 6)})
                        </Badge>
                      ))}
                    </HStack>
                  )}
                  {assignedParent && (
                    <Text fontSize="2xs" color="primary" mt={2} fontWeight="bold">
                      ★ Assigned Daisy-Chain Parent: {assignedParent}
                    </Text>
                  )}
                </VStack>
              </Box>

              {/* 2. NTP Time Sync Panel */}
              <Box p={4} bg="bg.panel" borderRadius="xl" borderWidth="1px" borderColor="border">
                <HStack justify="space-between" mb={2}>
                  <Heading size="xs" fontWeight="bold">NTP Time Sync Client</Heading>
                  <Badge colorScheme={timeSyncStatus === 'active' ? 'green' : 'red'}>
                    {timeSyncStatus.toUpperCase()}
                  </Badge>
                </HStack>
                <HStack justify="space-between">
                  <VStack align="start" gap={0}>
                    <Text fontSize="3xs" color="fg.muted">Clock Offset</Text>
                    <Text fontSize="lg" fontWeight="extrabold" color="primary">
                      {clockOffsetUs !== null ? `${clockOffsetUs > 0 ? '+' : ''}${clockOffsetUs} μs` : 'Calculating...'}
                    </Text>
                  </VStack>
                  <VStack align="end" gap={0}>
                    <Text fontSize="3xs" color="fg.muted">RTT / Latency</Text>
                    <Text fontSize="sm" fontWeight="bold">
                      {syncRttMs !== null ? `${syncRttMs.toFixed(2)} ms` : 'Calculating...'}
                    </Text>
                  </VStack>
                </HStack>
              </Box>

              {/* 3. SFU Media Stream Panel */}
              <Box p={4} bg="bg.panel" borderRadius="xl" borderWidth="1px" borderColor="border">
                <HStack justify="space-between" mb={3}>
                  <Heading size="xs" fontWeight="bold">SFU Media Channel</Heading>
                  <Badge colorScheme={sfuStatus === 'connected' ? 'green' : 'red'}>
                    {sfuStatus.toUpperCase()}
                  </Badge>
                </HStack>
                
                <HStack gap={4} mb={4}>
                  <Text fontSize="2xs" color="fg.muted">Device Role:</Text>
                  <HStack gap={2}>
                    <Button
                      size="2xs"
                      colorScheme={sfuRole === 'client' ? 'blue' : 'gray'}
                      onClick={() => handleToggleSfuRole('client')}
                    >
                      Client (Receiver)
                    </Button>
                    <Button
                      size="2xs"
                      colorScheme={sfuRole === 'host' ? 'purple' : 'gray'}
                      onClick={() => handleToggleSfuRole('host')}
                    >
                      Host (Uplink)
                    </Button>
                  </HStack>
                </HStack>

                {sfuRole === 'client' ? (
                  <VStack align="stretch" gap={3}>
                    <HStack justify="space-between">
                      <VStack align="start" gap={1}>
                        <Text fontSize="2xs" color="fg.muted">Binary Audio Frames Received:</Text>
                        <HStack gap={3}>
                          <Heading size="md" fontWeight="extrabold" color="teal">{sfuReceivedCount}</Heading>
                          <Text fontSize="3xs" color="fg.muted">frames (live relay)</Text>
                        </HStack>
                      </VStack>
                      <Button
                        size="xs"
                        colorScheme={isAudioEnabled ? 'red' : 'green'}
                        onClick={toggleAudioPlayback}
                      >
                        {isAudioEnabled ? 'Mute Speaker' : 'Unmute Speaker'}
                      </Button>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="3xs" color="fg.muted">Audio Output Status:</Text>
                      <Badge colorScheme={isAudioEnabled ? 'green' : 'gray'}>
                        {isAudioEnabled ? 'ACTIVE (PLAYING)' : 'MUTED'}
                      </Badge>
                    </HStack>
                  </VStack>
                ) : (
                  <VStack align="stretch" gap={4}>
                    {/* Stream Source Selection */}
                    <VStack align="stretch" gap={2} p={3} bg="bg.panel" borderRadius="lg" borderWidth="1px" borderColor="border">
                      <HStack justify="space-between">
                        <Text fontSize="2xs" color="fg.muted">Stream Source:</Text>
                        <HStack gap={2}>
                          <Button
                            size="2xs"
                            colorScheme={streamSource === 'melody' ? 'teal' : 'gray'}
                            onClick={() => setStreamSource('melody')}
                            disabled={isStreamingFakeAudio}
                          >
                            Retro Melody
                          </Button>
                          <Button
                            size="2xs"
                            colorScheme={streamSource === 'loopback' ? 'purple' : 'gray'}
                            onClick={() => setStreamSource('loopback')}
                            disabled={isStreamingFakeAudio}
                          >
                            System Loopback
                          </Button>
                        </HStack>
                      </HStack>

                      {streamSource === 'loopback' && (
                        <VStack align="stretch" gap={1.5} pt={2} borderTopWidth="1px" borderColor="border">
                          <Text fontSize="3xs" color="orange.300" fontStyle="italic">
                            Tip: When you click "Start Streaming Loopback", a browser source selection dialog will open. Under "Chrome Tab", select the tab playing audio and make sure the "Share tab audio" option is checked.
                          </Text>
                        </VStack>
                      )}
                    </VStack>

                    {/* Sent Count and Play/Stop Stream */}
                    <HStack justify="space-between" pt={2} borderTopWidth="1px" borderColor="border">
                      <VStack align="start" gap={0}>
                        <Text fontSize="2xs" color="fg.muted">Binary Audio Frames Sent:</Text>
                        <Heading size="md" fontWeight="extrabold" color="purple">{sfuSentCount}</Heading>
                      </VStack>
                      <Button
                        size="xs"
                        colorScheme={isStreamingFakeAudio ? 'red' : 'green'}
                        onClick={isStreamingFakeAudio ? stopStreamingFakeAudio : startStreamingFakeAudio}
                      >
                        {isStreamingFakeAudio ? 'Stop Streaming' : `Start Streaming ${streamSource === 'loopback' ? 'Loopback' : 'Melody'}`}
                      </Button>
                    </HStack>

                    <Text fontSize="3xs" color="fg.muted" fontStyle="italic">
                      * {streamSource === 'loopback'
                         ? 'Streaming real-time desktop audio via MediaRecorder (Opus codec) over the SFU WebSocket. Played on client via MediaSource Extensions.'
                         : 'Streaming locally synthesized triangle-wave notes of Für Elise with attack envelopes at 50 frames per second.'}
                    </Text>
                  </VStack>
                )}
              </Box>

              {/* 4. Daisy Chain Topology live tree */}
              {activeRoomDetails?.room?.mode === 'daisy_chain' && (
                <Box p={4} bg="bg.panel" borderRadius="xl" borderWidth="1px" borderColor="border">
                  <Heading size="xs" fontWeight="bold" mb={2}>Daisy-Chain Connection Tree</Heading>
                  <VStack align="stretch" gap={2} maxH="150px" overflowY="auto">
                    {!topologyData?.edges || topologyData.edges.length === 0 ? (
                      <Text fontSize="3xs" color="fg.muted">Tree is empty. Connect other devices to view tree topology links.</Text>
                    ) : (
                      topologyData.edges.map((edge, i) => (
                        <HStack key={i} justify="space-between" p={1.5} bg="bg.default" borderRadius="md" borderWidth="1px" borderColor="border">
                          <HStack gap={1.5}>
                            <Badge size="xs" colorScheme="gray">{edge.from_peer_id === 'host' || edge.from_peer_id === activeRoomDetails.room.host_peer_id ? 'HOST' : 'PEER'}</Badge>
                            <Text fontSize="3xs" fontWeight="bold">{edge.from_peer_id.substring(0, 8)}</Text>
                            <Text fontSize="3xs" color="fg.muted">➔</Text>
                            <Text fontSize="3xs" fontWeight="bold">{edge.to_peer_id.substring(0, 8)}</Text>
                          </HStack>
                          <HStack gap={1.5}>
                            <Badge size="xs" colorScheme={edge.status === 'synced' ? 'green' : edge.status === 'degraded' ? 'orange' : 'red'}>
                              {edge.status}
                            </Badge>
                            {edge.rtt_ms !== null && edge.rtt_ms !== undefined && (
                              <Text fontSize="3xs" color="fg.muted">{edge.rtt_ms}ms</Text>
                            )}
                          </HStack>
                        </HStack>
                      ))
                    )}
                  </VStack>
                </Box>
              )}
            </VStack>
          ) : (
            <VStack
              bg="bg.default"
              borderRadius="2xl"
              borderWidth="1px"
              borderColor="border"
              p={6}
              flex={1}
              align="center"
              justify="center"
              color="fg.muted"
              textAlign="center"
            >
              <Logo size="48px" />
              <Heading size="xs" fontWeight="bold" mt={4}>No Session Selected</Heading>
              <Text fontSize="xs" mt={2} maxW="280px">
                Select an active room from the server rooms panel and click "Connect" to start testing WebSocket signaling, NTP clock sync, and SFU media streams.
              </Text>
            </VStack>
          )}
        </VStack>
      </Flex>
    </Box>
);
};

export default Dashboard;
