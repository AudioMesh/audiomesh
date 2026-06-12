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

  const connectionRef = useRef<MeshConnection | null>(null);
  const streamIntervalRef = useRef<any>(null);

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
    setSigStatus('connected');

    // 2. Time Sync
    setTimeSyncStatus('active');
    conn.onTimeSyncUpdated = (stats) => {
      setClockOffsetUs(stats.offsetUs);
      setSyncRttMs(stats.rttMs);
    };
    conn.connectTimeSync(2000);

    // 3. SFU (default client role)
    setSfuStatus('connected');
    setSfuRole('client');
    setSfuReceivedCount(0);
    setSfuSentCount(0);
    conn.onSfuAudioFrame = (data) => {
      setSfuReceivedCount((c) => c + 1);
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

  // Start streaming fake audio frames
  const startStreamingFakeAudio = () => {
    if (!connectionRef.current || sfuRole !== 'host') return;
    setIsStreamingFakeAudio(true);

    streamIntervalRef.current = setInterval(() => {
      // 100 bytes: 8 bytes for microsecond timestamp, 92 bytes of mock payload
      const buffer = new ArrayBuffer(100);
      const view = new DataView(buffer);
      
      const offset = clockOffsetUs || 0;
      const ntpTimeUs = Date.now() * 1000 + offset;
      
      // Store 64-bit microsecond timestamp in network byte order
      view.setBigUint64(0, BigInt(ntpTimeUs), false);
      
      connectionRef.current?.sendSfuAudioFrame(buffer);
      setSfuSentCount((c) => c + 1);
    }, 20); // 50 frames per second
  };

  const stopStreamingFakeAudio = () => {
    setIsStreamingFakeAudio(false);
    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
      streamIntervalRef.current = null;
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
                  <VStack align="stretch" gap={1}>
                    <Text fontSize="2xs" color="fg.muted">Binary Audio Frames Received:</Text>
                    <HStack gap={3}>
                      <Heading size="md" fontWeight="extrabold" color="teal">{sfuReceivedCount}</Heading>
                      <Text fontSize="3xs" color="fg.muted">frames (live relay via WebSocket)</Text>
                    </HStack>
                  </VStack>
                ) : (
                  <VStack align="stretch" gap={3}>
                    <HStack justify="space-between">
                      <VStack align="start" gap={0}>
                        <Text fontSize="2xs" color="fg.muted">Binary Audio Frames Sent:</Text>
                        <Heading size="md" fontWeight="extrabold" color="purple">{sfuSentCount}</Heading>
                      </VStack>
                      <Button
                        size="xs"
                        colorScheme={isStreamingFakeAudio ? 'red' : 'green'}
                        onClick={isStreamingFakeAudio ? stopStreamingFakeAudio : startStreamingFakeAudio}
                      >
                        {isStreamingFakeAudio ? 'Stop Streaming' : 'Start Streaming Fake Audio'}
                      </Button>
                    </HStack>
                    <Text fontSize="3xs" color="fg.muted" fontStyle="italic">
                      * When streaming is active, the client sends 50 fake audio payloads per second, containing 64-bit microsecond timestamps synchronized with the NTP clock offset.
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
