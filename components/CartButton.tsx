
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, commonStyles } from '../styles/commonStyles';
import Icon from './Icon';

interface CartButtonProps {
  itemCount: number;
  onPress: () => void;
}

export default function CartButton({ itemCount, onPress }: CartButtonProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Icon name="bag" size={24} color={colors.text} />
      {itemCount > 0 && (
        <Text style={styles.badge}>{itemCount}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.error,
    color: colors.backgroundAlt,
    fontSize: 12,
    fontWeight: '600',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
});
