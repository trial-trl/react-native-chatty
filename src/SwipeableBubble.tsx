import React, { useCallback, useContext, useEffect, useRef } from 'react';
import { Text } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { ChatBubble } from './ChatBubble';
import { PropsContext } from './Chatty';
import type { ISwipeableBubble } from './types/Chatty.types';

function _SwipeableBubble(props: ISwipeableBubble) {
  const { onReply, onCancelReply, message, children } = props;
  const propsContext = useContext(PropsContext);
  const swipeableRef = useRef<Swipeable>(null);

  const _onReply = useCallback(() => {
    if (!message) return;

    onReply!(message);
  }, [message, onReply]);

  const _onCancelReply = useCallback(() => {
    if (!message || !propsContext.replyingTo) return;

    if (propsContext.replyingTo.id === message.id) {
      onCancelReply!();
    }
  }, [message, onCancelReply, propsContext.replyingTo]);

  const renderLeftActions = useCallback(() => {
    return propsContext.bubbleProps?.replyDragElement ?? <Text> </Text>;
  }, [propsContext.bubbleProps?.replyDragElement]);

  useEffect(() => {
    if (
      !propsContext.replyingTo ||
      propsContext.replyingTo?.id !== message?.id
    ) {
      swipeableRef.current?.close();
    }
  }, [message, propsContext.replyingTo]);

  if (!onReply) return children ?? <ChatBubble {...props} />;

  return (
    <Swipeable
      renderLeftActions={renderLeftActions}
      friction={1}
      overshootFriction={2}
      onSwipeableOpen={() => _onReply()}
      onSwipeableClose={() => _onCancelReply()}
      enableTrackpadTwoFingerGesture
      ref={swipeableRef}
    >
      {children ?? <ChatBubble {...props} />}
    </Swipeable>
  );
}

export const SwipeableBubble = React.memo(_SwipeableBubble);
