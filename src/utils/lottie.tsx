import type LottieViewType from 'lottie-react-native';

export const loadLottie: () => typeof LottieViewType = () => {
  try {
    const LottieView = require('lottie-react-native');

    return LottieView;
  } catch (error) {
    console.warn(
      'Lottie is not installed, falling back to text-based typing effect.'
    );
  }
  return null;
};
