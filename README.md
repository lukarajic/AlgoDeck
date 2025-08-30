<div align="center">
  <img src="assets/images/splash-icon.png" alt="AlgoDeck Splash Icon" width="200"/>
</div>

# AlgoDeck: Leetcode Flashcards for Interview Prep

AlgoDeck is a mobile application designed to help software engineering candidates prepare for technical interviews. It provides a flashcard-based learning experience for practicing Leetcode-style problems, tracking performance, and focusing on areas that need improvement.

## Features

- **Interactive Flashcards:** Swipe through a deck of algorithm and data structure problems. Reveal hints and solutions with a tap.
- **Topic-Based Practice:** Filter problems by topic (e.g., Arrays, Strings, Trees) to focus your study sessions.
- **Difficulty Filtering:** Select problems by difficulty (Easy, Medium, Hard) to match your skill level.
- **Search:** Quickly find specific problems using the search bar.
- **Performance Tracking:** Track your accuracy for each topic and view your progress on a dedicated screen.
- **Spaced Repetition System (SRS):** Problems you struggle with are automatically scheduled for future review.
- **Favorites:** Save problems to a dedicated list for easy access.
- **"Problem of the Day":** A daily problem to keep you engaged.
- **Achievements:** Unlock achievements as you reach milestones.
- **Light/Dark Mode:** Choose your preferred theme for a comfortable viewing experience.
- **Onboarding:** A guided tour for new users to get acquainted with the app's features.

## Tech Stack

- **Framework:** React Native with Expo
- **Language:** TypeScript
- **Navigation:** React Navigation
- **State Management:** React Context
- **UI:** React Native Components, Expo Components
- **Data:** Local JSON files for problem and achievement data
- **Storage:** AsyncStorage for persisting user data

## Getting Started

### Prerequisites

- Node.js
- Expo CLI

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/lukarajic/AlgoDeck.git
   ```
2. Navigate to the project directory:
   ```bash
   cd AlgoDeck
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```

### Running the App

- **Start the development server:**
  ```bash
  npm start
  ```
- **Run on iOS:**
  ```bash
  npm run ios
  ```
- **Run on Android:**
  ```bash
  npm run android
  ```
- **Run on Web:**
  ```bash
  npm run web
  ```

## Project Structure

```
.
├── app/              # App screens and navigation
├── assets/           # Fonts and images
├── components/       # Reusable components
├── constants/        # Color definitions
├── context/          # React Context providers
├── data/             # JSON data for problems and achievements
├── hooks/            # Custom hooks
├── services/         # Service integrations
└── types/            # TypeScript type definitions
```