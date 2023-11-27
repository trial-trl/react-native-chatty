import type ReactNativeParsedText from 'react-native-parsed-text';
import type { IPatternShape } from '../types/Chatty.types';

export function loadParsedText(): typeof ReactNativeParsedText | undefined {
  try {
    const ReactNativeParsedText = require('react-native-parsed-text').default;

    return ReactNativeParsedText;
  } catch (err) {
    console.warn(
      "Couldn't load react-native-parsed-text, please install it if you want to use the pattern feature"
    );
  }
  return undefined;
}

export const SUPPORTED_PATTERNS_SHAPES: { [key: string]: IPatternShape } = {
  hashtag: {
    pattern: /#(\w+)/,
    style: {
      color: 'cyan',
    },
  },
  mention: {
    pattern: /\B@\w+/g,
    style: {
      color: 'orange',
    },
  },
  url: {
    type: 'url',
    style: {
      color: 'blue',
    },
  },
};

/**
 * Load all the patterns and set the onPress function
 * @param onPress - (pattern: string, index: number) => void
 */
export function LoadAllPatternShapes(
  onPress: (pattern: string, index: number) => void
) {
  Object.values(SUPPORTED_PATTERNS_SHAPES).map((pattern) => {
    if (pattern?.onPress) return;

    pattern.onPress = onPress;
    Object.freeze(pattern);
  });
}
