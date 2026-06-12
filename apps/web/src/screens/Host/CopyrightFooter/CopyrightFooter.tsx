import {
  Box,
  Button,
  HStack,
  Text,
  VStack,
  Stack,
  Heading,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Logo } from '@assets';
import { ThemeSelector, LanguageSelector } from '@components';

const CopyrightFooter = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const LEGAL_LINKS = [
    { titleKey: 'Footer.privacyPolicy', path: '/privacy' },
    { titleKey: 'Footer.termsOfService', path: '/terms' },
    { titleKey: 'Footer.disclaimer', path: '/disclaimer' },
  ];

  const TEAM_LINKS = [
    { titleKey: 'Footer.contactUs', path: '/contact-us' },
    { titleKey: 'Footer.aboutUs', path: '/about-us' },
    { titleKey: 'Footer.faqs', path: '/faq' },
  ];

  return (
    <Box
      as="footer"
      width="100%"
      bg="bg.panel"
      borderTopWidth="1px"
      borderTopColor="border"
      py={10}
      px={{ base: 6, md: 16 }}
    >
      <VStack gap={8} align="stretch" maxW="1200px" mx="auto">
        {/* Top Section */}
        <Stack
          direction={{ base: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ base: 'center', md: 'flex-start' }}
          gap={6}
        >
          {/* Brand Info */}
          <VStack align={{ base: 'center', md: 'flex-start' }} gap={2} maxW="280px">
            <HStack gap={2} alignItems="center">
              <Box w={8} h={8} flexShrink={0}>
                <Logo size="100%" />
              </Box>
              <Heading size="sm" color="primary" fontWeight="bold">
                AudioMesh
              </Heading>
            </HStack>
            <Text
              fontSize="xs"
              color="fg.muted"
              textAlign={{ base: 'center', md: 'left' }}
              lineHeight="relaxed"
            >
              {t('Footer.tagline')}
            </Text>
          </VStack>

          {/* Links Columns */}
          <HStack
            gap={{ base: 8, sm: 16 }}
            align="flex-start"
            justify={{ base: 'space-between', sm: 'flex-end' }}
            width={{ base: '100%', md: 'auto' }}
            maxW={{ base: '280px', sm: 'none' }}
            mx={{ base: 'auto', sm: '0' }}
          >
            {/* Legal Column */}
            <VStack align="flex-start" gap={1.5}>
              <Text
                fontSize="10px"
                fontWeight="bold"
                textTransform="uppercase"
                letterSpacing="widest"
                color="fg.muted"
                mb={1}
              >
                {t('Footer.legalHeading')}
              </Text>
              {LEGAL_LINKS.map(({ path, titleKey }) => (
                <Button
                  key={path}
                  fontSize="xs"
                  fontWeight="medium"
                  variant="ghost"
                  color="fg.muted"
                  _hover={{ color: 'primary', bg: 'bg.hover' }}
                  px={2}
                  py={1}
                  borderRadius="md"
                  height="auto"
                  asChild
                >
                  <Link to={path}>{t(titleKey)}</Link>
                </Button>
              ))}
            </VStack>

            {/* Company Column */}
            <VStack align="flex-start" gap={1.5}>
              <Text
                fontSize="10px"
                fontWeight="bold"
                textTransform="uppercase"
                letterSpacing="widest"
                color="fg.muted"
                mb={1}
              >
                {t('Footer.teamHeading')}
              </Text>
              {TEAM_LINKS.map(({ path, titleKey }) => (
                <Button
                  key={path}
                  fontSize="xs"
                  fontWeight="medium"
                  variant="ghost"
                  color="fg.muted"
                  _hover={{ color: 'primary', bg: 'bg.hover' }}
                  px={2}
                  py={1}
                  borderRadius="md"
                  height="auto"
                  asChild
                >
                  <Link to={path}>{t(titleKey)}</Link>
                </Button>
              ))}
            </VStack>
          </HStack>
        </Stack>

        {/* Divider */}
        <Box borderTopWidth="1px" borderTopColor="border" />

        {/* Bottom Bar */}
        <Stack
          direction={{ base: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems="center"
          gap={4}
        >
          <Text
            fontSize="xs"
            color="fg.muted"
            textAlign={{ base: 'center', sm: 'left' }}
          >
            {t('Footer.copyrightText', { year: currentYear })}
          </Text>
          <HStack gap={3}>
            <LanguageSelector />
            <ThemeSelector />
          </HStack>
        </Stack>
      </VStack>
    </Box>
  );
};

export default CopyrightFooter;
