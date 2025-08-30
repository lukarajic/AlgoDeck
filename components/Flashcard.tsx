import { ThemedText } from '@/components/ThemedText';
import { useFavorites } from '@/context/FavoritesContext';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import { Animated, Modal, ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import Markdown from 'react-native-markdown-display';

interface FlashcardProps {
  problemId: number;
  title: string;
  description: string;
  solution: string;
  difficulty: string;
}

const Flashcard = ({ problemId, title, description, solution, difficulty }: FlashcardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { colorScheme } = useTheme();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSolutionModalVisible, setIsSolutionModalVisible] = useState(false);
  const flipAnimation = useRef(new Animated.Value(0)).current;

  const handleToggleFavorite = (event: any) => {
    event.stopPropagation(); // Prevent flip from happening
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleFavorite(problemId);
  };

  const getTruncatedText = (description: string) => {
    const paragraphs = description.split('\n\n');
    const text = paragraphs[0];
    if (text.length <= 200) return text;
    const truncated = text.substring(0, 200);
    const lastSpace = truncated.lastIndexOf(' ');
    return lastSpace > 150 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
  };

  const getTruncatedSolution = (text: string) => {
    // Limit to approximately 200 characters or first 3 lines
    if (text.length <= 200) return text;
    const truncated = text.substring(0, 200);
    const lastSpace = truncated.lastIndexOf(' ');
    return lastSpace > 150 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
  };

  const shouldShowReadMore = (text: string) => {
    const paragraphs = text.split('\n\n');
    return paragraphs.length >= 2;
  };

  const shouldShowReadMoreSolution = (text: string) => {
    return text.length > 200;
  };

  const handleToggleExpand = (event: any) => {
    event.stopPropagation(); // Prevent flip from happening
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsModalVisible(false);
  };

  const handleToggleSolutionExpand = (event: any) => {
    event.stopPropagation(); // Prevent flip from happening
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsSolutionModalVisible(true);
  };

  const handleCloseSolutionModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsSolutionModalVisible(false);
  };

  const flipCard = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const toValue = isFlipped ? 0 : 180;
    Animated.timing(flipAnimation, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  const getDifficultyStyle = (level: string) => {
    switch (level) {
      case 'Easy':
        return styles.easyBadge;
      case 'Medium':
        return styles.mediumBadge;
      case 'Hard':
        return styles.hardBadge;
      default:
        return {};
    }
  };

  const cardBackgroundColor: [string, string] = colorScheme === 'light' ? ['#ffffff', '#f0f0f0'] : ['#2c2c2c', '#1a1a1a'];

  const markdownStyles = StyleSheet.create({
    body: {
      fontSize: 18,
      lineHeight: 24,
      color: colorScheme === 'light' ? '#000' : '#fff',
    },
    list_item: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    bullet_list_icon: {
      marginRight: 8,
      fontSize: 16,
      lineHeight: 24,
      color: colorScheme === 'light' ? '#000' : '#fff',
    },
    ordered_list_icon: {
      marginRight: 8,
      fontSize: 16,
      lineHeight: 24,
      color: colorScheme === 'light' ? '#000' : '#fff',
    },
    heading1: {
      color: colorScheme === 'light' ? '#000' : '#fff',
    },
    heading2: {
      color: colorScheme === 'light' ? '#000' : '#fff',
    },
    heading3: {
      color: colorScheme === 'light' ? '#000' : '#fff',
    },
    heading4: {
      color: colorScheme === 'light' ? '#000' : '#fff',
    },
    heading5: {
      color: colorScheme === 'light' ? '#000' : '#fff',
    },
    heading6: {
      color: colorScheme === 'light' ? '#000' : '#fff',
    },
    code_inline: {
      backgroundColor: colorScheme === 'light' ? '#f0f0f0' : '#333',
      color: colorScheme === 'light' ? '#000' : '#fff',
    },
    pre: {
      backgroundColor: colorScheme === 'light' ? '#f0f0f0' : '#333',
      color: colorScheme === 'light' ? '#000' : '#fff',
    },
    // Add more styles for other Markdown elements as needed
  });

  const modalMarkdownStyles = StyleSheet.create({
    body: {
      fontSize: 16,
      lineHeight: 24,
      color: colorScheme === 'light' ? '#000' : '#fff',
    },
    heading1: {
      color: colorScheme === 'light' ? '#000' : '#fff',
    },
    heading2: {
      color: colorScheme === 'light' ? '#000' : '#fff',
    },
    heading3: {
      color: colorScheme === 'light' ? '#000' : '#fff',
    },
    heading4: {
      color: colorScheme === 'light' ? '#000' : '#fff',
    },
    heading5: {
      color: colorScheme === 'light' ? '#000' : '#fff',
    },
    heading6: {
      color: colorScheme === 'light' ? '#000' : '#fff',
    },
    code_inline: {
      backgroundColor: colorScheme === 'light' ? '#f0f0f0' : '#333',
      color: colorScheme === 'light' ? '#000' : '#fff',
    },
    pre: {
      backgroundColor: colorScheme === 'light' ? '#f0f0f0' : '#333',
      color: colorScheme === 'light' ? '#000' : '#fff',
    },
  });

  return (
    <View style={styles.cardContainer}>
      {/* Front Card */}
      <TouchableOpacity activeOpacity={0.95} onPress={flipCard} style={StyleSheet.absoluteFill}>
        <Animated.View style={[styles.card, styles.cardFront, frontAnimatedStyle]}>
          <LinearGradient colors={cardBackgroundColor} style={styles.gradient}>
            <View style={styles.cardContent}>
              <View style={styles.headerContainer}>
                <View style={styles.titleSection}>
                  <ThemedText style={styles.title}>{title}</ThemedText>
                </View>
              </View>
              <View style={styles.contentContainer}>
                <Markdown style={markdownStyles}>
                  {getTruncatedText(description)}
                </Markdown>
              </View>
              
              {/* Bottom section with difficulty badge only */}
              <View style={styles.bottomSection}>
                {/* Empty container to maintain layout structure */}
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>

      {/* Front card difficulty badge - separate positioning */}
      {!isFlipped && (
        <View style={styles.frontDifficultyBadge}>
          <View style={[styles.badge, getDifficultyStyle(difficulty)]}>
            <ThemedText style={styles.badgeText}>{difficulty}</ThemedText>
          </View>
        </View>
      )}

      {/* Back card View Problem button - separate positioning */}
      {isFlipped && (
        <TouchableOpacity 
          onPress={flipCard}
          style={styles.backViewProblemButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}
        >
          <View style={styles.flipButton}>
            <ThemedText style={styles.flipButtonText}>View Problem</ThemedText>
          </View>
        </TouchableOpacity>
      )}

      {/* Back card Read More button - separate positioning */}
      {shouldShowReadMoreSolution(solution) && isFlipped && (
        <TouchableOpacity 
          onPress={handleToggleSolutionExpand}
          style={styles.backReadMoreButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}
        >
          <View style={styles.expandButton}>
            <ThemedText style={styles.expandButtonText}>
              Read More
            </ThemedText>
          </View>
        </TouchableOpacity>
      )}

      {/* Front card Read More button - separate from flip gesture */}
      {shouldShowReadMore(description) && !isFlipped && (
        <TouchableOpacity 
          onPress={handleToggleExpand}
          style={styles.frontReadMoreButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}
        >
          <View style={styles.expandButton}>
            <ThemedText style={styles.expandButtonText}>
              Read More
            </ThemedText>
          </View>
        </TouchableOpacity>
      )}

      {/* Back Card */}
      <TouchableOpacity activeOpacity={0.95} onPress={flipCard} style={StyleSheet.absoluteFill}>
        <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
          <LinearGradient colors={cardBackgroundColor} style={styles.gradient}>
            <View style={styles.cardContent}>
              <View style={styles.contentContainer}>
                <Markdown style={markdownStyles}>{getTruncatedSolution(solution)}</Markdown>
              </View>
              
              {/* Bottom section - empty for absolute positioning */}
              <View style={styles.bottomSection}>
                {/* Empty container to maintain layout structure */}
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>

      {/* Favorite button - completely separate from flip gestures */}
      <TouchableOpacity 
        onPress={handleToggleFavorite}
        style={styles.favoriteButtonOverlay}
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        activeOpacity={0.7}
      >
        <View style={styles.favoriteButtonBackground}>
          <Ionicons
            name={isFavorite(problemId) ? 'star' : 'star-outline'}
            size={28}
            color={isFavorite(problemId) ? '#FFD700' : '#ccc'}
          />
        </View>
      </TouchableOpacity>

      {/* Modal for full description */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContent,
            { backgroundColor: colorScheme === 'light' ? '#ffffff' : '#2c2c2c' }
          ]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>{title}</ThemedText>
              <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
                <Ionicons 
                  name="close" 
                  size={24} 
                  color={colorScheme === 'light' ? '#000' : '#fff'} 
                />
              </TouchableOpacity>
            </View>
            
            {/* Modal Body */}
            <ScrollView 
              style={styles.modalScrollView}
              showsVerticalScrollIndicator={false}
            >
              <Markdown style={modalMarkdownStyles}>
                {description}
              </Markdown>
            </ScrollView>
            
            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                onPress={handleCloseModal} 
                style={[
                  styles.modalCloseButton,
                  { backgroundColor: colorScheme === 'light' ? '#007AFF' : '#0A84FF' }
                ]}
              >
                <ThemedText style={styles.modalCloseButtonText}>Close</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal for full solution */}
      <Modal
        visible={isSolutionModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseSolutionModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContent,
            { backgroundColor: colorScheme === 'light' ? '#ffffff' : '#2c2c2c' }
          ]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Solution</ThemedText>
              <TouchableOpacity onPress={handleCloseSolutionModal} style={styles.closeButton}>
                <Ionicons 
                  name="close" 
                  size={24} 
                  color={colorScheme === 'light' ? '#000' : '#fff'} 
                />
              </TouchableOpacity>
            </View>
            
            {/* Modal Body */}
            <ScrollView 
              style={styles.modalScrollView}
              showsVerticalScrollIndicator={false}
            >
              <Markdown style={modalMarkdownStyles}>
                {solution}
              </Markdown>
            </ScrollView>
            
            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                onPress={handleCloseSolutionModal} 
                style={[
                  styles.modalCloseButton,
                  { backgroundColor: colorScheme === 'light' ? '#007AFF' : '#0A84FF' }
                ]}
              >
                <ThemedText style={styles.modalCloseButtonText}>Close</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: 320,
    height: 420,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  card: {
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
    borderRadius: 20,
    overflow: 'hidden',
  },
  gradient: {
    width: '100%',
    height: '100%',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardFront: {},
  cardBack: {
    position: 'absolute',
    top: 0,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 40, // Leave space for the favorite button
  },
  titleSection: {
    alignItems: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    paddingVertical: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    paddingTop: 30, // Added padding to ensure consistent spacing
    marginVertical: 10,
  },
  bottomSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
    width: '100%',
  },
  expandButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 123, 255, 0.15)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 123, 255, 0.3)',
    minHeight: 36, // Match badge height
    justifyContent: 'center',
  },
  expandButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  description: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 24,
  },
  badge: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    minHeight: 36, // Match expandButton height
    justifyContent: 'center',
  },
  easyBadge: {
    backgroundColor: '#4CAF50', // Green
  },
  mediumBadge: {
    backgroundColor: '#FFC107', // Amber
  },
  hardBadge: {
    backgroundColor: '#F44336', // Red
  },
  badgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  solution: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  flipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#007AFF',
    borderRadius: 20,
    minHeight: 36, // Match expandButton height
    justifyContent: 'center',
  },
  flipButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  favoriteButtonOverlay: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 1000,
  },
  frontDifficultyBadge: {
    position: 'absolute',
    bottom: 25,
    left: 20, // Move further to the left
    zIndex: 1000,
  },
  frontReadMoreButton: {
    position: 'absolute',
    bottom: 25,
    right: 20, // Move further to the right
    zIndex: 1000,
  },
  backViewProblemButton: {
    position: 'absolute',
    bottom: 25,
    left: 20, // Position on the left side like difficulty badge
    zIndex: 1000,
  },
  backReadMoreButton: {
    position: 'absolute',
    bottom: 25,
    right: 20, // Position on the right side like front read more
    zIndex: 1000,
  },
  favoriteButtonBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 25,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginLeft: 34, // Account for close button width
  },
  closeButton: {
    padding: 5,
  },
  modalScrollView: {
    maxHeight: '85%',
  },
  modalFooter: {
    paddingTop: 15,
    alignItems: 'center',
  },
  modalCloseButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    minWidth: 100,
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalSolutionText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'left',
  },
});

export default Flashcard;