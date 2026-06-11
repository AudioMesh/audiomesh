import { useState } from 'react';
import {
  Box,
  HStack,
  VStack,
  Text,
  Button,
  Heading,
  Slider,
  Flex,
  Badge,
} from '@chakra-ui/react';
import { appStore, selectApiCredentials, useShallow } from '@appStore';
import { Logo } from '@assets';

interface MeshNode {
  id: string;
  name: string;
  type: 'Wi-Fi' | 'Bluetooth';
  volume: number;
  delay: number; // in milliseconds
  status: 'Synced' | 'Calibrating';
}

const Dashboard = () => {
  const { clearApiCredentials } = appStore(useShallow(selectApiCredentials));

  const [isPlaying, setIsPlaying] = useState(false);
  const [masterVolume, setMasterVolume] = useState(80);
  const [playbackTime, setPlaybackTime] = useState(42); // in seconds
  const [nodes, setNodes] = useState<MeshNode[]>([
    {
      id: 'node-host',
      name: 'Host (This Device)',
      type: 'Wi-Fi',
      volume: 100,
      delay: 0,
      status: 'Synced',
    },
    {
      id: 'node-1',
      name: 'iPhone 15',
      type: 'Wi-Fi',
      volume: 85,
      delay: 12,
      status: 'Synced',
    },
    {
      id: 'node-2',
      name: 'iPad Pro',
      type: 'Bluetooth',
      volume: 70,
      delay: 24,
      status: 'Synced',
    },
  ]);

  const handleLogout = () => {
    clearApiCredentials();
  };

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleUpdateNodeVolume = (id: string, vol: number) => {
    setNodes(
      nodes.map((node) => (node.id === id ? { ...node, volume: vol } : node)),
    );
  };

  const handleUpdateNodeDelay = (id: string, del: number) => {
    setNodes(
      nodes.map((node) => (node.id === id ? { ...node, delay: del } : node)),
    );
  };

  const handleAddMockNode = () => {
    const names = [
      'Living Room HomePod',
      'Google Pixel 8',
      'Samsung Galaxy S24',
      'Bedroom Speaker',
    ];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomId = `node-${Date.now()}`;
    const newNode: MeshNode = {
      id: randomId,
      name: `${randomName} #${nodes.length}`,
      type: Math.random() > 0.5 ? 'Wi-Fi' : 'Bluetooth',
      volume: 80,
      delay: Math.floor(Math.random() * 30),
      status: 'Calibrating',
    };

    setNodes([...nodes, newNode]);

    // Simulate completion of calibration
    setTimeout(() => {
      setNodes((currentNodes) =>
        currentNodes.map((n) =>
          n.id === randomId ? { ...n, status: 'Synced' } : n,
        ),
      );
    }, 1500);
  };

  const handleRemoveNode = (id: string) => {
    if (id === 'node-host') return; // Cannot remove host node
    setNodes(nodes.filter((node) => node.id !== id));
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <Box
      minH="calc(100vh - 38px)"
      display="flex"
      flexDirection="column"
      bg="bg.panel"
      color="fg"
    >
      <style>{`
        @keyframes bounceBar {
          0%, 100% { height: 4px; }
          50% { height: 32px; }
        }
        .bouncing-eq-bar {
          width: 6px;
          background-color: var(--chakra-colors-primary);
          border-top-left-radius: 3px;
          border-top-right-radius: 3px;
        }
        .bouncing-eq-bar-1 { animation: bounceBar 0.9s ease-in-out infinite; }
        .bouncing-eq-bar-2 { animation: bounceBar 1.2s ease-in-out infinite 0.2s; }
        .bouncing-eq-bar-3 { animation: bounceBar 0.7s ease-in-out infinite 0.4s; }
        .bouncing-eq-bar-4 { animation: bounceBar 1.0s ease-in-out infinite 0.1s; }
        .bouncing-eq-bar-5 { animation: bounceBar 0.8s ease-in-out infinite 0.3s; }
      `}</style>

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
        <Button
          size="sm"
          variant="outline"
          borderColor="border"
          onClick={handleLogout}
          _hover={{ bg: 'bg.hover' }}
        >
          Disconnect Node
        </Button>
      </HStack>

      <Flex direction={{ base: 'column', lg: 'row' }} flex={1} p={6} gap={6}>
        {/* LEFT COLUMN: Controls & Playback */}
        <VStack
          flex={1}
          bg="bg.default"
          borderRadius="2xl"
          borderWidth="1px"
          borderColor="border"
          p={6}
          gap={6}
          align="stretch"
        >
          <Heading size="sm" fontWeight="bold">
            Audio Playback
          </Heading>

          {/* Equalizer display */}
          <Flex
            h="120px"
            bg="bg.panel"
            borderRadius="xl"
            align="center"
            justify="center"
            borderWidth="1px"
            borderColor="border"
            gap={1.5}
          >
            {isPlaying ? (
              <HStack gap={1.5} align="flex-end" h="36px">
                <Box className="bouncing-eq-bar bouncing-eq-bar-1" />
                <Box className="bouncing-eq-bar bouncing-eq-bar-2" />
                <Box className="bouncing-eq-bar bouncing-eq-bar-3" />
                <Box className="bouncing-eq-bar bouncing-eq-bar-4" />
                <Box className="bouncing-eq-bar bouncing-eq-bar-5" />
              </HStack>
            ) : (
              <Text fontSize="sm" color="fg.muted">
                Playback paused. Equalizer idle.
              </Text>
            )}
          </Flex>

          {/* Time & Play control */}
          <VStack gap={3} align="stretch">
            <HStack justify="space-between">
              <Text fontSize="xs" color="fg.muted">
                {formatTime(playbackTime)}
              </Text>
              <Text fontSize="xs" color="fg.muted">
                3:45
              </Text>
            </HStack>
            <Slider.Root
              min={0}
              max={225}
              value={[playbackTime]}
              onValueChange={(details) => setPlaybackTime(details.value[0])}
            >
              <Slider.Track bg="bg.panel" h="5px" borderRadius="full">
                <Slider.Range bg="primary" />
              </Slider.Track>
              <Slider.Thumb index={0} w="12px" h="12px" bg="primary" borderRadius="full" />
            </Slider.Root>
          </VStack>

          <HStack justify="center" gap={4}>
            <Button
              size="lg"
              bg={isPlaying ? 'primary/20' : 'primary'}
              color={isPlaying ? 'primary' : 'white'}
              onClick={handleTogglePlay}
              w="140px"
              borderRadius="xl"
              fontWeight="bold"
            >
              {isPlaying ? 'Pause Mesh' : 'Play Mesh'}
            </Button>
          </HStack>

          {/* Master Volume */}
          <VStack align="stretch" gap={2} mt={2}>
            <HStack justify="space-between">
              <Text fontSize="xs" fontWeight="bold" color="fg.muted">
                Master Mesh Volume
              </Text>
              <Text fontSize="xs" fontWeight="bold">
                {masterVolume}%
              </Text>
            </HStack>
            <Slider.Root
              min={0}
              max={100}
              value={[masterVolume]}
              onValueChange={(details) => setMasterVolume(details.value[0])}
            >
              <Slider.Track bg="bg.panel" h="5px" borderRadius="full">
                <Slider.Range bg="primary" />
              </Slider.Track>
              <Slider.Thumb index={0} w="12px" h="12px" bg="primary" borderRadius="full" />
            </Slider.Root>
          </VStack>
        </VStack>

        {/* RIGHT COLUMN: Speaker Nodes */}
        <VStack
          flex={1.3}
          bg="bg.default"
          borderRadius="2xl"
          borderWidth="1px"
          borderColor="border"
          p={6}
          gap={6}
          align="stretch"
        >
          <HStack justify="space-between">
            <VStack align="start" gap={0}>
              <Heading size="sm" fontWeight="bold">
                Connected Speaker Nodes
              </Heading>
              <Text fontSize="2xs" color="fg.muted">
                Pair nearby devices to play audio concurrently.
              </Text>
            </VStack>
            <Button
              size="xs"
              bg="primary"
              color="white"
              onClick={handleAddMockNode}
              borderRadius="lg"
            >
              + Search & Add Node
            </Button>
          </HStack>

          <VStack gap={4} align="stretch" overflowY="auto" maxH="400px">
            {nodes.map((node) => (
              <Box
                key={node.id}
                p={4}
                bg="bg.panel"
                borderRadius="xl"
                borderWidth="1px"
                borderColor="border"
              >
                <HStack justify="space-between" mb={3}>
                  <HStack gap={2}>
                    <Text fontSize="sm" fontWeight="bold">
                      {node.name}
                    </Text>
                    <Badge
                      size="sm"
                      variant="subtle"
                      colorScheme={node.type === 'Wi-Fi' ? 'teal' : 'purple'}
                    >
                      {node.type}
                    </Badge>
                  </HStack>
                  <HStack gap={2}>
                    <Badge
                      size="sm"
                      variant="solid"
                      colorScheme={node.status === 'Synced' ? 'green' : 'orange'}
                    >
                      {node.status}
                    </Badge>
                    {node.id !== 'node-host' && (
                      <Button
                        size="2xs"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => handleRemoveNode(node.id)}
                      >
                        Remove
                      </Button>
                    )}
                  </HStack>
                </HStack>

                <VStack gap={3} align="stretch">
                  {/* Node Volume */}
                  <HStack gap={4}>
                    <Text fontSize="2xs" w="60px" color="fg.muted">
                      Volume:
                    </Text>
                    <Slider.Root
                      min={0}
                      max={100}
                      value={[node.volume]}
                      onValueChange={(details) =>
                        handleUpdateNodeVolume(node.id, details.value[0])
                      }
                      flex={1}
                    >
                      <Slider.Track bg="bg.default" h="4px" borderRadius="full">
                        <Slider.Range bg="primary" />
                      </Slider.Track>
                      <Slider.Thumb index={0} w="10px" h="10px" bg="primary" borderRadius="full" />
                    </Slider.Root>
                    <Text fontSize="2xs" w="30px" textAlign="right">
                      {node.volume}%
                    </Text>
                  </HStack>

                  {/* Node Delay Offset */}
                  <HStack gap={4}>
                    <Text fontSize="2xs" w="60px" color="fg.muted">
                      Sync Delay:
                    </Text>
                    <Slider.Root
                      min={0}
                      max={100}
                      value={[node.delay]}
                      onValueChange={(details) =>
                        handleUpdateNodeDelay(node.id, details.value[0])
                      }
                      flex={1}
                    >
                      <Slider.Track bg="bg.default" h="4px" borderRadius="full">
                        <Slider.Range bg="primary" />
                      </Slider.Track>
                      <Slider.Thumb index={0} w="10px" h="10px" bg="primary" borderRadius="full" />
                    </Slider.Root>
                    <Text fontSize="2xs" w="30px" textAlign="right">
                      {node.delay}ms
                    </Text>
                  </HStack>
                </VStack>
              </Box>
            ))}
          </VStack>
        </VStack>
      </Flex>
    </Box>
  );
};

export default Dashboard;
