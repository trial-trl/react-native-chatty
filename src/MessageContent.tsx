import React, { useContext } from 'react';
import { Text } from 'react-native';
import { PropsContext } from './Chatty';
import { IChatBubble } from './types/Chatty.types';
import { ParsedText } from './parsers/ParsedText';
import { MarkdownText } from './parsers/MarkdownText';

function _MessageContent({ message }: Pick<IChatBubble, 'message'>) {
  const propsContext = useContext(PropsContext);

  return (
    <>
      {propsContext?.enablePatterns && <ParsedText message={message} />}
      {propsContext?.enableMarkdown && <MarkdownText message={message} />}
      {!propsContext?.enablePatterns && !propsContext?.enableMarkdown && (
        <Text
          style={
            propsContext?.bubbleProps?.labelStyle &&
            propsContext.bubbleProps?.labelStyle(message?.me ?? false)
          }
        >
          {message?.text}
        </Text>
      )}
    </>
  );
}

export const MessageContent = React.memo(_MessageContent);
