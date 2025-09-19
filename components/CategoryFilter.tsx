
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Category } from '../types/Product';
import { colors } from '../styles/commonStyles';
import Icon from './Icon';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export default function CategoryFilter({ categories, selectedCategory, onSelectCategory }: CategoryFilterProps) {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <TouchableOpacity
        style={[styles.categoryButton, selectedCategory === null && styles.selectedCategory]}
        onPress={() => onSelectCategory(null)}
      >
        <Icon 
          name="apps" 
          size={20} 
          color={selectedCategory === null ? colors.backgroundAlt : colors.text} 
        />
        <Text style={[styles.categoryText, selectedCategory === null && styles.selectedText]}>
          Tout
        </Text>
      </TouchableOpacity>
      
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[styles.categoryButton, selectedCategory === category.id && styles.selectedCategory]}
          onPress={() => onSelectCategory(category.id)}
        >
          <Icon 
            name={category.icon as any} 
            size={20} 
            color={selectedCategory === category.id ? colors.backgroundAlt : colors.text} 
          />
          <Text style={[styles.categoryText, selectedCategory === category.id && styles.selectedText]}>
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  selectedCategory: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginLeft: 8,
  },
  selectedText: {
    color: colors.backgroundAlt,
  },
});
