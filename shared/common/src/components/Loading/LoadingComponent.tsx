import * as React from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { Logo } from '../../assets';

// Float animation for logo
const floatKeyframe = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
`;

// Pulse animation for glow
const glowKeyframe = keyframes`
  0% { transform: scale(0.95); opacity: 0.4; }
  100% { transform: scale(1.15); opacity: 0.8; }
`;

// Progress bar movement
const progressKeyframe = keyframes`
  0% { left: -40%; width: 30%; }
  50% { width: 50%; }
  100% { left: 110%; width: 20%; }
`;

// Pulse keyframe for network status
const pulseKeyframe = keyframes`
  0% { transform: scale(0.9); opacity: 0.6; box-shadow: 0 0 0 0 rgba(186, 200, 215, 0.4); }
  50% { transform: scale(1.1); opacity: 1; box-shadow: 0 0 8px 2px rgba(186, 200, 215, 0.6); }
  100% { transform: scale(0.9); opacity: 0.6; box-shadow: 0 0 0 0 rgba(186, 200, 215, 0.4); }
`;

// Concentric ripples for audio broadcast/sync
const rippleKeyframe = keyframes`
  0% { transform: scale(0.6); opacity: 0; }
  10% { opacity: 0.6; }
  100% { transform: scale(2.0); opacity: 0; }
`;

// Mesh network dashed line data-flow — dashes travel outward from center to each node
const dashOutwardKeyframe = keyframes`
  0% { stroke-dashoffset: 16; }
  100% { stroke-dashoffset: 0; }
`;

// Satellite pulse animation
const satellitePulseKeyframe = keyframes`
  0%, 100% { transform: scale(0.8); opacity: 0.5; box-shadow: 0 0 0 0 rgba(186, 200, 215, 0.4); }
  50% { transform: scale(1.1); opacity: 1; box-shadow: 0 0 10px 3px rgba(186, 200, 215, 0.7); }
`;

// Equalizer bar animation for sound play
const eqBarKeyframe = keyframes`
  0% { transform: scaleY(0.2); }
  100% { transform: scaleY(1); }
`;

// Wavy fabric background motion keyframes
const waveMove1 = keyframes`
  0% { transform: rotate(0deg) translate(0px, 0px) scale(1); }
  100% { transform: rotate(6deg) translate(-5%, 5%) scale(1.1); }
`;

const waveMove2 = keyframes`
  0% { transform: rotate(0deg) translate(0px, 0px) scale(1.05); }
  100% { transform: rotate(-8deg) translate(5%, -3%) scale(0.95); }
`;

const waveMove3 = keyframes`
  0% { transform: rotate(0deg) translate(0px, 0px) scale(0.95); }
  100% { transform: rotate(4deg) translate(-3%, -5%) scale(1.08); }
`;

// 7 satellite nodes at varied angles and random-ish distances from center (110,110)
// Each: x,y are SVG coords; pulseDelay staggers the glow for a live-network feel
const MESH_NODES: Array<{ x: number; y: number; pulseDelay: string; lineDuration: string }> = [
  { x: 174, y: 147, pulseDelay: '0s',    lineDuration: '0.8s' },  // ~30°,  r=74
  { x: 117, y: 193, pulseDelay: '0.4s',  lineDuration: '1.1s' },  // ~85°,  r=83
  { x: 52,  y: 150, pulseDelay: '0.8s',  lineDuration: '0.9s' },  // ~145°, r=68
  { x: 35,  y: 82,  pulseDelay: '1.2s',  lineDuration: '1.3s' },  // ~200°, r=79
  { x: 105, y: 38,  pulseDelay: '1.6s',  lineDuration: '0.7s' },  // ~265°, r=72
  { x: 171, y: 49,  pulseDelay: '2.0s',  lineDuration: '1.0s' },  // ~320°, r=85
  { x: 182, y: 95,  pulseDelay: '2.4s',  lineDuration: '1.2s' },  // ~352°, r=72
];

// Spin-only keyframe — Z rotation only; rotateX tilt is handled by the separate tilt layer
const spinOnlyKeyframe = keyframes`
  0% { transform: rotateZ(0deg); }
  100% { transform: rotateZ(360deg); }
