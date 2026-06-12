import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';
import colors from './colors';
import {
  breakpoints,
  fontSize,
  fontWeight,
  lineHeight,
  zIndices,
} from './fonts';

const customConfig = defineConfig({
  theme: {
    breakpoints: {
      sm: breakpoints.sm,
      md: breakpoints.md,
      lg: breakpoints.lg,
      xl: breakpoints.xl,
      '2xl': breakpoints['2xl'],
    },
    tokens: {
      colors: {
        transparent: { value: colors.transparent },
        primary: { value: colors.primary },
        secondary: { value: colors.secondary },
        // Social colors
        'social.facebook': { value: colors.social.facebook },
        'social.linkedin': { value: colors.social.linkedin },
        'social.instagram': { value: colors.social.instagram },
        'social.youtube': { value: colors.social.youtube },
        // Cool colors
        'coolColor.1': { value: colors.coolColor[1] },
        'coolColor.2': { value: colors.coolColor[2] },
        'coolColor.3': { value: colors.coolColor[3] },
        'coolColor.4': { value: colors.coolColor[4] },
        'coolColor.5': { value: colors.coolColor[5] },
        'coolColor.6': { value: colors.coolColor[6] },
        'coolColor.7': { value: colors.coolColor[7] },
        'coolColor.8': { value: colors.coolColor[8] },
        // Green scale
        'green.100': { value: colors.green[100] },
        'green.200': { value: colors.green[200] },
        'green.300': { value: colors.green[300] },
        'green.400': { value: colors.green[400] },
        'green.500': { value: colors.green[500] },
        'green.600': { value: colors.green[600] },
        'green.700': { value: colors.green[700] },
        'green.800': { value: colors.green[800] },
        'green.900': { value: colors.green[900] },
        // Mint scale
        'mint.100': { value: colors.mint[100] },
        'mint.200': { value: colors.mint[200] },
        'mint.300': { value: colors.mint[300] },
        'mint.400': { value: colors.mint[400] },
        'mint.500': { value: colors.mint[500] },
        'mint.600': { value: colors.mint[600] },
        'mint.700': { value: colors.mint[700] },
        'mint.800': { value: colors.mint[800] },
        'mint.900': { value: colors.mint[900] },
        // Neutral scale
        'neutral.100': { value: colors.neutral[100] },
        'neutral.200': { value: colors.neutral[200] },
        'neutral.300': { value: colors.neutral[300] },
        'neutral.400': { value: colors.neutral[400] },
        'neutral.500': { value: colors.neutral[500] },
        'neutral.600': { value: colors.neutral[600] },
        'neutral.700': { value: colors.neutral[700] },
        'neutral.800': { value: colors.neutral[800] },
        'neutral.900': { value: colors.neutral[900] },
        // Status colors
        'success.100': { value: colors.success[100] },
        'success.400': { value: colors.success[400] },
        'warning.100': { value: colors.warning[100] },
        'warning.400': { value: colors.warning[400] },
        'error.100': { value: colors.error[100] },
        'error.400': { value: colors.error[400] },
        // Yellow scale
        'yellow.100': { value: colors.yellow[100] },
        'yellow.400': { value: colors.yellow[400] },
        'yellow.500': { value: colors.yellow[500] },
        // Orange scale
        'orange.100': { value: colors.orange[100] },
        'orange.400': { value: colors.orange[400] },
        'orange.500': { value: colors.orange[500] },
        // Blue scale
        'blue.100': { value: colors.blue[100] },
        'blue.200': { value: colors.blue[200] },
        'blue.300': { value: colors.blue[300] },
        'blue.400': { value: colors.blue[400] },
        'blue.500': { value: colors.blue[500] },
        'blue.600': { value: colors.blue[600] },
        'blue.700': { value: colors.blue[700] },
        // Purple scale
        'purple.100': { value: colors.purple[100] },
        'purple.200': { value: colors.purple[200] },
        'purple.300': { value: colors.purple[300] },
        'purple.400': { value: colors.purple[400] },
        'purple.500': { value: colors.purple[500] },
        'purple.600': { value: colors.purple[600] },
        // Cyan scale
        'cyan.100': { value: colors.cyan[100] },
        'cyan.200': { value: colors.cyan[200] },
        'cyan.300': { value: colors.cyan[300] },
        'cyan.400': { value: colors.cyan[400] },
        'cyan.500': { value: colors.cyan[500] },
        'cyan.600': { value: colors.cyan[600] },
        // Teal scale
        'teal.100': { value: colors.teal[100] },
        'teal.200': { value: colors.teal[200] },
        'teal.300': { value: colors.teal[300] },
        'teal.400': { value: colors.teal[400] },
        'teal.500': { value: colors.teal[500] },
        'teal.600': { value: colors.teal[600] },
      },
      fonts: {
        heading: { value: `'Geist', sans-serif` },
        body: { value: `'Hanken Grotesk', sans-serif` },
        mono: { value: `'JetBrains Mono', monospace` },
      },
      fontSizes: {
        xs: { value: fontSize.xs },
        sm: { value: fontSize.sm },
        md: { value: fontSize.md },
        lg: { value: fontSize.lg },
        xl: { value: fontSize.xl },
        '2xl': { value: fontSize['2xl'] },
        '3xl': { value: fontSize['3xl'] },
        '4xl': { value: fontSize['4xl'] },
        '5xl': { value: fontSize['5xl'] },
        '6xl': { value: fontSize['6xl'] },
        '7xl': { value: fontSize['7xl'] },
        '8xl': { value: fontSize['8xl'] },
        '9xl': { value: fontSize['9xl'] },
      },
      fontWeights: {
        hairline: { value: String(fontWeight.hairline) },
        thin: { value: String(fontWeight.thin) },
        light: { value: String(fontWeight.light) },
        normal: { value: String(fontWeight.normal) },
        medium: { value: String(fontWeight.medium) },
        semibold: { value: String(fontWeight.semibold) },
        bold: { value: String(fontWeight.bold) },
        extrabold: { value: String(fontWeight.extrabold) },
        black: { value: String(fontWeight.black) },
      },
      lineHeights: {
        none: { value: String(lineHeight.none) },
        shorter: { value: String(lineHeight.shorter) },
        short: { value: String(lineHeight.short) },
        base: { value: String(lineHeight.base) },
        tall: { value: String(lineHeight.tall) },
        taller: { value: lineHeight.taller },
      },
      zIndex: {
        hide: { value: zIndices.hide },
        base: { value: zIndices.base },
        docked: { value: zIndices.docked },
        dropdown: { value: zIndices.dropdown },
        sticky: { value: zIndices.sticky },
        banner: { value: zIndices.banner },
        overlay: { value: zIndices.overlay },
        modal: { value: zIndices.modal },
        popover: { value: zIndices.popover },
        toast: { value: zIndices.toast },
        tooltip: { value: zIndices.tooltip },
      },
      radii: {
        sm: { value: '0.25rem' },
        DEFAULT: { value: '0.5rem' },
        md: { value: '0.75rem' },
        lg: { value: '1rem' },
        xl: { value: '1.5rem' },
        full: { value: '9999px' },
      },
      spacing: {
        unit: { value: '4px' },
        gutter: { value: '24px' },
        'margin-mobile': { value: '16px' },
        'margin-desktop': { value: '64px' },
        'stack-sm': { value: '8px' },
        'stack-md': { value: '16px' },
        'stack-lg': { value: '32px' },
      },
    },
    semanticTokens: {
      colors: {
        primary: {
          value: { _light: '#53606d', _dark: '#bac8d7' },
        },
        'green.700': {
          value: { _light: '#0088cc', _dark: '#bac8d7' },
        },
        'green.800': {
          value: { _light: '#007bb9', _dark: '#9fadbb' },
        },
        'green.900': {
          value: { _light: '#006193', _dark: '#34414d' },
        },
        'neutral.200': {
          value: { _light: colors.neutral[200], _dark: colors.neutral[800] },
        },
        'neutral.800': {
          value: { _light: colors.neutral[800], _dark: colors.neutral[200] },
        },
        fg: {
          value: { _light: '#212529', _dark: '#e2e2e5' },
        },
        'fg.muted': {
          value: { _light: '#5b5f63', _dark: '#c4c7cb' },
        },
        'fg.subtle': {
          value: { _light: '#8e9196', _dark: '#8e9196' },
        },
        'bg.default': {
          value: { _light: '#f8f9fa', _dark: '#121416' },
        },
        'bg.panel': {
          value: { _light: '#ffffff', _dark: '#1e2022' },
        },
        'bg.subtle': {
          value: { _light: '#e3e3e3', _dark: '#1a1c1e' },
        },
        'bg.muted': {
          value: { _light: '#cccbcb', _dark: '#282a2c' },
        },
        border: {
          value: { _light: '#cccbcb', _dark: '#44474b' },
        },
        'border.muted': {
          value: { _light: '#e3e3e3', _dark: '#282a2c' },
        },
        'pillar.top': {
          value: { _light: '#450470ff', _dark: '#7000b9ff' },
        },
        'pillar.bottom': {
          value: { _light: '#036943ff', _dark: '#00d184ff' },
        },
        // Terminal log line colors — adapt to light/dark mode
        // Dark: bright neon for readability on dark bg
        // Light: deeper saturated shades for readability on white bg
        'terminal.sys': {
          value: { _light: '#16a34a', _dark: '#4ade80' },
        },
        'terminal.net': {
          value: { _light: '#1d4ed8', _dark: '#60a5fa' },
        },
        'terminal.sync': {
          value: { _light: '#7c3aed', _dark: '#c084fc' },
        },
        'terminal.wave': {
          value: { _light: '#a16207', _dark: '#facc15' },
        },
        'terminal.audio': {
          value: { _light: '#0e7490', _dark: '#22d3ee' },
        },
        'terminal.default': {
          value: { _light: '#374151', _dark: '#d1d5db' },
        },
      },
    },
    textStyles: {
      'display-lg': {
        value: {
          fontFamily: 'heading',
          fontSize: '48px',
          fontWeight: '600',
          lineHeight: '56px',
          letterSpacing: '-0.04em',
        },
      },
      'display-lg-mobile': {
        value: {
          fontFamily: 'heading',
          fontSize: '32px',
          fontWeight: '600',
          lineHeight: '40px',
          letterSpacing: '-0.03em',
        },
      },
      'headline-md': {
        value: {
          fontFamily: 'heading',
          fontSize: '24px',
          fontWeight: '500',
          lineHeight: '32px',
          letterSpacing: '-0.02em',
        },
      },
      'body-lg': {
        value: {
          fontFamily: 'body',
          fontSize: '18px',
          fontWeight: '400',
          lineHeight: '28px',
        },
      },
      'body-md': {
        value: {
          fontFamily: 'body',
          fontSize: '16px',
          fontWeight: '400',
          lineHeight: '24px',
        },
      },
      'label-sm': {
        value: {
          fontFamily: 'mono',
          fontSize: '12px',
          fontWeight: '500',
          lineHeight: '16px',
          letterSpacing: '0.05em',
        },
      },
    },
  },
});

export const system = createSystem(defaultConfig, {
  ...customConfig,
  disableLayers: true,
});

export default system;
