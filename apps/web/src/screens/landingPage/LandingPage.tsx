import * as React from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  SimpleGrid,
  Flex,
  Badge,
  Stack,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { TitleBoxContainer } from '@components';
import { Icon, IconType } from '@assets';

const MeshVisualizer = () => {
  return (
    <Box
      bg="bg.panel"
      backdropFilter="blur(16px)"
      borderRadius="2xl"
      borderWidth="1px"
      borderColor="border"
      p={8}
      shadow="2xl"
      width="100%"
      maxW="480px"
      position="relative"
      overflow="hidden"
      height="380px"
      className="mesh-card-float"
      transition="all 0.3s ease"
      _hover={{ shadow: '3xl', transform: 'translateY(-6px)' }}
    >
      {/* Wave propagation animations */}
      <Box className="wave-ring wave-ring-1" />
      <Box className="wave-ring wave-ring-2" />
      <Box className="wave-ring wave-ring-3" />

      {/* Main Connection Lines (SVGs) */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        <line
          x1="50%"
          y1="50%"
          x2="20%"
          y2="25%"
          className="mesh-line mesh-line-1"
        />
        <line
          x1="50%"
          y1="50%"
          x2="80%"
          y2="25%"
          className="mesh-line mesh-line-2"
        />
        <line
          x1="50%"
          y1="50%"
          x2="50%"
          y2="82%"
          className="mesh-line mesh-line-3"
        />
      </svg>

      {/* Host Node (Center) */}
      <Flex
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        w="90px"
        h="90px"
        bg="primary"
        color="white"
        borderRadius="full"
        align="center"
        justify="center"
        shadow="0 0 30px var(--chakra-colors-primary)"
        zIndex={10}
        direction="column"
      >
        <Icon type={IconType.AUDIO} size="24px" className="pulse-host-icon" />
        <Text fontSize="10px" fontWeight="bold" mt={1}>
          HOST
        </Text>
      </Flex>

      {/* Node 1: Laptop (Top Left) */}
      <VStack
        position="absolute"
        top="12%"
        left="10%"
        align="center"
        gap={1.5}
        zIndex={5}
      >
        <Flex
          w="60px"
          h="60px"
          bg="bg.default"
          borderColor="primary"
          borderWidth="2px"
          borderRadius="xl"
          align="center"
          justify="center"
          shadow="md"
        >
          <HStack gap={1} align="flex-end" h="24px">
            <Box className="eq-bar eq-bar-1" />
            <Box className="eq-bar eq-bar-2" />
            <Box className="eq-bar eq-bar-3" />
          </HStack>
        </Flex>
        <Text fontSize="10px" fontWeight="bold" color="fg">
          MacBook Pro
        </Text>
      </VStack>

      {/* Node 2: Tablet (Top Right) */}
      <VStack
        position="absolute"
        top="12%"
        right="10%"
        align="center"
        gap={1.5}
        zIndex={5}
      >
        <Flex
          w="60px"
          h="60px"
          bg="bg.default"
          borderColor="primary"
          borderWidth="2px"
          borderRadius="xl"
          align="center"
          justify="center"
          shadow="md"
        >
          <HStack gap={1} align="flex-end" h="24px">
            <Box className="eq-bar eq-bar-2" />
            <Box className="eq-bar eq-bar-3" />
            <Box className="eq-bar eq-bar-1" />
          </HStack>
        </Flex>
        <Text fontSize="10px" fontWeight="bold" color="fg">
          iPad Pro
        </Text>
      </VStack>

      {/* Node 3: Smartphone (Bottom) */}
      <VStack
        position="absolute"
        bottom="8%"
        left="50%"
        transform="translateX(-50%)"
        align="center"
        gap={1.5}
        zIndex={5}
      >
        <Flex
          w="60px"
          h="60px"
          bg="bg.default"
          borderColor="primary"
          borderWidth="2px"
          borderRadius="xl"
          align="center"
          justify="center"
          shadow="md"
        >
          <HStack gap={1} align="flex-end" h="24px">
            <Box className="eq-bar eq-bar-3" />
            <Box className="eq-bar eq-bar-1" />
            <Box className="eq-bar eq-bar-2" />
          </HStack>
        </Flex>
        <Text fontSize="10px" fontWeight="bold" color="fg">
          iPhone 15
        </Text>
      </VStack>
    </Box>
  );
};

const LandingPage = () => {
  return (
    <TitleBoxContainer
      title="AudioMesh | Synchronized Multi-Device Sound Mesh"
      icon="app"
      display="flex"
      flexDir="column"
      width="100%"
    >
      <style>{`
        /* --- Mesh animations --- */
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .mesh-card-float { animation: float 6s ease-in-out infinite; }

        @keyframes wave {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.8; }
          100% { transform: translate(-50%, -50%) scale(2.8); opacity: 0; }
        }
        .wave-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          border: 2px solid var(--chakra-colors-primary);
          border-radius: 50%;
          pointer-events: none;
          z-index: 1;
          width: 90px;
          height: 90px;
        }
        .wave-ring-1 { animation: wave 4s cubic-bezier(0.1, 0.8, 0.3, 1) infinite; }
        .wave-ring-2 { animation: wave 4s cubic-bezier(0.1, 0.8, 0.3, 1) infinite 1.3s; }
        .wave-ring-3 { animation: wave 4s cubic-bezier(0.1, 0.8, 0.3, 1) infinite 2.6s; }

        @keyframes pulse-icon {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        .pulse-host-icon { animation: pulse-icon 2s ease-in-out infinite; }

        @keyframes eq-bounce-1 {
          0%, 100% { height: 6px; }
          50% { height: 22px; }
        }
        @keyframes eq-bounce-2 {
          0%, 100% { height: 16px; }
          50% { height: 4px; }
        }
        @keyframes eq-bounce-3 {
          0%, 100% { height: 10px; }
          50% { height: 24px; }
        }
        .eq-bar {
          width: 4px;
          background-color: var(--chakra-colors-primary);
          border-top-left-radius: 2px;
          border-top-right-radius: 2px;
        }
        .eq-bar-1 { animation: eq-bounce-1 0.8s ease-in-out infinite; }
        .eq-bar-2 { animation: eq-bounce-2 1.1s ease-in-out infinite; }
        .eq-bar-3 { animation: eq-bounce-3 0.9s ease-in-out infinite; }

        @keyframes stroke-dash {
          to { stroke-dashoffset: -20; }
        }
        .mesh-line {
          stroke: var(--chakra-colors-primary);
          stroke-width: 1.5;
          stroke-dasharray: 4 4;
          opacity: 0.55;
          animation: stroke-dash 2s linear infinite;
        }
        .mesh-line-1 { stroke-dashoffset: 0; }
        .mesh-line-2 { stroke-dashoffset: 0; }
        .mesh-line-3 { stroke-dashoffset: 0; }
      `}</style>

      {/* Hero Header Area */}
      <Stack
        alignItems="center"
        justifyContent="center"
        width="100%"
        minHeight="85vh"
        bgGradient={{
          base: 'radial(circle at 50% -20%, #e6f4ff, bg.default 80%)',
          _dark:
            'radial(circle at 50% -20%, rgba(139, 92, 246, 0.15), bg.default 80%)',
        }}
        py={{ base: 12, md: 20 }}
        px={{ base: 6, md: 16 }}
        position="relative"
        overflow="hidden"
        zIndex={1}
      >
        <Stack
          direction={{ base: 'column', lg: 'row' }}
          gap={{ base: 12, lg: 16 }}
          maxW="1200px"
          width="100%"
          mx="auto"
          alignItems="center"
          justifyContent="space-between"
          zIndex={2}
        >
          {/* LEFT: Copy content */}
          <VStack
            alignItems={{ base: 'center', lg: 'flex-start' }}
            textAlign={{ base: 'center', lg: 'left' }}
            gap={6}
            flex={1}
            maxW={{ base: 'xl', lg: 'none' }}
          >
            <Badge
              colorScheme="purple"
              px={4}
              py={1.5}
              borderRadius="full"
              fontSize="xs"
              fontWeight="bold"
              variant="subtle"
            >
              📶 Dual-Protocol Synchronization
            </Badge>

            <Heading
              size={{ base: 'xl', md: '2xl', lg: '3xl' }}
              color="fg"
              lineHeight="tight"
              fontWeight="extrabold"
              letterSpacing="tight"
            >
              Harmonize Your Devices,
              <br />
              <Text
                as="span"
                bgGradient="linear(to-r, primary, success.400)"
                bgClip="text"
              >
                Amplify Your Sound.
              </Text>
            </Heading>

            <Text
              fontSize={{ base: 'md', md: 'lg' }}
              color="fg.muted"
              lineHeight="relaxed"
            >
              AudioMesh seamlessly bridges nearby smartphones, tablets, and
              computers over Wi-Fi and Bluetooth networks, transforming them
              into a unified, perfectly synchronized speaker array. Enjoy
              immersive sound without expensive hardware.
            </Text>

            <Stack
              direction={{ base: 'column', sm: 'row' }}
              gap={4}
              width={{ base: '100%', sm: 'auto' }}
              mt={2}
            >
              <Button
                asChild
                size="lg"
                bg="primary"
                color="white"
                borderRadius="xl"
                px={8}
                py={6}
                fontWeight="bold"
                shadow="lg"
                _hover={{
                  bg: 'primary/90',
                  transform: 'translateY(-2px)',
                  shadow: 'xl',
                }}
                transition="all 0.2s"
              >
                <Link to="/product">Download App</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                borderColor="border"
                color="fg"
                borderRadius="xl"
                px={8}
                py={6}
                fontWeight="semibold"
                bg="bg.panel"
                _hover={{ bg: 'bg.hover', transform: 'translateY(-2px)' }}
                transition="all 0.2s"
              >
                <Link to="/docs">Read Documentation</Link>
              </Button>
            </Stack>
          </VStack>

          {/* RIGHT: Visualizer */}
          <Box
            flex={1}
            width="100%"
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <MeshVisualizer />
          </Box>
        </Stack>
      </Stack>

      {/* Features Grid Area */}
      <Box
        py={16}
        px={{ base: 6, md: 16 }}
        bg="bg.panel"
        borderTopWidth="1px"
        borderColor="border"
      >
        <Box maxW="1200px" mx="auto">
          <VStack gap={3} textAlign="center" mb={12}>
            <Heading as="h2" size="xl" color="fg" fontWeight="bold">
              Engineered for Synchronization
            </Heading>
            <Text color="fg.muted" fontSize="md" maxW="600px">
              Everything you need to turn any collection of devices into an
              active audio node.
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={8}>
            {/* Feature 1 */}
            <VStack
              align="start"
              p={6}
              bg="bg.default"
              borderRadius="2xl"
              borderWidth="1px"
              borderColor="transparent"
              shadow="sm"
              transition="all 0.2s"
              gap={4}
              _hover={{ borderColor: 'primary' }}
            >
              <Flex
                w={10}
                h={10}
                borderRadius="xl"
                bg="primary/10"
                color="primary"
                align="center"
                justify="center"
              >
                <Icon type={IconType.SYNC} size="20px" />
              </Flex>
              <Heading as="h3" size="sm" fontWeight="bold" color="fg">
                Dual-Protocol Sync
              </Heading>
              <Text fontSize="xs" color="fg.muted">
                Utilizes both local Wi-Fi networks and Bluetooth multi-point
                connections to ensure maximum range, stability, and
                synchronization.
              </Text>
            </VStack>

            {/* Feature 2 */}
            <VStack
              align="start"
              p={6}
              bg="bg.default"
              borderRadius="2xl"
              borderWidth="1px"
              borderColor="transparent"
              shadow="sm"
              transition="all 0.2s"
              gap={4}
              _hover={{ borderColor: 'primary' }}
            >
              <Flex
                w={10}
                h={10}
                borderRadius="xl"
                bg="primary/10"
                color="primary"
                align="center"
                justify="center"
              >
                <Icon type={IconType.BOLT} size="20px" />
              </Flex>
              <Heading as="h3" size="sm" fontWeight="bold" color="fg">
                Seamless Fallback
              </Heading>
              <Text fontSize="xs" color="fg.muted">
                If the Wi-Fi connection drops or weakens, the system
                automatically routes the audio stream through the Bluetooth mesh
                to prevent playback drops.
              </Text>
            </VStack>

            {/* Feature 3 */}
            <VStack
              align="start"
              p={6}
              bg="bg.default"
              borderRadius="2xl"
              borderWidth="1px"
              borderColor="transparent"
              shadow="sm"
              transition="all 0.2s"
              gap={4}
              _hover={{ borderColor: 'primary' }}
            >
              <Flex
                w={10}
                h={10}
                borderRadius="xl"
                bg="primary/10"
                color="primary"
                align="center"
                justify="center"
              >
                <Icon type={IconType.USER} size="20px" />
              </Flex>
              <Heading as="h3" size="sm" fontWeight="bold" color="fg">
                Dynamic Node Management
              </Heading>
              <Text fontSize="xs" color="fg.muted">
                Devices can join or leave the AudioMesh session dynamically on
                the fly without interrupting the host&apos;s audio stream.
              </Text>
            </VStack>

            {/* Feature 4 */}
            <VStack
              align="start"
              p={6}
              bg="bg.default"
              borderRadius="2xl"
              borderWidth="1px"
              borderColor="transparent"
              shadow="sm"
              transition="all 0.2s"
              gap={4}
              _hover={{ borderColor: 'primary' }}
            >
              <Flex
                w={10}
                h={10}
                borderRadius="xl"
                bg="primary/10"
                color="primary"
                align="center"
                justify="center"
              >
                <Icon type={IconType.LOCK} size="20px" />
              </Flex>
              <Heading as="h3" size="sm" fontWeight="bold" color="fg">
                Universal Compatibility
              </Heading>
              <Text fontSize="xs" color="fg.muted">
                Completely hardware-agnostic. Runs seamlessly across iOS,
                Android, macOS, Windows, and Linux operating systems.
              </Text>
            </VStack>
          </SimpleGrid>
        </Box>
      </Box>
    </TitleBoxContainer>
  );
};

export default LandingPage;