`;

// Counter-spin for logo: cancels the Z rotation so logo stays upright on the tilted plane
const logoCounterSpinKeyframe = keyframes`
  0% { transform: translate(-50%, -50%) rotateZ(0deg); }
  100% { transform: translate(-50%, -50%) rotateZ(-360deg); }
`;

const loadingMessages = [
  'INITIALIZING AUDIO SUBSYSTEM...',
  'SCANNING WI-FI & BLUETOOTH INTERFACES...',
  'DISCOVERING NEARBY AUDIOMESH NODES...',
  'ESTABLISHING PEER-TO-PEER DATA CHANNELS...',
  'CALIBRATING TRANSMISSION LATENCY...',
  'MEASURING MULTI-DEVICE CLOCK DRIFT...',
  'SYNCHRONIZING AUDIO BUFFER QUEUES...',
  'STARTING RUST AUDIO ROUTING DAEMON...',
  'SPAWNING UNIFIED SPEAKER MESH...',
];

const LoadingComponent = () => {
  const [logIndex, setLogIndex] = React.useState(0);
  const [dots, setDots] = React.useState('');
  const [isHovered, setIsHovered] = React.useState(false);

  React.useEffect(() => {
    // Cycle messages
    const messageInterval = setInterval(() => {
      setLogIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 1200);

    // Blinking dots
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 400);

    return () => {
      clearInterval(messageInterval);
      clearInterval(dotsInterval);
    };
  }, []);

  return (
    <Flex
      height="100vh"
      width="100vw"
      direction="column"
      justifyContent="center"
      alignItems="center"
      bg="#121416"
      overflow="hidden"
      position="relative"
    >
      {/* Decorative cybernetic corner accents */}
      <Box
        position="absolute"
        top="4"
        left="4"
        width="16px"
        height="16px"
        borderTop="2px solid rgba(186, 200, 215, 0.2)"
        borderLeft="2px solid rgba(186, 200, 215, 0.2)"
        zIndex={2}
      />
      <Box
        position="absolute"
        top="4"
        right="4"
        width="16px"
        height="16px"
        borderTop="2px solid rgba(186, 200, 215, 0.2)"
        borderRight="2px solid rgba(186, 200, 215, 0.2)"
        zIndex={2}
      />
      <Box
        position="absolute"
        bottom="4"
        left="4"
        width="16px"
        height="16px"
        borderBottom="2px solid rgba(186, 200, 215, 0.2)"
        borderLeft="2px solid rgba(186, 200, 215, 0.2)"
        zIndex={2}
      />
      <Box
        position="absolute"
        bottom="4"
        right="4"
        width="16px"
        height="16px"
        borderBottom="2px solid rgba(186, 200, 215, 0.2)"
        borderRight="2px solid rgba(186, 200, 215, 0.2)"
        zIndex={2}
      />

      {/* Wavy fabric background layers */}
      <Box
        position="absolute"
        top="0"
        left="0"
        width="100%"
        height="100%"
        zIndex={0}
        pointerEvents="none"
        opacity={0.45}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1440 800"
          preserveAspectRatio="none"
          style={{ minWidth: '1200px', width: '100%', height: '100%' }}
        >
          <defs>
            <linearGradient id="fabric-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#121416" stopOpacity={0.8} />
              <stop offset="50%" stopColor="#34414d" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#1e2022" stopOpacity={0.8} />
            </linearGradient>
            <linearGradient id="fabric-grad-2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e2022" stopOpacity={0.9} />
              <stop offset="50%" stopColor="#121416" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#34414d" stopOpacity={0.7} />
            </linearGradient>
            <linearGradient id="fabric-grad-3" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#34414d" stopOpacity={0.5} />
              <stop offset="50%" stopColor="#1e2022" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#121416" stopOpacity={0.9} />
            </linearGradient>
          </defs>
          <path
            d="M-100,-100 C300,200 600,-200 1100,300 C1300,400 1500,200 1700,500 L1700,900 L-100,900 Z"
            fill="url(#fabric-grad-1)"
            style={{
              animation: `${waveMove1} 20s ease-in-out infinite alternate`,
              transformOrigin: '50% 50%',
            }}
          />
          <path
            d="M-200,100 C400,0 800,500 1200,200 C1400,100 1600,600 1800,400 L1800,1000 L-200,1000 Z"
            fill="url(#fabric-grad-2)"
            style={{
              animation: `${waveMove2} 25s ease-in-out infinite alternate`,
              transformOrigin: '40% 60%',
            }}
          />
          <path
            d="M-50,300 C500,500 900,100 1300,600 L1300,1000 L-50,1000 Z"
            fill="url(#fabric-grad-3)"
            style={{
              animation: `${waveMove3} 15s ease-in-out infinite alternate`,
              transformOrigin: '60% 40%',
            }}
          />
        </svg>
      </Box>

      {/* Cybernetic Tech Grid overlay on top of fabric */}
      <Box
        position="absolute"
        top="0"
        left="0"
        width="100%"
        height="100%"
        zIndex={1}
        pointerEvents="none"
        backgroundImage="
          radial-gradient(circle at center, rgba(186, 200, 215, 0.08) 0%, transparent 75%),
          linear-gradient(rgba(255, 255, 255, 0.01) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.01) 1px, transparent 1px)
        "
        backgroundSize="100% 100%, 24px 24px, 24px 24px"
      />

      {/* Interactive Main Content Layer */}
      <Flex
        direction="column"
        alignItems="center"
        justifyContent="center"
        zIndex={2}
        position="relative"
      >
        {/* Mesh Communication Network Container — float moves everything as one unit */}
        <Box
          position="relative"
          width="220px"
          height="220px"
          display="flex"
          justifyContent="center"
          alignItems="center"
          mb="4"
          css={{
            animation: `${floatKeyframe} 4s ease-in-out infinite`,
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Pulsing Backglow behind entire network */}
          <Box
            position="absolute"
            width="160px"
            height="160px"
            bg="radial-gradient(circle, rgba(186, 200, 215, 0.15) 0%, transparent 70%)"
            filter="blur(15px)"
            css={{
              animation: `${glowKeyframe} 2s ease-in-out infinite alternate`,
            }}
          />

          {/* Tilt layer: rotateX transitions smoothly on hover (CSS transition, not keyframe) */}
          <Box
            position="absolute"
            top="0"
            left="0"
            width="100%"
            height="100%"
            zIndex={1}
            style={{
              transformStyle: 'preserve-3d',
              transform: `perspective(800px) rotateX(${isHovered ? '0deg' : '60deg'})`,
              transition: 'transform 0.9s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {/* Spin layer: continuous Z rotation, independent of tilt */}
            <Box
              position="absolute"
              top="0"
              left="0"
              width="100%"
              height="100%"
              style={{ transformStyle: 'preserve-3d' }}
              css={{
                animation: `${spinOnlyKeyframe} 12s linear infinite`,
              }}
            >
            {/* Dynamic Mesh SVG — SMIL animate drives outward-flowing dashes (no CSS keyframe needed) */}
            <svg
              width="220"
              height="220"
              viewBox="0 0 220 220"
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}
            >
              {MESH_NODES.map((node, i) => (
                <line
                  key={i}
                  x1="110"
                  y1="110"
                  x2={node.x}
                  y2={node.y}
                  stroke="rgba(186, 200, 215, 0.5)"
                  strokeWidth="1.5"
                  strokeDasharray="15,6"
                >
                  {/* SMIL: from=0 to=-21 (period=15+6) makes dashes travel center→node */}
                  <animate
                    attributeName="stroke-dashoffset"
                    from="0"
                    to="-21"
                    dur={node.lineDuration}
                    repeatCount="indefinite"
                    begin={node.pulseDelay}
                  />
                </line>
              ))}
            </svg>

            {/* Satellite speaker nodes — positions match SVG line endpoints */}
            {MESH_NODES.map((node, i) => (
              <Box
                key={i}
                position="absolute"
                width="18px"
                height="18px"
                borderRadius="full"
                bg="rgba(18, 20, 22, 0.85)"
                border="1.5px solid rgba(186, 200, 215, 0.9)"
                display="flex"
                alignItems="center"
                justifyContent="center"
                zIndex={3}
                style={{
                  top: `${node.y - 9}px`,
                  left: `${node.x - 9}px`,
                }}
                css={{
                  animation: `${satellitePulseKeyframe} 2s infinite ease-in-out`,
                  animationDelay: node.pulseDelay,
                }}
              >
                <Box width="5px" height="5px" borderRadius="full" bg="#bac8d7" />
              </Box>
            ))}

            {/* Concentric ripples around central host */}
            <Box
              position="absolute"
              width="100px"
              height="100px"
              left="60px"
              top="60px"
              borderRadius="full"
              border="1.5px solid rgba(186, 200, 215, 0.2)"
              css={{
                animation: `${rippleKeyframe} 3s cubic-bezier(0.1, 0.8, 0.3, 1) infinite`,
              }}
            />
            <Box
              position="absolute"
              width="100px"
              height="100px"
              left="60px"
              top="60px"
              borderRadius="full"
              border="1.5px solid rgba(186, 200, 215, 0.1)"
              css={{
                animation: `${rippleKeyframe} 3s cubic-bezier(0.1, 0.8, 0.3, 1) infinite`,
                animationDelay: '1.5s',
              }}
            />

            {/* Central Brand Host Logo — inside the 3D plane, counter-spin keeps it upright */}
            <Box
              position="absolute"
              top="50%"
              left="50%"
              zIndex={4}
              css={{
                animation: `${logoCounterSpinKeyframe} 12s linear infinite`,
              }}
            >
              <Logo size={70} />
            </Box>
            </Box> {/* end spin layer */}
          </Box> {/* end tilt layer */}
        </Box> {/* end mesh container */}

        {/* Brand Title */}
        <Text
          fontSize="lg"
          fontWeight="black"
          letterSpacing="0.35em"
          textTransform="uppercase"
          color="white"
          mb="1"
          textShadow="0 0 15px rgba(186, 200, 215, 0.3)"
        >
          AudioMesh
        </Text>

        {/* Brand Subtitle */}
        <Text
          fontFamily="mono"
          fontSize="xs"
          fontWeight="medium"
          color="neutral.500"
          letterSpacing="0.15em"
          mb="8"
        >
          SYNCHRONIZED SPEAKER NETWORK
        </Text>

        {/* Premium Sleek Progress Bar */}
        <Box
          width="220px"
          height="3px"
          bg="rgba(255, 255, 255, 0.05)"
          borderRadius="full"
          overflow="hidden"
          position="relative"
          mb="4"
          border="1px solid rgba(255, 255, 255, 0.03)"
        >
          <Box
            position="absolute"
            height="100%"
            background="linear-gradient(90deg, #34414d 0%, #bac8d7 100%)"
            borderRadius="full"
            css={{
              animation: `${progressKeyframe} 1.8s cubic-bezier(0.65, 0.05, 0.36, 1) infinite`,
            }}
          />
        </Box>

        {/* Rhythmic Audio Equalizer showing Active Sound Playback */}
        <Flex gap="3px" height="20px" alignItems="center" justifyContent="center" mb="6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Box
              key={i}
              width="3px"
              height="100%"
              bg="#bac8d7"
              borderRadius="full"
              transformOrigin="bottom"
              css={{
                animation: `${eqBarKeyframe} ${0.5 + i * 0.12}s ease-in-out infinite alternate`,
                animationDelay: `${i * 0.08}s`,
              }}
            />
          ))}
        </Flex>

        {/* Pulse Status Indicator */}
        <Flex alignItems="center" mb="1" height="1.25rem">
          <Box
            width="6px"
            height="6px"
            borderRadius="full"
            bg="#bac8d7"
            mr="2"
            css={{
              animation: `${pulseKeyframe} 2s infinite ease-in-out`,
            }}
          />
          <Text
            fontFamily="mono"
            fontSize="10px"
            color="rgba(186, 200, 215, 0.6)"
            letterSpacing="0.1em"
          >
            MESH STATUS: SYNCING
          </Text>
        </Flex>

        {/* Interactive Terminal console */}
        <Flex
          direction="row"
          alignItems="center"
          fontFamily="mono"
          fontSize="xs"
          color="rgba(186, 200, 215, 0.8)"
          letterSpacing="0.05em"
          height="1.5rem"
        >
          <Text mr="1">&gt; {loadingMessages[logIndex]}</Text>
          <Text color="#bac8d7">{dots}</Text>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default LoadingComponent;
