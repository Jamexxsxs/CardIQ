import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTopicTable } from '../../hooks/useTopicTable';
import { useCategoryTable } from '../../hooks/useCategoryTable';
import { AuthContext } from '../../App';

const FlashcardDetail = ({ route, navigation }) => {
  const { id } = route.params;
  const { userId } = useContext(AuthContext);
  const { getSpecificTopic, fetchTopicsByCategory, topics, touchTopic } = useTopicTable(userId);
  const { getSpecificCategory } = useCategoryTable(userId);
  
  const [topic, setTopic] = useState(null);
  const [category, setCategory] = useState(null);
  const [relatedTopics, setRelatedTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get the specific topic
        const topicData = await getSpecificTopic(parseInt(id));
        setTopic(topicData);

        if (topicData) {
          // Get category details
          const categoryData = await getSpecificCategory(topicData.category_id);
          setCategory(categoryData);

          // Get related topics from the same category
          await fetchTopicsByCategory(topicData.category_id);
        }
      } catch (error) {
        console.error('Error loading topic data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  useEffect(() => {
    // Filter out the current topic from related topics
    if (topics && topic) {
      const related = topics.filter(t => t.id !== topic.id).slice(0, 2);
      setRelatedTopics(related);
    }
  }, [topics, topic]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!topic) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Topic not found</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Section with colored background */}
        <View style={[styles.headerSection, { backgroundColor: category?.color || '#F09E54' }]}>
          {/* Decorative circle */}
          <View style={styles.decorativeCircle} />
          
          {/* Header controls */}
          <View style={styles.headerControls}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              style={styles.backButtonCircle}
            >
              <Feather name="arrow-left" size={20} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuButton}>
              <Feather name="more-vertical" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{topic.title}</Text>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          <Text style={styles.subtitle}>
            {topic.card_count} Cards • {category?.name?.toUpperCase() || 'CATEGORY'}
          </Text>
          
          <Text style={styles.description}>
            {topic.description || 'No description available for this topic.'}
          </Text>

          <TouchableOpacity 
            style={styles.startButton}
            onPress={async () => {
              try {
                const updatedTopics = await touchTopic(id);
                navigation.navigate('CardFlow', { 
                  topicId: topic.id, 
                  topicTitle: topic.title,
                  categoryId: topic.category_id 
                });
              } catch (error) {
                console.error('Error updating topic:', error);
              }
            }}
          >
            <Text style={styles.startButtonText}>START</Text>
          </TouchableOpacity>

          {/* Related Section */}
          {relatedTopics.length > 0 && (
            <View style={styles.relatedSection}>
              <Text style={styles.relatedTitle}>Related</Text>
              <View style={styles.relatedCards}>
                {relatedTopics.map((relatedTopic) => (
                  <TouchableOpacity 
                    key={relatedTopic.id}
                    style={[
                      styles.relatedCard,
                      { backgroundColor: category?.color || '#F09E54' }
                    ]}
                    onPress={() => navigation.replace('FlashcardDetail', { id: relatedTopic.id.toString() })}
                  >
                    {/* Decorative circle for related cards */}
                    <View style={styles.relatedCardCircle} />
                    
                    {/* Menu button */}
                    <TouchableOpacity style={styles.relatedCardMenu}>
                      <Feather name="more-vertical" size={16} color="#fff" />
                    </TouchableOpacity>
                    
                    <Text style={styles.relatedCardTitle}>
                      {relatedTopic.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  headerSection: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingTop: 16,
    paddingBottom: 40,
    paddingHorizontal: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  decorativeCircle: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  headerControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    lineHeight: 42,
  },
  contentSection: {
    padding: 20,
    flex: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 40,
  },
  startButton: {
    backgroundColor: '#5B9BD5',
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
  relatedSection: {
    marginTop: 20,
  },
  relatedTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#999',
    marginBottom: 16,
  },
  relatedCards: {
    flexDirection: 'row',
    gap: 12,
  },
  relatedCard: {
    width: 140,
    height: 100,
    borderRadius: 16,
    padding: 12,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  relatedCardCircle: {
    position: 'absolute',
    top: -15,
    right: -15,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  relatedCardMenu: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  relatedCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#5B9BD5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FlashcardDetail;