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

export const SUPPORTED_PATTERNS_SHAPES = {
  hashtag: {
    pattern: /#(\w+)/,
    style: {
      color: 'cyan',
    },
  } as IPatternShape,
  mention: {
    pattern: /\B@\w+/gm,
    style: {
      color: 'orange',
    },
  } as IPatternShape,
  url: {
    type: 'url',
    style: {
      color: 'blue',
    },
  } as IPatternShape,
  bold: {
    pattern: /\*\*(.+?)\*\*(?!\*)/gm,
    style: {
      fontWeight: 'bold',
    },
    renderText: (matchingString) =>
      matchingString.substring(2, matchingString.length - 2),
  } as IPatternShape,
  italic: {
    pattern: /\*([^*><]+)\*/gm,
    style: {
      fontStyle: 'italic',
    },
    renderText: (matchingString) =>
      matchingString.substring(1, matchingString.length - 1),
  } as IPatternShape,
  underline: {
    pattern: /\b_(?![_])(.*?[^_])_(?!\S)/gm,
    style: {
      textDecorationLine: 'underline',
    },
    renderText: (matchingString) =>
      matchingString.substring(1, matchingString.length - 1),
  } as IPatternShape,
  strikethrough: {
    pattern: /(?:)~(?![~])(.*?[^~])~(?!\b)/gm,
    style: {
      textDecorationLine: 'line-through',
    },
    renderText: (matchingString) =>
      matchingString.substring(1, matchingString.length - 1),
  } as IPatternShape,
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
