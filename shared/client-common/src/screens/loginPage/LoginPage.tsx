import { useState } from 'react';
import {
  Box,
  Button,
  Center,
  Heading,
  Input,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Logo } from '@assets';
import { appStore } from '@appStore';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveAccount = appStore((state) => state.saveAccount);
  const setCurrentAccount = appStore((state) => state.setCurrentAccount);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      setError(t('LoginPage.phone.errorEmpty'));
      return;
    }

    setIsLoading(true);
    setError(null);

    // Simulate login loading delay
    setTimeout(() => {
      setIsLoading(false);
      // Save account and set as current
      const mockApiId = '123456';
      const mockApiHash = 'mock_hash';
      saveAccount(phone, mockApiId, mockApiHash);
      setCurrentAccount({ phone, apiId: mockApiId, apiHash: mockApiHash });
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <Center minH="calc(100vh - 4rem - 300px)" py={12} px={4}>
      <VStack gap={8} w="100%" maxW="460px">
        <VStack gap={2} textAlign="center">
          <Box w={12} h={12} mb={2}>
            <Logo size="100%" />
          </Box>
          <Heading size="lg" fontWeight="extrabold" color="fg">
            {t('LoginPage.title')}
          </Heading>
          <Text fontSize="xs" color="fg.muted" maxW="360px">
            {t('LoginPage.subtitle')}
          </Text>
        </VStack>

        <Box
          w="100%"
          bg="bg.panel"
          borderRadius="2xl"
          borderWidth="1px"
          borderColor="border"
          p={{ base: 4, sm: 6, md: 8 }}
          shadow="2xl"
        >
          <form onSubmit={handleLogin}>
            <VStack gap={5} align="stretch">
              <VStack align="stretch" gap={1.5}>
                <Text fontSize="xs" fontWeight="bold" color="fg.muted">
                  {t('LoginPage.phone.label')}
                </Text>
                <Input
                  placeholder={t('LoginPage.phone.placeholder')}
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (error) setError(null);
                  }}
                  border="1px solid"
                  borderColor="border"
                  borderRadius="xl"
                  size="lg"
                  px={4}
                  _focus={{
                    borderColor: 'primary',
                    ring: '1px',
                    ringColor: 'primary',
                  }}
                />
                {error && (
                  <Text fontSize="2xs" color="error.400" mt={0.5}>
                    {error}
                  </Text>
                )}
              </VStack>

              <Button
                type="submit"
                size="lg"
                bg="primary"
                color="white"
                borderRadius="xl"
                fontWeight="bold"
                isLoading={isLoading}
                _hover={{ bg: 'primary/90' }}
              >
                {t('LoginPage.phone.button')}
              </Button>
            </VStack>
          </form>
        </Box>
      </VStack>
    </Center>
  );
};

export default LoginPage;
