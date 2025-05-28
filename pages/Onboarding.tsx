import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

interface OnboardingProps {
  onComplete: () => void;
}

const onboardingData = [
  {
    id: 1,
    title: "Create Flashcards",
    description: "Build your own study materials with\ncustom flashcards",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/First%20login%20screen-4cTSODKjINnVjGpaMGWYZ87ofTiF0I.png"
  },
  {
    id: 2,
    title: "Type It. Flip It. Nail It.",
    description: "Create custom sets, study efficiently,\nand level up your learning.",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/First%20login%20screen%20%281%29-Ty9yH91Yc2sQtNzx7vjfWMcUfAepvE.png"
  },
  {
    id: 3,
    title: "Get Results",
    description: "Track your progress and achievements",
    image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/First%20login%20screen%20%282%29-JI7wfBBeSrv6JjpM3d8nzxRb0V7gmw.png"
  }
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigation = useNavigation();

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const currentItem = onboardingData[currentIndex];
  const isLastSlide = currentIndex === onboardingData.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: currentItem.image }} 
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>{currentItem.title}</Text>
          <Text style={styles.description}>{currentItem.description}</Text>
        </View>

        <View style={styles.pagination}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex ? styles.activeDot : styles.inactiveDot
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {isLastSlide ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  skipText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 50,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  illustration: {
    width: width * 0.8,
    height: width * 0.8,
    maxWidth: 320,
    maxHeight: 320,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#4A86E8',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  pagination: {
    flexDirection: 'row',
    marginBottom: 40,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 6,
  },
  activeDot: {
    backgroundColor: '#4A86E8',
  },
  inactiveDot: {
    backgroundColor: '#E0E0E0',
  },
  nextButton: {
    backgroundColor: '#4A86E8',
    borderRadius: 12,
    height: 50,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Onboarding;