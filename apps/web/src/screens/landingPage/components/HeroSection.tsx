import * as React from 'react';
import {
  Stack,
  VStack,
  Heading,
  Text,
  SimpleGrid,
  Button,
  Box,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GlassBox } from '@components';
import styles from '../landingPage.module.css';

interface HeroSectionProps {
  children: React.ReactNode;
}

export const HeroSection = ({ children }: HeroSectionProps) => {
  const { t } = useTranslation();

  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      width="100%"
      minHeight="90vh"
      className={styles.techGrid}
      py={{ base: 10, md: 14 }}
      px={{ base: 6, md: 16 }}
      position="relative"
      overflow="hidden"
      zIndex={1}
      bgGradient={{
        base: 'radial(circle at 50% -20%, #e6f4ff, bg.default 80%)',
        _dark:
          'radial(circle at 50% -20%, rgba(139, 92, 246, 0.15), bg.default 80%)',
      }}
    >
      {/* Immersive moving glows */}
      <div className={styles.radialGlow1} />
      <div className={styles.radialGlow2} />

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
          flex={1.1}
          maxW={{ base: 'xl', lg: 'none' }}
        >
          <GlassBox width="auto" height="auto" borderRadius={20}>
            <Box px={4} py={1.5} fontSize="xs" fontWeight="bold">
              {t('LandingPage.heroBadge')}
            </Box>
          </GlassBox>

          <Heading
            size={{ base: 'xl', md: '2xl', lg: '3xl' }}
            color="fg"
            lineHeight="tight"
            fontWeight="black"
            letterSpacing="tight"
          >
            {t('LandingPage.heroTitlePrefix')}
            <br />
            <Text
              as="span"
              className={styles.textShineEffect}
              display="inline-block"
            >
              {t('LandingPage.heroTitleSpan')}
            </Text>
          </Heading>

          <Text
            fontSize={{ base: 'md', md: 'lg' }}
            color="fg.muted"
            lineHeight="relaxed"
            maxW="540px"
          >
            {t('LandingPage.heroDescription')}
          </Text>

          {/* Floating glassmorphic stat cards */}
          <SimpleGrid
            columns={{ base: 2, sm: 2 }}
            gap={4}
            width="100%"
            maxW="540px"
          >
            <VStack
              align="start"
              p={3}
              bg="rgba(139, 92, 246, 0.05)"
              borderRadius="xl"
              borderWidth="1px"
              borderColor="rgba(139, 92, 246, 0.15)"
              backdropFilter="blur(8px)"
              gap={0.5}
            >
              <Text
                fontSize="8px"
                fontWeight="bold"
                fontFamily="mono"
                color="fg.muted"
                letterSpacing="wider"
              >
                {t('LandingPage.statsActiveNodes').toUpperCase()}
              </Text>
              <Heading
                size="xs"
                color="primary"
                fontWeight="bold"
                fontFamily="mono"
              >
                3 / 5
              </Heading>
            </VStack>
            <VStack
              align="start"
              p={3}
              bg="rgba(0, 136, 204, 0.05)"
              borderRadius="xl"
              borderWidth="1px"
              borderColor="rgba(0, 136, 204, 0.15)"
              backdropFilter="blur(8px)"
              gap={0.5}
            >
              <Text
                fontSize="8px"
                fontWeight="bold"
                fontFamily="mono"
                color="fg.muted"
                letterSpacing="wider"
              >
                {t('LandingPage.statsSyncRate').toUpperCase()}
              </Text>
              <Heading
                size="xs"
                color="success.400"
                fontWeight="bold"
                fontFamily="mono"
              >
                99.99%
              </Heading>
            </VStack>
          </SimpleGrid>

          <Stack
            direction={{ base: 'column', sm: 'row' }}
            gap={4}
            width={{ base: '100%', sm: 'auto' }}
            mt={2}
          >
            <Link to="/product" style={{ textDecoration: 'none' }}>
              <GlassBox width="auto" height="auto" borderRadius={12}>
                <Box
                  px={8}
                  py={3}
                  fontWeight="bold"
                  textAlign="center"
                  borderRadius={12}
                >
                  {t('LandingPage.downloadApp')}
                </Box>
              </GlassBox>
            </Link>
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
              <Link to="/docs">{t('LandingPage.readDocs')}</Link>
            </Button>
          </Stack>
        </VStack>

        {/* RIGHT: Diagnostics Terminal */}
        {children}
      </Stack>

      {/* Scroll indicator */}
      <VStack
        position="absolute"
        bottom={4}
        left="50%"
        transform="translateX(-50%)"
        gap={1}
        className="scroll-indicator"
        zIndex={5}
      >
        <Text
          fontSize="10px"
          fontWeight="bold"
          color="fg.muted"
          letterSpacing="widest"
        >
          {t('LandingPage.scrollExplore')}
        </Text>
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
          <line x1="12" y1="5" x2="12" y2="19" />
          <polyline points="19 12 12 19 5 12" />
        </svg>
      </VStack>
    </Stack>
  );
};

export default HeroSection;
