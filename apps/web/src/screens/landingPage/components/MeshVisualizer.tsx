import * as React from 'react';
import { Box, Flex, Text, VStack } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Icon, IconType } from '@assets';
import { Node } from '../types';
import TinyEqBars from './TinyEqBars';
import NodeConfigurator from './NodeConfigurator';
import styles from '../landingPage.module.css';

interface MeshVisualizerProps {
  nodes: Node[];
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  onUpdateNode: (id: string, updates: Partial<Node>) => void;
  isCalibrating: boolean;
  testToneActive: boolean;
}

export const MeshVisualizer = ({
  nodes,
  selectedNodeId,
  onSelectNode,
  onUpdateNode,
  isCalibrating,
  testToneActive,
}: MeshVisualizerProps) => {
  const { t } = useTranslation();

  const macbook = nodes.find((n) => n.id === 'macbook') || {
    id: 'macbook' as const,
    name: 'MacBook Pro',
    volume: 80,
    latency: 0,
    status: 'active' as const,
  };
  const ipad = nodes.find((n) => n.id === 'ipad') || {
    id: 'ipad' as const,
    name: 'iPad Pro',
    volume: 60,
    latency: 15,
    status: 'active' as const,
  };
  const iphone = nodes.find((n) => n.id === 'iphone') || {
    id: 'iphone' as const,
    name: 'iPhone 15',
    volume: 90,
    latency: -5,
    status: 'syncing' as const,
  };
  const android = nodes.find((n) => n.id === 'android') || {
    id: 'android' as const,
    name: 'Galaxy S24',
    volume: 75,
    latency: 10,
    status: 'active' as const,
  };
  const speaker = nodes.find((n) => n.id === 'speaker') || {
    id: 'speaker' as const,
    name: 'Mesh Speaker',
    volume: 65,
    latency: -18,
    status: 'active' as const,
  };

  const getLineStyle = (node: Node) => {
    if (isCalibrating) {
      return {
        stroke: '#eab308',
        opacity: 0.85,
        animation: `${styles.strokeDash} 0.5s linear infinite`,
      };
    }

    if (node.status === 'muted') {
      return {
        stroke: 'var(--chakra-colors-border)',
        opacity: 0.15,
        animation: 'none',
      };
    }

    if (node.status === 'syncing') {
      return {
        stroke: '#eab308',
        opacity: 0.6,
        animation: `${styles.strokeDash} 3.5s linear infinite`,
      };
    }

    if (Math.abs(node.latency) > 20) {
      return {
        stroke: '#ef4444',
        opacity: 0.8,
        animation: `${styles.strokeDash} 0.8s linear infinite`,
      };
    }

    const duration = Math.max(0.6, 2.5 - node.volume / 40);
    return {
      stroke: 'var(--chakra-colors-primary)',
      opacity: 0.75,
      animation: `${styles.strokeDash} ${duration}s linear infinite`,
    };
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  return (
    <Box
      bg="transparent"
      width="100%"
      maxW="480px"
      position="relative"
      height="380px"
    >
      {/* Wave propagation animations */}
      {isCalibrating && (
        <>
          <Box className={styles.wavePulseActive} style={{ animationDelay: '0s' }} />
          <Box
            className={styles.wavePulseActive}
            style={{ animationDelay: '0.25s' }}
          />
          <Box
            className={styles.wavePulseActive}
            style={{ animationDelay: '0.5s' }}
          />
        </>
      )}

      {!isCalibrating && (
        <>
          <Box className={`${styles.waveRing} ${styles.waveRing1}`} />
          <Box className={`${styles.waveRing} ${styles.waveRing2}`} />
        </>
      )}

      {/* Test Tone Sine Wave Ripple */}
      {testToneActive && (
        <Box
          position="absolute"
          bottom="8%"
          left="5%"
          right="5%"
          height="25px"
          pointerEvents="none"
          zIndex={2}
          opacity={0.7}
        >
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 100 20"
            preserveAspectRatio="none"
            style={{ overflow: 'visible' }}
          >
            <path
              d="M 0 10 C 12.5 2, 12.5 18, 25 10 C 37.5 2, 37.5 18, 50 10 C 62.5 2, 62.5 18, 75 10 C 87.5 2, 87.5 18, 100 10"
              fill="none"
              stroke="var(--chakra-colors-primary)"
              strokeWidth="1.5"
              className={styles.sineWaveFlow}
            />
          </svg>
        </Box>
      )}

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
          x2="18%"
          y2="20%"
          className={styles.meshLine}
          style={getLineStyle(macbook)}
        />
        <line
          x1="50%"
          y1="50%"
          x2="82%"
          y2="20%"
          className={styles.meshLine}
          style={getLineStyle(ipad)}
        />
        <line
          x1="50%"
          y1="50%"
          x2="18%"
          y2="50%"
          className={styles.meshLine}
          style={getLineStyle(android)}
        />
        <line
          x1="50%"
          y1="50%"
          x2="82%"
          y2="50%"
          className={styles.meshLine}
          style={getLineStyle(speaker)}
        />
        <line
          x1="50%"
          y1="50%"
          x2="50%"
          y2="88%"
          className={styles.meshLine}
          style={getLineStyle(iphone)}
        />
        {isCalibrating && (
          <>
            <circle cx="50%" cy="50%" r="4" fill="var(--chakra-colors-primary)">
              <animate
                attributeName="cx"
                from="50%"
                to="18%"
                dur="1.5s"
                repeatCount="1"
                fill="freeze"
              />
              <animate
                attributeName="cy"
                from="50%"
                to="20%"
                dur="1.5s"
                repeatCount="1"
                fill="freeze"
              />
              <animate
                attributeName="opacity"
                from="1"
                to="0"
                dur="1.5s"
                repeatCount="1"
                fill="freeze"
              />
            </circle>
            <circle cx="50%" cy="50%" r="4" fill="var(--chakra-colors-primary)">
              <animate
                attributeName="cx"
                from="50%"
                to="82%"
                dur="1.5s"
                repeatCount="1"
                fill="freeze"
              />
              <animate
                attributeName="cy"
                from="50%"
                to="20%"
                dur="1.5s"
                repeatCount="1"
                fill="freeze"
              />
              <animate
                attributeName="opacity"
                from="1"
                to="0"
                dur="1.5s"
                repeatCount="1"
                fill="freeze"
              />
            </circle>
            <circle cx="50%" cy="50%" r="4" fill="var(--chakra-colors-primary)">
              <animate
                attributeName="cx"
                from="50%"
                to="18%"
                dur="1.5s"
                repeatCount="1"
                fill="freeze"
              />
              <animate
                attributeName="cy"
                from="50%"
                to="50%"
                dur="1.5s"
                repeatCount="1"
                fill="freeze"
              />
              <animate
                attributeName="opacity"
                from="1"
                to="0"
                dur="1.5s"
                repeatCount="1"
                fill="freeze"
              />
            </circle>
            <circle cx="50%" cy="50%" r="4" fill="var(--chakra-colors-primary)">
              <animate
                attributeName="cx"
                from="50%"
                to="82%"
                dur="1.5s"
                repeatCount="1"
                fill="freeze"
              />
              <animate
                attributeName="cy"
                from="50%"
                to="50%"
                dur="1.5s"
                repeatCount="1"
                fill="freeze"
              />
              <animate
                attributeName="opacity"
                from="1"
                to="0"
                dur="1.5s"
                repeatCount="1"
                fill="freeze"
              />
            </circle>
            <circle cx="50%" cy="50%" r="4" fill="var(--chakra-colors-primary)">
              <animate
                attributeName="cx"
                from="50%"
                to="50%"
                dur="1.5s"
                repeatCount="1"
                fill="freeze"
              />
              <animate
                attributeName="cy"
                from="50%"
                to="88%"
                dur="1.5s"
                repeatCount="1"
                fill="freeze"
              />
              <animate
                attributeName="opacity"
                from="1"
                to="0"
                dur="1.5s"
                repeatCount="1"
                fill="freeze"
              />
            </circle>
          </>
        )}
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
        cursor="pointer"
        _hover={{ transform: 'translate(-50%, -50%) scale(1.05)' }}
        transition="transform 0.2s"
      >
        <Icon type={IconType.AUDIO} size="24px" className={styles.pulseHostIcon} />
        <Text fontSize="10px" fontWeight="bold" mt={1}>
          {t('LandingPage.host')}
        </Text>
      </Flex>

      {/* Node 1: Laptop (Top Left) */}
      <VStack
        position="absolute"
        top="8%"
        left="8%"
        align="center"
        gap={1.5}
        zIndex={5}
        onClick={() =>
          onSelectNode(selectedNodeId === 'macbook' ? null : 'macbook')
        }
        cursor="pointer"
        transition="all 0.2s"
        _hover={{ transform: 'scale(1.06)' }}
        opacity={macbook.status === 'muted' ? 0.45 : 1}
      >
        <Flex
          w="60px"
          h="60px"
          bg="bg.default"
          borderColor={
            selectedNodeId === 'macbook'
              ? 'primary'
              : macbook.status === 'syncing'
                ? 'yellow.400'
                : 'border'
          }
          borderWidth="2px"
          borderRadius="xl"
          align="center"
          justify="center"
          position="relative"
          shadow={
            selectedNodeId === 'macbook'
              ? '0 0 15px var(--chakra-colors-primary)'
              : 'md'
          }
        >
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                color:
                  selectedNodeId === 'macbook'
                    ? 'var(--chakra-colors-primary)'
                    : 'var(--chakra-colors-fg)',
              }}
            >
              <rect x="2" y="4" width="20" height="14" rx="2" ry="2" />
              <line x1="2" y1="20" x2="22" y2="20" />
              <line x1="12" y1="18" x2="12" y2="20" />
            </svg>
          </Box>
          <Box position="absolute" bottom="5px">
            <TinyEqBars node={macbook} />
          </Box>
        </Flex>
        <Text fontSize="10px" fontWeight="bold" color="fg">
          {t('LandingPage.nodeNameMacbook', { defaultValue: macbook.name })}
        </Text>
      </VStack>

      {/* Node 2: Tablet (Top Right) */}
      <VStack
        position="absolute"
        top="8%"
        right="8%"
        align="center"
        gap={1.5}
        zIndex={5}
        onClick={() => onSelectNode(selectedNodeId === 'ipad' ? null : 'ipad')}
        cursor="pointer"
        transition="all 0.2s"
        _hover={{ transform: 'scale(1.06)' }}
        opacity={ipad.status === 'muted' ? 0.45 : 1}
      >
        <Flex
          w="60px"
          h="60px"
          bg="bg.default"
          borderColor={
            selectedNodeId === 'ipad'
              ? 'primary'
              : ipad.status === 'syncing'
                ? 'yellow.400'
                : 'border'
          }
          borderWidth="2px"
          borderRadius="xl"
          align="center"
          justify="center"
          position="relative"
          shadow={
            selectedNodeId === 'ipad'
              ? '0 0 15px var(--chakra-colors-primary)'
              : 'md'
          }
        >
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                color:
                  selectedNodeId === 'ipad'
                    ? 'var(--chakra-colors-primary)'
                    : 'var(--chakra-colors-fg)',
              }}
            >
              <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12" y2="18.01" strokeWidth="2.5" />
            </svg>
          </Box>
          <Box position="absolute" bottom="5px">
            <TinyEqBars node={ipad} />
          </Box>
        </Flex>
        <Text fontSize="10px" fontWeight="bold" color="fg">
          {t('LandingPage.nodeNameIpad', { defaultValue: ipad.name })}
        </Text>
      </VStack>

      {/* Node 4: Android Phone (Middle Left) */}
      <VStack
        position="absolute"
        top="46%"
        left="8%"
        align="center"
        gap={1.5}
        zIndex={5}
        onClick={() =>
          onSelectNode(selectedNodeId === 'android' ? null : 'android')
        }
        cursor="pointer"
        transition="all 0.2s"
        _hover={{ transform: 'scale(1.06)' }}
        opacity={android.status === 'muted' ? 0.45 : 1}
      >
        <Flex
          w="60px"
          h="60px"
          bg="bg.default"
          borderColor={
            selectedNodeId === 'android'
              ? 'primary'
              : android.status === 'syncing'
                ? 'yellow.400'
                : 'border'
          }
          borderWidth="2px"
          borderRadius="xl"
          align="center"
          justify="center"
          position="relative"
          shadow={
            selectedNodeId === 'android'
              ? '0 0 15px var(--chakra-colors-primary)'
              : 'md'
          }
        >
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                color:
                  selectedNodeId === 'android'
                    ? 'var(--chakra-colors-primary)'
                    : 'var(--chakra-colors-fg)',
              }}
            >
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <circle cx="12" cy="5" r="0.75" fill="currentColor" />
            </svg>
          </Box>
          <Box position="absolute" bottom="5px">
            <TinyEqBars node={android} />
          </Box>
        </Flex>
        <Text fontSize="10px" fontWeight="bold" color="fg">
          {t('LandingPage.nodeNameAndroid', { defaultValue: android.name })}
        </Text>
      </VStack>

      {/* Node 5: Mesh Speaker (Middle Right) */}
      <VStack
        position="absolute"
        top="46%"
        right="8%"
        align="center"
        gap={1.5}
        zIndex={5}
        onClick={() =>
          onSelectNode(selectedNodeId === 'speaker' ? null : 'speaker')
        }
        cursor="pointer"
        transition="all 0.2s"
        _hover={{ transform: 'scale(1.06)' }}
        opacity={speaker.status === 'muted' ? 0.45 : 1}
      >
        <Flex
          w="60px"
          h="60px"
          bg="bg.default"
          borderColor={
            selectedNodeId === 'speaker'
              ? 'primary'
              : speaker.status === 'syncing'
                ? 'yellow.400'
                : 'border'
          }
          borderWidth="2px"
          borderRadius="xl"
          align="center"
          justify="center"
          position="relative"
          shadow={
            selectedNodeId === 'speaker'
              ? '0 0 15px var(--chakra-colors-primary)'
              : 'md'
          }
        >
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                color:
                  selectedNodeId === 'speaker'
                    ? 'var(--chakra-colors-primary)'
                    : 'var(--chakra-colors-fg)',
              }}
            >
              <ellipse cx="12" cy="5" rx="6" ry="2.5" />
              <path d="M6 5v14c0 1.38 2.69 2.5 6 2.5s6-1.12 6-2.5V5" />
              <path
                d="M6 10c0 1.38 2.69 2.5 6 2.5s6-1.12 6-2.5"
                strokeDasharray="2 2"
              />
              <path
                d="M6 15c0 1.38 2.69 2.5 6 2.5s6-1.12 6-2.5"
                strokeDasharray="2 2"
              />
            </svg>
          </Box>
          <Box position="absolute" bottom="5px">
            <TinyEqBars node={speaker} />
          </Box>
        </Flex>
        <Text fontSize="10px" fontWeight="bold" color="fg">
          {t('LandingPage.nodeNameSpeaker', { defaultValue: speaker.name })}
        </Text>
      </VStack>

      {/* Node 3: Smartphone (Bottom Center) */}
      <VStack
        position="absolute"
        bottom="4%"
        left="50%"
        transform="translateX(-50%)"
        align="center"
        gap={1.5}
        zIndex={5}
        onClick={() =>
          onSelectNode(selectedNodeId === 'iphone' ? null : 'iphone')
        }
        cursor="pointer"
        transition="all 0.2s"
        _hover={{ transform: 'translateX(-50%) scale(1.06)' }}
        opacity={iphone.status === 'muted' ? 0.45 : 1}
      >
        <Flex
          w="60px"
          h="60px"
          bg="bg.default"
          borderColor={
            selectedNodeId === 'iphone'
              ? 'primary'
              : iphone.status === 'syncing'
                ? 'yellow.400'
                : 'border'
          }
          borderWidth="2px"
          borderRadius="xl"
          align="center"
          justify="center"
          position="relative"
          shadow={
            selectedNodeId === 'iphone'
              ? '0 0 15px var(--chakra-colors-primary)'
              : 'md'
          }
        >
          <Box
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                color:
                  selectedNodeId === 'iphone'
                    ? 'var(--chakra-colors-primary)'
                    : 'var(--chakra-colors-fg)',
              }}
            >
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12" y2="18.01" strokeWidth="2.5" />
            </svg>
          </Box>
          <Box position="absolute" bottom="5px">
            <TinyEqBars node={iphone} />
          </Box>
        </Flex>
        <Text fontSize="10px" fontWeight="bold" color="fg">
          {t('LandingPage.nodeNameIphone', { defaultValue: iphone.name })}
        </Text>
      </VStack>

      {/* Node Configurator Drawer Overlay */}
      <NodeConfigurator
        selectedNode={selectedNode || null}
        isOpen={!!selectedNode}
        onClose={() => onSelectNode(null)}
        onUpdateNode={onUpdateNode}
      />
    </Box>
  );
};

export default MeshVisualizer;
