import React, { useState, useMemo } from 'react';
import { Text, StyleSheet, View, TouchableOpacity } from 'react-native';
import { useCallbackOne } from 'use-memo-one';
import Color from '../constants/Color';
import { IQuickRepliesProps, IQuickReplyOption } from '../types/Chatty.types';

const sameReply =
  (currentReply: IQuickReplyOption) => (reply: IQuickReplyOption) =>
    currentReply.value === reply.value;

const diffReply =
  (currentReply: IQuickReplyOption) => (reply: IQuickReplyOption) =>
    currentReply.value !== reply.value;

export const QuickReplies: React.FC<IQuickRepliesProps> = ({
  currentMessage,
  nextMessage,
  color = Color.peterRiver,
  quickReplyStyle,
  quickReplyTextStyle,
  onQuickReply,
  sendText = 'Send',
  renderQuickReplySend,
}) => {
  const { type } = currentMessage!.quickReplies!;
  const [replies, setReplies] = useState<IQuickReplyOption[]>([]);

  const shouldComponentDisplay = useMemo(() => {
    const hasReplies = !!currentMessage && !!currentMessage!.quickReplies;
    const hasNext = !!nextMessage && !!nextMessage!.id;
    const keepIt = currentMessage!.quickReplies!.keepIt;

    if (hasReplies && !hasNext) {
      return true;
    }

    if (hasReplies && hasNext && keepIt) {
      return true;
    }

    return false;
  }, [currentMessage, nextMessage]);

  const handlePress = useCallbackOne(
    (reply: IQuickReplyOption) => () => {
      if (currentMessage) {
        const { type } = currentMessage.quickReplies!;
        switch (type) {
          case 'radio': {
            handleSend([reply])();
            return;
          }
          case 'checkbox': {
            if (replies.find(sameReply(reply))) {
              setReplies(replies.filter(diffReply(reply)));
            } else {
              setReplies([...replies, reply]);
            }
            return;
          }
          default: {
            console.warn(`onQuickReply unknown type: ${type}`);
            return;
          }
        }
      }
    },
    [replies, currentMessage]
  );

  const handleSend = (repliesData: IQuickReplyOption[]) => () => {
    onQuickReply?.(
      repliesData.map((reply: IQuickReplyOption) => ({
        ...reply,
        message: currentMessage!,
      }))
    );
  };

  if (!shouldComponentDisplay) {
    return null;
  }

  return (
    <View style={styles.container}>
      {currentMessage!.quickReplies!.values.map(
        (reply: IQuickReplyOption, index: number) => {
          const selected =
            type === 'checkbox' && replies.find(sameReply(reply));

          return (
            <TouchableOpacity
              onPress={handlePress(reply)}
              style={[
                styles.quickReply,
                quickReplyStyle,
                { borderColor: color },
                selected && { backgroundColor: color },
              ]}
              key={`${reply.value}-${index}`}
            >
              <Text
                numberOfLines={10}
                ellipsizeMode={'tail'}
                style={[
                  styles.quickReplyText,
                  { color: selected ? Color.white : color },
                  quickReplyTextStyle,
                ]}
              >
                {reply.title}
              </Text>
            </TouchableOpacity>
          );
        }
      )}
      {replies.length > 0 && (
        <TouchableOpacity
          style={[styles.quickReply, styles.sendLink]}
          onPress={handleSend(replies)}
        >
          {renderQuickReplySend?.() || (
            <Text style={styles.sendLinkText}>{sendText}</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    maxWidth: 300,
  },
  quickReply: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    maxWidth: 200,
    paddingVertical: 7,
    paddingHorizontal: 12,
    minHeight: 50,
    borderRadius: 13,
    margin: 3,
  },
  quickReplyText: {
    overflow: 'visible',
  },
  sendLink: {
    borderWidth: 0,
  },
  sendLinkText: {
    color: Color.defaultBlue,
    fontWeight: '600',
    fontSize: 17,
  },
});
