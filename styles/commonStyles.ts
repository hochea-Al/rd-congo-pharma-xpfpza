
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

export const colors = {
  // Primary colors
  primary: '#2E7D32',
  primaryLight: '#E8F5E8',
  primaryDark: '#1B5E20',
  
  // Secondary colors
  secondary: '#FF6B35',
  secondaryLight: '#FFF3F0',
  
  // Status colors
  success: '#4CAF50',
  successLight: '#E8F5E8',
  warning: '#FF9800',
  warningLight: '#FFF8E1',
  error: '#F44336',
  errorLight: '#FFEBEE',
  info: '#2196F3',
  infoLight: '#E3F2FD',
  
  // Neutral colors
  text: '#212121',
  textSecondary: '#757575',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  border: '#E0E0E0',
  
  // Additional colors
  white: '#FFFFFF',
  black: '#000000',
};

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  } as ViewStyle,
  
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  
  spaceBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as ViewStyle,
  
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  
  shadow: {
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  } as ViewStyle,
  
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  } as ViewStyle,
});

export const buttonStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  } as ViewStyle,
  
  primaryText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  } as TextStyle,
  
  secondary: {
    backgroundColor: colors.surface,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
  } as ViewStyle,
  
  secondaryText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  } as TextStyle,
  
  outline: {
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderWidth: 2,
    borderColor: colors.primary,
  } as ViewStyle,
  
  outlineText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  } as TextStyle,
  
  disabled: {
    backgroundColor: colors.border,
    opacity: 0.6,
  } as ViewStyle,
  
  small: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 36,
  } as ViewStyle,
  
  smallText: {
    fontSize: 14,
  } as TextStyle,
});

export const textStyles = StyleSheet.create({
  h1: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 40,
  } as TextStyle,
  
  h2: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 32,
  } as TextStyle,
  
  h3: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 28,
  } as TextStyle,
  
  body: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  } as TextStyle,
  
  bodySecondary: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  } as TextStyle,
  
  caption: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  } as TextStyle,
  
  link: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  } as TextStyle,
});
