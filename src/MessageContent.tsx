import React, { useContext } from 'react';
import { Text } from 'react-native';
import { PropsContext } from './Chatty';
import { IChatBubble } from './types/Chatty.types';
import { ParsedText } from './parsers/ParsedText';

function _MessageContent(props: IChatBubble) {
  const { message } = props;
  const propsContext = useContext(PropsContext);

  return (
    <>
      {propsContext?.enablePatterns ? (
        <ParsedText message={message} />
      ) : (
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
