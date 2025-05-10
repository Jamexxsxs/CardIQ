import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  backgroundColor: string;
  textColor: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  backgroundColor, 
  textColor 
}) => {
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.value, { color: textColor }]}>{value}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'center',
  },
  title: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});

export default StatsCard;