
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';

export type AppColors = {
  isDark: boolean;
  pageBackground: string;
  cardBackground: string;
  softBlock: string;
  sectionBg: string;
  mutedText: string;
  borderColor: string;
  inputBg: string;
  textColor: string;
  primaryColor: string;
  successColor: string;
  warningColor: string;
  dangerColor: string;
  infoColor: string;
  onPrimary: string;
};

// Palette UI commune pour tous les écrans métiers
export function useAppColors(): AppColors {
  const scheme = useColorScheme() ?? 'light';
  const isDark = scheme === 'dark';

  return {
    isDark,
    pageBackground: isDark ? '#11131A' : '#F4F4F7',
    cardBackground: isDark ? '#1B1E28' : '#FFFFFF',
    softBlock: isDark ? '#242735' : '#F2F3F8',
    sectionBg: isDark ? '#161924' : '#F4F6FC',
    mutedText: isDark ? '#A8AEC7' : '#8B90A5',
    borderColor: isDark ? '#2F3547' : '#E4E9F5',
    inputBg: isDark ? '#1E2230' : '#F9FAFD',
    textColor: isDark ? '#FFFFFF' : '#2D3142',
    primaryColor: '#1F8B82',
    successColor: '#16A34A',
    warningColor: '#E8872A',
    dangerColor: '#E05252',
    infoColor: '#2D6ACF',
    onPrimary: '#FFFFFF',
  };
}

export type AppTheme = {
  backgroundColor: string;
  textColor: string;
  tintColor: string;
  cardColor: string;
  mutedColor: string;
  borderColor: string;
};

export function useAppTheme(): AppTheme {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const cardColor = useThemeColor({ light: '#ffffff', dark: '#1f2937' }, 'background');
  const mutedColor = useThemeColor({ light: '#6b7280', dark: '#9ca3af' }, 'text');
  const borderColor = useThemeColor({ light: '#e5e7eb', dark: '#374151' }, 'text');

  return { backgroundColor, textColor, tintColor, cardColor, mutedColor, borderColor };
}
