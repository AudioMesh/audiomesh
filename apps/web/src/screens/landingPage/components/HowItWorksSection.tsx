import * as React from 'react';
import {
  Box,
  VStack,
  Badge,
  Heading,
  SimpleGrid,
  Text,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { ElectricBorder } from '@components';
import styles from '../landingPage.module.css';

export const HowItWorksSection = () => {
  const { t } = useTranslation();

  return (
    <Box
      py={20}
      px={{ base: 6, md: 16 }}
      bg="bg.default"
      borderTopWidth="1px"
      borderColor="border"
    >
      <Box maxW="1200px" mx="auto">
        <VStack
          gap={3}
          textAlign="center"
          mb={16}
          className="reveal-up reveal-up-native"
        >
          <Badge
            colorScheme="purple"
            px={3.5}
            py={1}
            borderRadius="full"
            fontSize="2xs"
            fontWeight="bold"
          >
            🛠️ {t('LandingPage.howItWorksTitle')}
          </Badge>
          <Heading as="h2" size="xl" color="fg" fontWeight="bold">
            {t('LandingPage.howItWorksSubtitle')}
          </Heading>
        </VStack>

        <SimpleGrid columns={{ base: 2, md: 2, lg: 4 }} gap={6} mt={12}>
          {/* Step 1 */}
          <ElectricBorder
            color="var(--chakra-colors-yellow-400)"
            borderRadius={24}
            className={`${styles.electricCard} ${styles.electricCardStep1} reveal-up reveal-up-native`}
          >
            <VStack
              align="stretch"
              p={6}
              bg="bg.panel"
              borderRadius="2xl"
              borderWidth="1px"
              borderColor="border"
              shadow="md"
              position="relative"
              height="100%"
            >
              {/* Animated illustration */}
              <Box
                height="80px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                mb={4}
                position="relative"
                className={styles.iconContainer}
              >
                <svg
                  width="50"
                  height="50"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--chakra-colors-yellow-400)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ overflow: 'visible' }}
                >
                  <rect x="2" y="4" width="20" height="14" rx="2" ry="2" />
                  <line x1="2" y1="20" x2="22" y2="20" />
                  <line x1="12" y1="18" x2="12" y2="20" />
                  <circle
                    cx="12"
                    cy="11"
                    r="3"
                    fill="none"
                    stroke="var(--chakra-colors-yellow-400)"
                    strokeWidth="1"
                    opacity="0.8"
                  >
                    <animate
                      attributeName="r"
                      values="3; 16"
                      keyTimes="0; 1"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.8; 0"
                      keyTimes="0; 1"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <circle
                    cx="12"
                    cy="11"
                    r="3"
                    fill="none"
                    stroke="var(--chakra-colors-yellow-400)"
                    strokeWidth="1"
                    opacity="0.8"
                  >
                    <animate
                      attributeName="r"
                      values="3; 16"
                      keyTimes="0; 1"
                      dur="2s"
                      begin="1s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.8; 0"
                      keyTimes="0; 1"
                      dur="2s"
                      begin="1s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </svg>
              </Box>

              <Badge
                alignSelf="start"
                colorScheme="yellow"
                fontSize="9px"
                fontWeight="black"
                borderRadius="md"
                px={2}
                py={0.5}
                mb={2}
                zIndex={5}
              >
                {t('LandingPage.step1')}
              </Badge>
              <Heading size="xs" color="fg" fontWeight="bold" mb={2} zIndex={5}>
                {t('LandingPage.step1Title').replace(/^\d+\.\s*/, '')}
              </Heading>
              <Text
                fontSize="xs"
                color="fg.muted"
                lineHeight="relaxed"
                zIndex={5}
              >
                {t('LandingPage.step1Desc')}
              </Text>
            </VStack>
          </ElectricBorder>

          {/* Step 2 */}
          <ElectricBorder
            color="var(--chakra-colors-cyan-400)"
            borderRadius={24}
            className={`${styles.electricCard} ${styles.electricCardStep2} reveal-up reveal-up-native delay-1`}
          >
            <VStack
              align="stretch"
              p={6}
              bg="bg.panel"
              borderRadius="2xl"
              borderWidth="1px"
              borderColor="border"
              shadow="md"
              position="relative"
              height="100%"
            >
              {/* Animated illustration */}
              <Box
                height="80px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                mb={4}
                position="relative"
                className={styles.iconContainer}
              >
                <svg
                  width="50"
                  height="50"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--chakra-colors-cyan-400)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ overflow: 'visible' }}
                >
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="var(--chakra-colors-cyan-400)">
                    <animate
                      attributeName="opacity"
                      values="0.3; 1; 0.3"
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                  </path>
                  <path d="M12 6a6 6 0 0 1 6 6" stroke="var(--chakra-colors-cyan-400)">
                    <animate
                      attributeName="opacity"
                      values="1; 0.3; 1"
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                  </path>
                  <circle cx="12" cy="12" r="2" fill="currentColor" />
                  <path d="M12 22v-3" stroke="var(--chakra-colors-cyan-400)" />
                  <path d="M17 22H7" stroke="var(--chakra-colors-cyan-400)" />
                  <path
                    d="M12 12 L 20 4"
                    stroke="var(--chakra-colors-cyan-400)"
                    strokeDasharray="3 3"
                    opacity="0.5"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      from="10"
                      to="0"
                      dur="1s"
                      repeatCount="indefinite"
                    />
                  </path>
                  <path
                    d="M12 12 L 4 4"
                    stroke="var(--chakra-colors-cyan-400)"
                    strokeDasharray="3 3"
                    opacity="0.5"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      from="10"
                      to="0"
                      dur="1s"
                      repeatCount="indefinite"
                    />
                  </path>
                </svg>
              </Box>

              <Badge
                alignSelf="start"
                colorScheme="cyan"
                fontSize="9px"
                fontWeight="black"
                borderRadius="md"
                px={2}
                py={0.5}
                mb={2}
                zIndex={5}
              >
                {t('LandingPage.step2')}
              </Badge>
              <Heading size="xs" color="fg" fontWeight="bold" mb={2} zIndex={5}>
                {t('LandingPage.step2Title').replace(/^\d+\.\s*/, '')}
              </Heading>
              <Text
                fontSize="xs"
                color="fg.muted"
                lineHeight="relaxed"
                zIndex={5}
              >
                {t('LandingPage.step2Desc')}
              </Text>
            </VStack>
          </ElectricBorder>

          {/* Step 3 */}
          <ElectricBorder
            color="var(--chakra-colors-orange-400)"
            borderRadius={24}
            className={`${styles.electricCard} ${styles.electricCardStep3} reveal-up reveal-up-native delay-2`}
          >
            <VStack
              align="stretch"
              p={6}
              bg="bg.panel"
              borderRadius="2xl"
              borderWidth="1px"
              borderColor="border"
              shadow="md"
              position="relative"
              height="100%"
            >
              {/* Animated illustration */}
              <Box
                height="80px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                mb={4}
                position="relative"
                className={styles.iconContainer}
              >
                <svg
                  width="65"
                  height="50"
                  viewBox="0 0 80 60"
                  fill="none"
                  stroke="var(--chakra-colors-orange-400)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ overflow: 'visible' }}
                >
                  <rect
                    x="10"
                    y="22"
                    width="14"
                    height="22"
                    rx="2"
                    stroke="var(--chakra-colors-fg)"
                  />
                  <circle cx="17" cy="40" r="0.8" fill="currentColor" />
                  <rect
                    x="56"
                    y="26"
                    width="10"
                    height="18"
                    rx="1.5"
                    stroke="var(--chakra-colors-fg)"
                  />
                  <circle
                    cx="40"
                    cy="12"
                    r="3"
                    fill="var(--chakra-colors-orange-400)"
                  >
                    <animate
                      attributeName="r"
                      values="3; 4.5; 3"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  <line
                    x1="40"
                    y1="12"
                    x2="24"
                    y2="28"
                    stroke="var(--chakra-colors-orange-400)"
                    strokeDasharray="3 3"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      from="6"
                      to="0"
                      dur="1.2s"
                      repeatCount="indefinite"
                    />
                  </line>
                  <line
                    x1="40"
                    y1="12"
                    x2="56"
                    y2="28"
                    stroke="var(--chakra-colors-orange-400)"
                    strokeDasharray="3 3"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      from="6"
                      to="0"
                      dur="1.2s"
                      repeatCount="indefinite"
                    />
                  </line>
                </svg>
              </Box>

              <Badge
                alignSelf="start"
                colorScheme="orange"
                fontSize="9px"
                fontWeight="black"
                borderRadius="md"
                px={2}
                py={0.5}
                mb={2}
                zIndex={5}
              >
                {t('LandingPage.step3')}
              </Badge>
              <Heading size="xs" color="fg" fontWeight="bold" mb={2} zIndex={5}>
                {t('LandingPage.step3Title').replace(/^\d+\.\s*/, '')}
              </Heading>
              <Text
                fontSize="xs"
                color="fg.muted"
                lineHeight="relaxed"
                zIndex={5}
              >
                {t('LandingPage.step3Desc')}
              </Text>
            </VStack>
          </ElectricBorder>

          {/* Step 4 */}
          <ElectricBorder
            color="var(--chakra-colors-teal-400)"
            borderRadius={24}
            className={`${styles.electricCard} ${styles.electricCardStep4} reveal-up reveal-up-native delay-3`}
          >
            <VStack
              align="stretch"
              p={6}
              bg="bg.panel"
              borderRadius="2xl"
              borderWidth="1px"
              borderColor="border"
              shadow="md"
              position="relative"
              height="100%"
            >
              {/* Animated illustration */}
              <Box
                height="80px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                mb={4}
                position="relative"
                className={styles.iconContainer}
              >
                <svg
                  width="65"
                  height="50"
                  viewBox="0 0 80 40"
                  fill="none"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ overflow: 'visible' }}
                >
                  <path
                    d="M 10 20 Q 22.5 5, 35 20 T 60 20 T 70 20"
                    stroke="var(--chakra-colors-primary)"
                    opacity="0.5"
                    strokeDasharray="40 5"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      from="45"
                      to="0"
                      dur="2.5s"
                      repeatCount="indefinite"
                    />
                  </path>
                  <path
                    d="M 10 20 Q 22.5 5, 35 20 T 60 20 T 70 20"
                    stroke="var(--chakra-colors-teal-400)"
                    opacity="0.8"
                    strokeDasharray="40 5"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      from="45"
                      to="0"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </path>
                  <path
                    d="M 36 26 L 40 30 L 48 22"
                    stroke="var(--chakra-colors-teal-400)"
                    strokeWidth="2.5"
                    strokeDasharray="20"
                    strokeDashoffset="20"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      values="20; 0; 0; 20"
                      keyTimes="0; 0.4; 0.8; 1"
                      dur="3s"
                      repeatCount="indefinite"
                    />
                  </path>
                </svg>
              </Box>

              <Badge
                alignSelf="start"
                colorScheme="teal"
                fontSize="9px"
                fontWeight="black"
                borderRadius="md"
                px={2}
                py={0.5}
                mb={2}
                zIndex={5}
              >
                {t('LandingPage.step4')}
              </Badge>
              <Heading size="xs" color="fg" fontWeight="bold" mb={2} zIndex={5}>
                {t('LandingPage.step4Title').replace(/^\d+\.\s*/, '')}
              </Heading>
              <Text
                fontSize="xs"
                color="fg.muted"
                lineHeight="relaxed"
                zIndex={5}
              >
                {t('LandingPage.step4Desc')}
              </Text>
            </VStack>
          </ElectricBorder>
        </SimpleGrid>
      </Box>
    </Box>
  );
};

export default HowItWorksSection;
