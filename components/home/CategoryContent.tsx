import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTopicTable } from '../../hooks/useTopicTable';
import { useCategoryTable } from '../../hooks/useCategoryTable';
import { AuthContext } from '../../App';

const CategoryContent = ({ route, navigation }) => {
  const { id, title } = route.params;
  const { userId } = useContext(AuthContext);
  const { topics, loading, fetchTopicsByCategory } = useTopicTable(userId);
  const { getSpecificCategory } = useCategoryTable(userId);
  
  const [categoryData, setCategoryData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTopics, setFilteredTopics] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      // Fetch topics for this category
      await fetchTopicsByCategory(parseInt(id));
      
      // Get category details (including color)
      const category = await getSpecificCategory(parseInt(id));
      setCategoryData(category);
    };

    loadData();
  }, [id]);

  useEffect(() => {
    // Filter topics based on search query
    if (searchQuery.trim() === '') {
      setFilteredTopics(topics);
    } else {
      const filtered = topics.filter(topic =>
        topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTopics(filtered);
    }
  }, [topics, searchQuery]);

  // Helper function to get time-based sections
  const getTopicSections = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    const todayTopics = [];
    const yesterdayTopics = [];
    const olderTopics = [];

    filteredTopics.forEach(topic => {
      const activityDate = topic.activity_datetime ? new Date(topic.activity_datetime) : new Date(topic.added_datetime);
      
      if (activityDate >= today) {
        todayTopics.push(topic);
      } else if (activityDate >= yesterday) {
        yesterdayTopics.push(topic);
      } else {
        olderTopics.push(topic);
      }
    });

    return { todayTopics, yesterdayTopics, olderTopics };
  };

  const { todayTopics, yesterdayTopics, olderTopics } = getTopicSections();

  const renderTopicCard = (topic) => (
    <TouchableOpacity
      key={topic.id}
      style={[
        styles.flashcardCard,
        { backgroundColor: categoryData?.color || '#F09E54' }
      ]}
      onPress={() => navigation.navigate('FlashcardDetail', { id: topic.id })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="book-open-page-variant" size={24} style={styles.cardIcon} color="white" />
        </View>
        <TouchableOpacity>
          <Feather name="more-vertical" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      <Text style={styles.cardTitle}>{topic.title}</Text>
      <Text style={styles.cardSubtitle} numberOfLines={2}>
        {topic.description || 'No description available'}
      </Text>
      <View style={styles.cardFooter}>
        <Text style={styles.cardCount}>{topic.card_count} Cards</Text>
        <Text style={styles.cardDuration}>
          {Math.ceil(topic.card_count * 0.5)}min
        </Text>
      </View>
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: '0%' }]} />
      </View>
    </TouchableOpacity>
  );

  const renderSection = (sectionTitle, sectionTopics) => {
    if (sectionTopics.length === 0) return null;

    return (
      <View style={styles.section} key={sectionTitle}>
        <Text style={styles.sectionTitle}>{sectionTitle}</Text>
        <View style={styles.cardsGrid}>
          {sectionTopics.map(renderTopicCard)}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading topics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#666" />
        </TouchableOpacity>
        <Text style={styles.title}>{title || categoryData?.name || "Category"}</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Feather name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search topics..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.content}>
        {filteredTopics.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery ? 'No topics found matching your search.' : 'No topics in this category yet.'}
            </Text>
            {!searchQuery && (
              <TouchableOpacity 
                style={styles.addTopicButton}
                onPress={() => navigation.navigate('GeneratePrompt')}
              >
                <Text style={styles.addTopicButtonText}>Add Your First Topic</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <>
            {renderSection('Today', todayTopics)}
            {renderSection('Yesterday', yesterdayTopics)}
            {renderSection('Earlier', olderTopics)}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F2F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginBottom: 16,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  flashcardCard: {
    width: '47%',
    borderRadius: 16,
    padding: 16,
    minHeight: 160,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIcon: {
    fontSize: 20,
  },
  cardTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardSubtitle: {
    color: 'white',
    opacity: 0.9,
    marginBottom: 12,
    fontSize: 12,
    lineHeight: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardCount: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  cardDuration: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  progressContainer: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  addTopicButton: {
    backgroundColor: '#4A86E8',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addTopicButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CategoryContent;