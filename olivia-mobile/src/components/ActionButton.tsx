import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ActionButtonProps {
  onPress: () => void;
  title: string;
  iconName: string;
  color?: string;
}

export default function ActionButton({ 
  onPress, 
  title, 
  iconName, 
  color = '#007AFF' 
}: ActionButtonProps) {
  return (
    <TouchableOpacity style={[styles.button, { borderColor: color }]} onPress={onPress}>
      <Ionicons name={iconName as any} size={20} color={color} />
      <Text style={[styles.text, { color }]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    gap: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});