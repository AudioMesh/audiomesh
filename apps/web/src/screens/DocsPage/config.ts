export interface DocItem {
  id: string;
  titleKey: string;
  filePath: string;
}

export interface DocTopic {
  titleKey: string;
  items: DocItem[];
}

export const DOCS_TOPICS: DocTopic[] = [
  {
    titleKey: 'DocsPage.gettingStarted',
    items: [
      {
        id: 'introduction',
        titleKey: 'NavigationBar.introduction',
        filePath: 'data/product/introduction',
      },
      {
        id: 'quickstart',
        titleKey: 'NavigationBar.quickstart',
        filePath: 'data/product/quickstart',
      },
      {
        id: 'setup-guide',
        titleKey: 'NavigationBar.setup-guide',
        filePath: 'data/product/telegram-credentials',
      },
    ],
  },
  {
    titleKey: 'DocsPage.architecture',
    items: [
      {
        id: 'system-design',
        titleKey: 'NavigationBar.system-design',
        filePath: 'data/product/system-design',
      },
      {
        id: 'mtproto',
        titleKey: 'NavigationBar.mtproto',
        filePath: 'data/product/mtproto',
      },
      {
        id: 'direct-storage',
        titleKey: 'NavigationBar.direct-storage',
        filePath: 'data/product/direct-storage',
      },
    ],
  },
  {
    titleKey: 'DocsPage.reference',
    items: [
      {
        id: 'api-reference',
        titleKey: 'NavigationBar.api-reference',
        filePath: 'data/product/api-reference',
      },
    ],
  },
  {
    titleKey: 'NavigationBar.version-history',
    items: [
      {
        id: 'version-history-desktop',
        titleKey: 'NavigationBar.version-history-desktop',
        filePath: 'data/product/version-history-desktop',
      },
      {
        id: 'version-history-mobile',
        titleKey: 'NavigationBar.version-history-mobile',
        filePath: 'data/product/version-history-mobile',
      },
    ],
  },
];

