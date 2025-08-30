import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

const ONBOARDING_KEY = 'hasCompletedOnboarding';

export function useFirstTime() {
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const hasCompleted = await AsyncStorage.getItem(ONBOARDING_KEY);
        setIsFirstTime(hasCompleted === null);
      } catch (error) {
        // Handle error
        setIsFirstTime(true); // Assume it's the first time if storage fails
      }
    };

    checkOnboardingStatus();
  }, []);

  const setOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      setIsFirstTime(false);
    } catch (error) {
      // Handle error
    }
  };

  return { isFirstTime, setOnboardingComplete };
}
