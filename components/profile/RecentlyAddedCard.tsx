import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
// import { MoveVertical as MoreVertical } from 'lucide-react-native';
import { Feather } from '@expo/vector-icons';


interface Activity {
  id: string;
  subject: string;
  chapter: string;
  cardCount: number;
  date: string;
  color: string;
}

interface RecentlyAddedCardProps {
  activity: Activity;
}

const RecentlyAddedCard: React.FC<RecentlyAddedCardProps> = ({ activity }) => {
  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: activity.color }]}
      activeOpacity={0.9}
    >
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.subject}>{activity.subject}</Text>
          <TouchableOpacity style={styles.menuButton}>
            <Feather name="more-vertical" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.chapter}>{activity.chapter}</Text>
        <View style={styles.footer}>
          <Text style={styles.cardCount}>{activity.cardCount} Cards</Text>
          <Text style={styles.separator}>|</Text>
          <Text style={styles.date}>{activity.date}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  content: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  subject: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  menuButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chapter: {
    fontSize: 16,
    color: 'white',
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardCount: {
    fontSize: 14,
    color: 'white',
  },
  separator: {
    color: 'white',
    marginHorizontal: 8,
  },
  date: {
    fontSize: 14,
    color: 'white',
  },
});

export default RecentlyAddedCard;