import React, { useCallback, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { IMentionsProps } from './types/Chatty.types';

export function useMentions(props?: IMentionsProps) {
  const enabled = props !== undefined;

  const { loadMentions, setMessage, styles: mentionStyles } = props || {};

  const [foundedMentions, setFoundedMentions] = useState<string[]>([]);

  const onChangeText = useCallback(
    async (text: string) => {
      if (!enabled) return;

      const mentions = await loadMentions!(text);

      const _foundedMentions: string[] = [];

      // Iterate over all text
      text.split(' ').forEach((word) => {
        _foundedMentions.push(
          // Check and push if word exists in mentions
          ...mentions.filter((mention) => {
            console.log(text, mention.indexOf(word));
            return (
              mention
                .toLowerCase()
                .indexOf(word.toLowerCase().replace('@', '')) !== -1
            );
          })
        );
      });

      setFoundedMentions(_foundedMentions);
    },
    [enabled, loadMentions]
  );

  const onPressMention = useCallback(
    (target: string) => {
      if (!enabled) return;

      setMessage!((prev: string) =>
        prev.replace(getLastMessageSection(prev), '@' + target)
      );

      setFoundedMentions([]);
    },
    [enabled, setMessage]
  );

  const getLastMessageSection = (message: string) => {
    const splittedWords = message.split(' ');
    const lastMessage = splittedWords[splittedWords.length - 1];
    return lastMessage;
  };

  const renderMentionsBox = useCallback(
    (message: string) => {
      if (!enabled) return null;

      if (message && foundedMentions.length > 0) {
        if (getLastMessageSection(message).startsWith('@')) {
          return (
            <Animated.View
              entering={FadeInDown}
              exiting={FadeOutDown}
              style={mentionStyles?.containerStyle ?? styles.mentionContainer}
            >
              {foundedMentions.map((mention) => (
                <TouchableOpacity onPress={() => onPressMention(mention)}>
                  <Text
                    style={mentionStyles?.labelStyle ?? styles.mentionLabel}
                  >
                    @{mention}
                  </Text>
                </TouchableOpacity>
              ))}
            </Animated.View>
          );
        }
      }

      return null;
    },
    [
      enabled,
      foundedMentions,
      mentionStyles?.containerStyle,
      mentionStyles?.labelStyle,
      onPressMention,
    ]
  );

  const onKeyPress = useCallback((key: string) => {
    if (key === ' ') {
      setFoundedMentions([]);
    }
  }, []);

  return {
    onChangeText,
    onKeyPress,
    renderMentionsBox,
  };
}

const styles = StyleSheet.create({
  mentionContainer: {
    position: 'absolute',
    bottom: 50,
    width: '100%',
    padding: 10,
    backgroundColor: '#E5EEFA',
  },
  mentionLabel: {
    padding: 10,
    color: '#1939B7',
  },
});
