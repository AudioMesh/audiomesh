import { useEffect, useState } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { Box, Container, Spinner } from '@chakra-ui/react';
import { MdPreview, getMdFileDataInString } from '@components/MdPreview';
import { useTranslation } from 'react-i18next';
import { MD_PAGE_CONFIG } from './const';

const MdPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [mdContent, setMdContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Derive slug from last path segment: "/privacy" → "privacy"
  const slug = location.pathname.split('/').filter(Boolean).pop() ?? '';
  const config = MD_PAGE_CONFIG[slug];

  useEffect(() => {
    if (!config) return;

    setIsLoading(true);
    setMdContent('');

    getMdFileDataInString(config.filePath, (data) => {
      setMdContent(data);
      setIsLoading(false);
    });
  }, [config]);

  // Redirect to home for unknown slugs
  if (!config) {
    return <Navigate to="/" replace />;
  }

  const pagePadding = { base: 4, sm: 6, md: 8 };

  return (
    <Box flex={1} bg="bg" minH="60vh">
      {/* Markdown Content */}
      <Container
        maxW={{ base: '100%', md: '3xl', lg: '4xl' }}
        py={12}
        px={pagePadding}
      >
        {isLoading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minH="300px"
            width="full"
            aria-busy="true"
            aria-label={t('MdPage.loadingDocument')}
          >
            <Spinner size="xl" color="primary" />
          </Box>
        ) : (
          <MdPreview mdString={mdContent} />
        )}
      </Container>
    </Box>
  );
};

export default MdPage;
