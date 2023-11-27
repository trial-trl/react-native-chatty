import React, { useCallback, useContext, useMemo } from 'react';
import { PropsContext } from '../Chatty';
import { IChatBubble } from '../types/Chatty.types';
import { ChatEmitter } from '../utils/eventEmitter';
import {
  LoadAllPatternShapes,
  loadParsedText,
  SUPPORTED_PATTERNS_SHAPES,
} from '../utils/patterns';

const RNParsedText = loadParsedText();

function _ParsedText({ message }: Pick<IChatBubble, 'message'>) {
  const propsContext = useContext(PropsContext);

  const onPressPattern = useCallback(
    (pattern: string, index: number) => {
      if (!message) return;
      ChatEmitter?.emit('patternPressed', pattern, index, message);
    },
    [message]
  );

  const messagePatterns = useMemo(() => {
    const patterns: any[] = [];

    if (!propsContext?.enablePatterns) return;
    if (!RNParsedText) return;

    LoadAllPatternShapes(onPressPattern);

    if (propsContext.patternProps?.customPatterns) {
      patterns.push(...Object.values(propsContext.patternProps.customPatterns));
    }

    if (propsContext?.patternProps?.allowPatterns) {
      propsContext.patternProps.allowPatterns.forEach((pattern) =>
        patterns.push(SUPPORTED_PATTERNS_SHAPES[pattern])
      );
    } else {
      (
        Object.keys(
          SUPPORTED_PATTERNS_SHAPES
        ) as (keyof typeof SUPPORTED_PATTERNS_SHAPES)[]
      ).forEach((pattern) => patterns.push(SUPPORTED_PATTERNS_SHAPES[pattern]));
    }

    return patterns;
  }, [
    onPressPattern,
    propsContext?.enablePatterns,
    propsContext?.patternProps?.allowPatterns,
    propsContext?.patternProps?.customPatterns,
  ]);

  return (
    <>
      {propsContext?.enablePatterns && RNParsedText && (
        <RNParsedText
          parse={messagePatterns}
          style={
            propsContext?.bubbleProps?.labelStyle &&
            propsContext.bubbleProps?.labelStyle(message?.me ?? false)
          }
        >
          {message?.text}
        </RNParsedText>
      )}
    </>
  );
}

export const ParsedText = React.memo(_ParsedText);
