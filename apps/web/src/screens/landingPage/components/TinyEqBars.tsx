import * as React from 'react';
import { Box, HStack } from '@chakra-ui/react';
import { Node } from '../types';
import styles from '../landingPage.module.css';

interface TinyEqBarsProps {
  node: Node;
}

export const TinyEqBars = ({ node }: TinyEqBarsProps) => {
  if (node.status === 'muted') {
    return (
      <HStack gap={0.5} align="flex-end" h="12px" opacity={0.5}>
        <Box w="2px" h="2px" bg="border" borderRadius="1px" />
        <Box w="2px" h="2px" bg="border" borderRadius="1px" />
        <Box w="2px" h="2px" bg="border" borderRadius="1px" />
      </HStack>
    );
  }

  const scale = node.status === 'syncing' ? 0.35 : node.volume / 100;
  const duration1 = node.status === 'syncing' ? '2.5s' : '0.8s';
  const duration2 = node.status === 'syncing' ? '3.0s' : '1.1s';
  const duration3 = node.status === 'syncing' ? '2.2s' : '0.9s';

  const anim1 =
    node.status === 'syncing' ? styles.eqBounceSync : styles.eqBounce1;
  const anim2 =
    node.status === 'syncing' ? styles.eqBounceSync : styles.eqBounce2;
  const anim3 =
    node.status === 'syncing' ? styles.eqBounceSync : styles.eqBounce3;

  return (
    <HStack gap={0.5} align="flex-end" h="8px">
      <Box
        className="eq-bar"
        w="2px"
        h={`${1 + 6 * scale}px`}
        bg="primary"
        borderTopRadius="0.5px"
        style={{
          animation: `${anim1} ${duration1} ease-in-out infinite`,
        }}
      />
      <Box
        className="eq-bar"
        w="2px"
        h={`${1 + 4 * scale}px`}
        bg="primary"
        borderTopRadius="0.5px"
        style={{
          animation: `${anim2} ${duration2} ease-in-out infinite`,
        }}
      />
      <Box
        className="eq-bar"
        w="2px"
        h={`${1 + 5 * scale}px`}
        bg="primary"
        borderTopRadius="0.5px"
        style={{
          animation: `${anim3} ${duration3} ease-in-out infinite`,
        }}
      />
    </HStack>
  );
};

export default TinyEqBars;
