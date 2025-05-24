import React, { useContext, useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  SafeAreaView,
  Alert,
  Dimensions,
  Animated 
} from 'react-native';
import { Feather, AntDesign } from '@expo/vector-icons';
import { useCardTable } from '../../hooks/useCardTable';
import { useCategoryTable } from '../../hooks/useCategoryTable';
import { useTopicTable } from '../../hooks/useTopicTable';
import { AuthContext } from '../../App';

const { width } = Dimensions.get('window');

const CardFlow = ({ route, navigation }) => {
  const { topicId, topicTitle, categoryId } = route.params;
  const { userId } = useContext(AuthContext);
  const { cards, loading, fetchCardsByTopic } = useCardTable(userId);
  const { getSpecificCategory } = useCategoryTable(userId);
  const { getSpecificTopic } = useTopicTable(userId);
  
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [startTime] = useState(new Date());
  const [completedCards, setCompletedCards] = useState(new Set());
  const [category, setCategory] = useState(null);
  const [topic, setTopic] = useState(null);
  
  // Animation values
  const [flipAnimation] = useState(new Animated.Value(0));
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      await fetchCardsByTopic(parseInt(topicId));
      
      // Get topic data to find category
      const topicData = await getSpecificTopic(parseInt(topicId));
      setTopic(topicData);
      
      if (topicData) {
        // Get category data for color
        const categoryData = await getSpecificCategory(topicData.category_id);
        setCategory(categoryData);
      }
    };

    loadData();
  }, [topicId]);

  const currentCard = cards[currentCardIndex];
  const totalCards = cards.length;
  const progressPercentage = totalCards > 0 ? ((currentCardIndex + 1) / totalCards) * 100 : 0;

  // Calculate estimated time like CategoryContent
  const getEstimatedTime = () => {
    if (!totalCards) return '0min';
    return `${Math.ceil(totalCards * 0.5)}min`;
  };

  const flipCard = () => {
    if (isFlipping) return;
    
    setIsFlipping(true);
    
    Animated.timing(flipAnimation, {
      toValue: showAnswer ? 0 : 1,
      duration: 600,
      useNativeDriver: true,
    }).start(() => {
      setShowAnswer(!showAnswer);
      setIsFlipping(false);
      
      if (!showAnswer) {
        setCompletedCards(prev => new Set([...prev, currentCardIndex]));
      }
    });
  };

  const handleNext = () => {
    if (currentCardIndex < totalCards - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setUserAnswer('');
      setShowAnswer(false);
      flipAnimation.setValue(0);
    } else {
      // Study session completed
      Alert.alert(
        'Congratulations!',
        'You have completed all flashcards in this topic!',
        [
          {
            text: 'Study Again',
            onPress: () => {
              setCurrentCardIndex(0);
              setUserAnswer('');
              setShowAnswer(false);
              setCompletedCards(new Set());
              flipAnimation.setValue(0);
            }
          },
          {
            text: 'Finish',
            onPress: () => navigation.goBack()
          }
        ]
      );
    }
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
      setUserAnswer('');
      setShowAnswer(false);
      flipAnimation.setValue(0);
    }
  };

  const renderProgressBar = () => {
    const categoryColor = category?.color || '#F09E54';
    
    return (
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <View 
            style={[
              styles.progressBarFill, 
              { 
                width: `${progressPercentage}%`,
                backgroundColor: categoryColor 
              }
            ]} 
          />
        </View>
      </View>
    );
  };

  // Front side of the card (question)
  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  // Back side of the card (answer)
  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  if (loading || !currentCard) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading flashcards...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const categoryColor = category?.color || '#F09E54';

  // Dynamic styles for flashcard with conditional shadow
  const flashcardBase = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 20,
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backfaceVisibility: 'hidden',
    ...(!isFlipping && {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    })
  };

  const cardFrontStyles = {
    ...flashcardBase,
    backgroundColor: '#fff',
  };

  const cardBackStyles = {
    ...flashcardBase,
    backgroundColor: categoryColor,
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <Text style={styles.title}>{topicTitle}</Text>

      {/* Progress Section */}
      <View style={styles.progressSection}>
        <Text style={styles.progressLabel}>Your Progress</Text>
        <View style={styles.progressInfo}>
          <Text style={[styles.progressText, { color: categoryColor }]}>
            {currentCardIndex + 1} out of {totalCards} Cards
          </Text>
          <Text style={styles.timeText}>{getEstimatedTime()}</Text>
        </View>
        {renderProgressBar()}
      </View>

      {/* Flashcard with flip animation */}
      <View style={styles.cardContainer}>
        <TouchableOpacity 
          style={styles.cardTouchable}
          onPress={flipCard}
          disabled={isFlipping}
        >
          {/* Front side (Question) */}
          <Animated.View 
            style={[
              cardFrontStyles,
              { transform: [{ rotateY: frontInterpolate }] }
            ]}
          >
            <Text style={styles.questionText}>
              {currentCard.question}
            </Text>
            <Text style={styles.tapHint}>Tap to reveal answer</Text>
          </Animated.View>

          {/* Back side (Answer) */}
          <Animated.View 
            style={[
              cardBackStyles,
              { 
                transform: [{ rotateY: backInterpolate }],
              }
            ]}
          >
            <Text style={styles.answerText}>
              {currentCard.answer}
            </Text>
            <Text style={styles.tapHint}>Tap to show question</Text>
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Input Section */}
      <View style={styles.inputSection}>
        <TextInput
          style={styles.answerInput}
          placeholder="Type your answer..."
          placeholderTextColor="#999"
          value={userAnswer}
          onChangeText={setUserAnswer}
        />
        
        <TouchableOpacity 
          style={styles.revealButton}
          onPress={flipCard}
        >
          <AntDesign 
            name="heart" 
            size={20} 
            color={showAnswer ? categoryColor : '#999'} 
          />
          <Text style={[
            styles.revealText, 
            { color: showAnswer ? categoryColor : '#999' }
          ]}>
            {showAnswer ? 'Show Question' : 'Reveal'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Navigation Buttons */}
      <View style={styles.navigationButtons}>
        <TouchableOpacity 
          style={[
            styles.navButton, 
            styles.prevButton,
            { opacity: currentCardIndex === 0 ? 0.5 : 1 }
          ]}
          onPress={handlePrevious}
          disabled={currentCardIndex === 0}
        >
          <Feather name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.navButton, styles.nextButton]}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {currentCardIndex === totalCards - 1 ? 'Finish' : 'Next'}
          </Text>
          {currentCardIndex < totalCards - 1 && (
            <Feather name="arrow-right" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
  },
  progressSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  progressLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressText: {
    fontSize: 18,
    fontWeight: '600',
  },
  timeText: {
    fontSize: 14,
    color: '#999',
  },
  progressBarContainer: {
    marginBottom: 16,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  cardContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  cardTouchable: {
    height: 250,
  },
  questionText: {
    fontSize: 24,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 20,
  },
  answerText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 20,
  },
  tapHint: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  inputSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  answerInput: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  revealButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  revealText: {
    fontSize: 16,
    fontWeight: '500',
  },
  navigationButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 12,
  },
  navButton: {
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 56,
  },
  prevButton: {
    backgroundColor: '#E57373',
    width: 80,
  },
  nextButton: {
    backgroundColor: '#5B9BD5',
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
});

export default CardFlow;