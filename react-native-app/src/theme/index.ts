import {MD3LightTheme as DefaultTheme} from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#2196F3',
    secondary: '#4CAF50',
    error: '#F44336',
    background: '#F5F5F5',
    surface: '#FFFFFF',
    text: '#212121',
    onSurface: '#000000',
    disabled: '#9E9E9E',
    placeholder: '#757575',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    notification: '#FF5722',
    // Custom colors
    success: '#4CAF50',
    warning: '#FF9800',
    info: '#2196F3',
    mapMarker: '#E91E63',
    truckActive: '#4CAF50',
    truckInactive: '#9E9E9E',
    routeActive: '#2196F3',
    routeInactive: '#BDBDBD',
  },
  roundness: 8,
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  fontSize: {
    small: 12,
    regular: 14,
    medium: 16,
    large: 18,
    xlarge: 24,
  },
};

export type AppTheme = typeof theme;
