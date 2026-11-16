import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MobileApp() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>CineVerse 3D Mobile</Text>
      <Text style={styles.subtitle}>React Native / Expo Shell Baseline</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0d14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#f59e0b',
    fontSize: 22,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 8,
  },
});
