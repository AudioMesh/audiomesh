import {
  Box,
  Button,
  HStack,
  Heading,
  Menu,
  Text,
  IconButton,
} from '@chakra-ui/react';
import { Icon, IconType } from '@assets';

import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';

import { NAVIGATION_LINKS } from './constants';

const GitHubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="currentColor"
    {...props}
  >
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

const NavigationBar = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const isDocsPage = pathname.startsWith('/docs');

  return (
    <Box
      borderBottomWidth={1}
      borderBottomColor="border"
      shadow="sm"
      position="sticky"
      top={0}
      zIndex={50}
      bg="bg.panel"
      width="100%"
      px={isDocsPage ? { base: 6, lg: 6 } : { base: 6, md: 16 }}
    >
      <HStack
        height={16}
        maxW={isDocsPage ? '1400px' : '1200px'}
        mx="auto"
        justifyContent={'space-between'}
        width="100%"
      >
      {/* Logo */}
      <HStack
        gap={1}
        _hover={{
          cursor: 'pointer',
        }}
      >
        <Link
          to={'/'}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Box
            color={'white'}
            width={'2.5rem'}
            height={'2.5rem'}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Icon type={IconType.LOGO} />
          </Box>
          <Box display="flex">
            <Heading size={'md'} color={'primary'} fontWeight="bold">
              {t('Title')}
            </Heading>
          </Box>
        </Link>
      </HStack>

      {/* Right side: nav links + GitHub + mobile menu */}
      <HStack gap={4}>
        <HStack gap={{ base: 2, xl: 4 }} display={{ base: 'none', md: 'flex' }}>
          {NAVIGATION_LINKS.map(({ name, link }) => (
            <Button
              asChild
              variant={'ghost'}
              key={link}
              aria-label={link + '-nav-link'}
              px={3}
              py={2}
              borderRadius="md"
              color="fg.muted"
              _hover={{ bg: 'bg.hover', color: 'primary' }}
              transition="all 0.2s"
            >
              <Link to={link} style={{ display: 'flex', alignItems: 'center' }}>
                <Text fontSize="sm" fontWeight={'medium'}>
                  {t(`NavigationBar.${name.toLowerCase()}`)}
                </Text>
              </Link>
            </Button>
          ))}
        </HStack>

        <IconButton
          asChild
          variant="ghost"
          aria-label={t('NavigationBar.githubRepository')}
          borderRadius="md"
          color="fg.muted"
          _hover={{ bg: 'bg.hover', color: 'primary' }}
          transition="all 0.2s"
          size="sm"
        >
          <a
            href="https://github.com/audiomesh/audiomesh"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <GitHubIcon />
          </a>
        </IconButton>

        <Box display={{ base: 'flex', md: 'none' }} alignItems="center">
          <Menu.Root positioning={{ placement: 'bottom-end' }}>
            <Menu.Trigger asChild>
              <Button
                variant={'outline'}
                borderColor="border"
                borderWidth={1}
                px={3}
                py={2}
                size="sm"
              >
                {t('NavigationBar.menu')}
                <Icon type={IconType.MENU} />
              </Button>
            </Menu.Trigger>
            <Menu.Positioner>
              <Menu.Content
                zIndex={100}
                borderRadius="md"
                boxShadow={'md'}
                bg="bg.panel"
                borderColor="border"
              >
                {NAVIGATION_LINKS.map(({ name, link }) => (
                  <Menu.Item key={link} value={link} asChild>
                    <Link
                      to={link}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '8px 16px',
                      }}
                    >
                      <Text fontSize="sm" fontWeight={'medium'}>
                        {t(`NavigationBar.${name.toLowerCase()}`)}
                      </Text>
                    </Link>
                  </Menu.Item>
                ))}
              </Menu.Content>
            </Menu.Positioner>
          </Menu.Root>
        </Box>
      </HStack>
    </HStack>
  </Box>
);
};

export default NavigationBar;
