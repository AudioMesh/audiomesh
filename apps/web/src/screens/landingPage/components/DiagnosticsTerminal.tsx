import * as React from 'react';
import { Box, HStack, VStack, Text, Button } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Node } from '../types';
import MeshVisualizer from './MeshVisualizer';
import styles from '../landingPage.module.css';
import { GlassBox } from '@components';

interface DiagnosticsTerminalProps {
  nodes: Node[];
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  onUpdateNode: (id: string, updates: Partial<Node>) => void;
  isCalibrating: boolean;
  testToneActive: boolean;
  runCalibration: () => void;
  toggleTestTone: () => void;
  terminalLogs: string[];
  terminalRef: React.RefObject<HTMLDivElement | null>;
}

export const DiagnosticsTerminal = ({
  nodes,
  selectedNodeId,
  onSelectNode,
  onUpdateNode,
  isCalibrating,
  testToneActive,
  runCalibration,
  toggleTestTone,
  terminalLogs,
  terminalRef,
}: DiagnosticsTerminalProps) => {
  const { t } = useTranslation();

  return (
    <VStack flex={0.9} width="100%" align="center">
      <Box
        bg="bg.panel"
        borderWidth="1px"
        borderColor="border"
        borderRadius="2xl"
        p={5}
        shadow="2xl"
        backdropFilter="blur(20px)"
        width="100%"
        maxW="480px"
        position="relative"
        className={styles.meshCardFloat}
        transition="all 0.3s ease"
        _hover={{ shadow: '3xl', transform: 'translateY(-6px)' }}
      >
        {/* Console Header */}
        <HStack
          justify="space-between"
          mb={4}
          borderBottomWidth="1px"
          borderColor="border.muted"
          pb={3}
        >
          <HStack gap={2}>
            <Box
              w="8px"
              h="8px"
              bg="success.400"
              borderRadius="full"
              className={styles.pulseHostIcon}
            />
            <Text
              fontFamily="mono"
              fontSize="2xs"
              fontWeight="bold"
              color="fg.muted"
              letterSpacing="wider"
            >
              {t('LandingPage.consoleHeader')}
            </Text>
          </HStack>
          <HStack gap={1.5}>
            <Box w="6px" h="6px" bg="border" borderRadius="full" />
            <Box w="6px" h="6px" bg="border" borderRadius="full" />
            <Box w="6px" h="6px" bg="border" borderRadius="full" />
          </HStack>
        </HStack>

        {/* Visualizer */}
        <Box
          position="relative"
          width="100%"
          display="flex"
          justifyContent="center"
        >
          <MeshVisualizer
            nodes={nodes}
            selectedNodeId={selectedNodeId}
            onSelectNode={onSelectNode}
            onUpdateNode={onUpdateNode}
            isCalibrating={isCalibrating}
            testToneActive={testToneActive}
          />
        </Box>

        {/* Controls */}
        <HStack gap={3} width="100%" justify="center" mt={4}>
          <GlassBox
            width="auto"
            height="auto"
            borderRadius={12}
            backgroundOpacity={0.15}
            saturation={1.6}
            distortionScale={15}
            displace={2}
            blur={6}
          >
            <Button
              size="xs"
              bg="transparent"
              color="white"
              borderRadius="xl"
              onClick={runCalibration}
              disabled={isCalibrating}
              _hover={{ bg: 'whiteAlpha.100' }}
              fontSize="10px"
              fontWeight="bold"
              px={3}
              py={1}
            >
              ⚡ {t('LandingPage.optSyncButton')}
            </Button>
          </GlassBox>
          <GlassBox
            width="auto"
            height="auto"
            borderRadius={12}
            backgroundOpacity={0.06}
            saturation={1.3}
            distortionScale={15}
            displace={2}
            blur={6}
          >
            <Button
              size="xs"
              bg="transparent"
              color="fg"
              borderRadius="xl"
              onClick={toggleTestTone}
              _hover={{ bg: 'whiteAlpha.100' }}
              fontSize="10px"
              fontWeight="bold"
              px={3}
              py={1}
            >
              🎵 {t('LandingPage.playTestTone')}
            </Button>
          </GlassBox>
        </HStack>

        {/* Terminal Logs */}
        <GlassBox
          width="100%"
          height="auto"
          borderRadius={12}
          backgroundOpacity={0.04}
          saturation={1.2}
          distortionScale={12}
          displace={2}
          blur={8}
          style={{ marginTop: '16px' }}
        >
          <Box
            p={3}
            mt={4}
            fontFamily="mono"
            fontSize="10px"
            height="100px"
            overflowY="auto"
            className={styles.customScrollbar}
            ref={terminalRef}
            textAlign="left"
            width="100%"
          >
            {terminalLogs.map((log, index) => {
              let logColor = 'terminal.default';
              if (log.startsWith('[SYS]')) logColor = 'terminal.sys';
              else if (log.startsWith('[NET]')) logColor = 'terminal.net';
              else if (log.startsWith('[SYNC]')) logColor = 'terminal.sync';
              else if (log.startsWith('[WAVE]')) logColor = 'terminal.wave';
              else if (log.startsWith('[AUDIO]')) logColor = 'terminal.audio';

              return (
                <Text
                  key={index}
                  color={logColor}
                  mb={0.5}
                  lineHeight="shorter"
                >
                  &gt; {log}
                </Text>
              );
            })}
          </Box>
        </GlassBox>
      </Box>
    </VStack>
  );
};

export default DiagnosticsTerminal;
