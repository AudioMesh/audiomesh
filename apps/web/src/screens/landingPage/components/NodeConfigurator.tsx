import * as React from 'react';
import { Box, HStack, VStack, Text, Button } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { GlassBox } from '@components';
import { Node } from '../types';
import styles from '../landingPage.module.css';

interface NodeConfiguratorProps {
  selectedNode: Node | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateNode: (id: string, updates: Partial<Node>) => void;
}

export const NodeConfigurator = ({
  selectedNode,
  isOpen,
  onClose,
  onUpdateNode,
}: NodeConfiguratorProps) => {
  const { t } = useTranslation();

  const [activeNode, setActiveNode] = React.useState<Node | null>(null);

  React.useEffect(() => {
    if (selectedNode) {
      setActiveNode(selectedNode);
    }
  }, [selectedNode]);

  if (!activeNode) return null;

  return (
    <Box
      position="absolute"
      bottom="10px"
      left="10px"
      right="10px"
      zIndex={20}
      opacity={isOpen ? 1 : 0}
      transform={isOpen ? 'translateY(0)' : 'translateY(25px)'}
      pointerEvents={isOpen ? 'auto' : 'none'}
      visibility={isOpen ? 'visible' : 'hidden'}
      transition="all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
    >
      <GlassBox width="100%" height="auto">
        <VStack align="stretch" w="100%" p={4} gap={3.5}>
          <HStack justify="space-between" mb={1}>
            <HStack gap={2}>
              <Box
                w={2.5}
                h={2.5}
                borderRadius="full"
                bg={
                  activeNode.status === 'active'
                    ? '#bac8d7'
                    : activeNode.status === 'syncing'
                      ? 'yellow.400'
                      : 'gray.500'
                }
              />
              {activeNode.id === 'macbook' && (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: 'var(--chakra-colors-primary)' }}
                >
                  <rect x="2" y="4" width="20" height="14" rx="2" ry="2" />
                  <line x1="2" y1="20" x2="22" y2="20" />
                  <line x1="12" y1="18" x2="12" y2="20" />
                </svg>
              )}
              {activeNode.id === 'ipad' && (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: 'var(--chakra-colors-primary)' }}
                >
                  <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
                  <line x1="12" y1="18" x2="12" y2="18.01" strokeWidth="2.5" />
                </svg>
              )}
              {activeNode.id === 'android' && (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: 'var(--chakra-colors-primary)' }}
                >
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                  <circle cx="12" cy="5" r="0.75" fill="currentColor" />
                </svg>
              )}
              {activeNode.id === 'speaker' && (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: 'var(--chakra-colors-primary)' }}
                >
                  <ellipse cx="12" cy="5" rx="6" ry="2.5" />
                  <path d="M6 5v14c0 1.38 2.69 2.5 6 2.5s6-1.12 6-2.5V5" />
                  <path
                    d="M6 10c0 1.38 2.69 2.5 6 2.5s6-1.12 6-2.5"
                    strokeDasharray="1.5 1.5"
                  />
                </svg>
              )}
              {activeNode.id === 'iphone' && (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: 'var(--chakra-colors-primary)' }}
                >
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                  <line x1="12" y1="18" x2="12" y2="18.01" strokeWidth="2.5" />
                </svg>
              )}
              <Text fontSize="xs" fontWeight="bold" color="fg">
                {t(
                  `LandingPage.nodeName${activeNode.id.charAt(0).toUpperCase() + activeNode.id.slice(1)}`,
                  { defaultValue: activeNode.name },
                )}{' '}
                {t('LandingPage.nodeTitle')}
              </Text>
            </HStack>
            <Button
              size="2xs"
              variant="ghost"
              onClick={onClose}
              color="fg.muted"
              _hover={{ bg: 'bg.hover' }}
            >
              ✕
            </Button>
          </HStack>

          <VStack gap={2.5} align="stretch">
            {/* Status Option */}
            <HStack justify="space-between">
              <Text fontSize="2xs" color="fg.muted">
                {t('LandingPage.nodeStatus')}
              </Text>
              <HStack gap={1}>
                {(['active', 'syncing', 'muted'] as const).map((status) => (
                  <Button
                    key={status}
                    size="2xs"
                    px={2}
                    py={0.5}
                    variant={activeNode.status === status ? 'solid' : 'outline'}
                    bg={
                      activeNode.status === status ? 'primary' : 'transparent'
                    }
                    color={activeNode.status === status ? 'white' : 'fg.muted'}
                    borderColor="border"
                    fontSize="9px"
                    borderRadius="md"
                    onClick={() => onUpdateNode(activeNode.id, { status })}
                  >
                    {t(`LandingPage.${status}`)}
                  </Button>
                ))}
              </HStack>
            </HStack>

            {/* Volume Slider */}
            <Box>
              <HStack justify="space-between" mb={0.5}>
                <Text fontSize="2xs" color="fg.muted">
                  {t('LandingPage.nodeVolume')}
                </Text>
                <Text fontSize="2xs" fontWeight="bold" color="primary">
                  {activeNode.volume}%
                </Text>
              </HStack>
              <input
                type="range"
                min="0"
                max="100"
                value={activeNode.volume}
                onChange={(e) =>
                  onUpdateNode(activeNode.id, {
                    volume: parseInt(e.target.value),
                  })
                }
                className={styles.premiumRange}
                disabled={activeNode.status === 'muted'}
              />
            </Box>
          </VStack>
        </VStack>
      </GlassBox>
    </Box>
  );
};

export default NodeConfigurator;
