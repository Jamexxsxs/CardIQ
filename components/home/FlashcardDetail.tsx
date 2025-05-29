import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTopicTable } from '../../hooks/useTopicTable';
import { useCategoryTable } from '../../hooks/useCategoryTable';
import { AuthContext } from '../../App';

const FlashcardDetail = ({ route, navigation }) => {
  const { id } = route.params;
  const { userId } = useContext(AuthContext);
  const { getSpecificTopic, fetchTopicsByCategory, topics, touchTopic, deleteTopic } = useTopicTable(userId);
  const { getSpecificCategory } = useCategoryTable(userId);
  
  const [topic, setTopic] = useState(null);
  const [category, setCategory] = useState(null);
  const [relatedTopics, setRelatedTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null)

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

  
  const handleDeleteTopic = (topicId, topicTitle) => {
    Alert.alert("Delete Flashcard", `Are you sure you want to delete "${topicTitle}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteTopic(topicId)
            setOpenMenuId(null)
            if (topicId === topic.id) {
              navigation.goBack()
            } else {
              await fetchTopicsByCategory(topic.category_id)
            }
          } catch (error) {
            console.error("Error deleting topic:", error)
          }
        },
      },
    ])
  }


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
        <View style={[styles.headerSection, { backgroundColor: category?.color || '#F09E54' }]}>
          <View style={styles.decorativeCircle} />
            <View style={styles.headerControls}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              style={styles.backButtonCircle}
            >
                <Feather name="arrow-left" size={20} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuButton} onPress={() => setOpenMenuId(topic.id)}>
                <Feather name="more-vertical" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{topic.title}</Text>
            </View>
            {openMenuId === topic.id && (
              <View style={styles.menuContainer}>
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteTopic(topic.id, topic.title)}>
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}   
          </View>
            <View style={styles.contentSection}>
          <Text style={styles.subtitle}>
            {topic.card_count} Cards • {category?.name?.toUpperCase() || "CATEGORY"}
          </Text>

          <Text style={styles.description}>{topic.description || "No description available for this topic."}</Text>

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
                    <View style={styles.relatedCardCircle} />

                    <TouchableOpacity style={styles.relatedCardMenu} onPress={() => setOpenMenuId(relatedTopic.id)}>
                      <Feather name="more-vertical" size={16} color="#fff" />
                    </TouchableOpacity>

                    {openMenuId === relatedTopic.id && (
                      <View style={styles.menuContainer}>
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => handleDeleteTopic(relatedTopic.id, relatedTopic.title)}
                        >
                          <Text style={styles.deleteButtonText}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    <Text style={styles.relatedCardTitle}>{relatedTopic.title}</Text>
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
  relatedSection: {
    marginTop: 20,
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
    height: 140,
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
    width: 60,
    height: 60,
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
   menuContainer: {
    position: "absolute",
    top: 30,
    right: 10,
    backgroundColor: "transparent",
    padding: 8,
    borderRadius: 8,
    zIndex: 10,
  },
  relatedMenuContainer: {
    position: "absolute",
    top: 30,
    right: 5,
    backgroundColor: "transparent",
    padding: 4,
    borderRadius: 8,
    zIndex: 10,
  },
  deleteButton: {
    backgroundColor: "#E53935",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default FlashcardDetail;