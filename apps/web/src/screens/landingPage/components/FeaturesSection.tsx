import * as React from 'react';
import { Box, VStack, Heading, Text, SimpleGrid, Flex, useToken } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Icon, IconType } from '@assets';
import { GlassBox, LightPillar } from '@components';

const featureCards = [
  {
    icon: IconType.SYNC,
    titleKey: 'LandingPage.feature1Title',
    descKey: 'LandingPage.feature1Desc',
    className: 'reveal-scale reveal-scale-native',
  },
  {
    icon: IconType.BOLT,
    titleKey: 'LandingPage.feature2Title',
    descKey: 'LandingPage.feature2Desc',
    className: 'reveal-scale reveal-scale-native delay-1',
  },
  {
    icon: IconType.USER,
    titleKey: 'LandingPage.feature3Title',
    descKey: 'LandingPage.feature3Desc',
    className: 'reveal-scale reveal-scale-native delay-2',
  },
  {
    icon: IconType.LOCK,
    titleKey: 'LandingPage.feature4Title',
    descKey: 'LandingPage.feature4Desc',
    className: 'reveal-scale reveal-scale-native delay-3',
  },
];

export const FeaturesSection = () => {
  const { t } = useTranslation();
  const [topColor, bottomColor] = useToken('colors', ['pillar.top', 'pillar.bottom']);

  return (
    <Box
      py={40}
      px={{ base: 6, md: 16 }}
      bg="bg.panel"
      borderTopWidth="1px"
      borderColor="border"
      position="relative"
      overflow="hidden"
    >
      {/* Light Pillar background decoration */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        zIndex={0}
        pointerEvents="none"
        opacity={0.35}
      >
        <LightPillar
          topColor={topColor}
          bottomColor={bottomColor}
          intensity={1}
          rotationSpeed={1.5}
          pillarRotation={90}
          noiseIntensity={0.5}
          pillarHeight={1.3}
          pillarWidth={3}
          interactive={false}
          glowAmount={0.006}
          quality="high"
        />
      </Box>

      <Box maxW="1200px" mx="auto" position="relative" zIndex={1}>
        <VStack
          gap={3}
          textAlign="center"
          mb={16}
          className="reveal-up reveal-up-native"
        >
          <Heading as="h2" size="xl" color="fg" fontWeight="bold">
            {t('LandingPage.featuresTitle')}
          </Heading>
          <Text color="fg.muted" fontSize="md" maxW="600px">
            {t('LandingPage.featuresSubtitle')}
          </Text>
        </VStack>

        <SimpleGrid columns={{ base: 2, md: 2, lg: 4 }} gap={8} zIndex={100}>
          {featureCards.map(({ icon, titleKey, descKey, className }) => (
            <GlassBox
              key={titleKey}
              width="100%"
              height="100%"
              borderRadius={20}
              className={className}
            >
              <VStack
                align="start"
                p={6}
                gap={4}
                h="full"
                transition="all 0.2s"
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
                  <Icon type={icon} size="20px" />
                </Flex>
                <Heading as="h3" size="sm" fontWeight="bold" color="fg">
                  {t(titleKey)}
                </Heading>
                <Text fontSize="xs" color="fg.muted" lineHeight="relaxed">
                  {t(descKey)}
                </Text>
              </VStack>
            </GlassBox>
          ))}
        </SimpleGrid>
      </Box>
    </Box>
  );
};

export default FeaturesSection;
