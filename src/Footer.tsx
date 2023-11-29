import React, { useCallback, useContext, useMemo, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { PropsContext } from './Chatty';
import { IFooterProps, IMedia, IMessage } from './types/Chatty.types';
import { useMentions } from './useMentions';
import { InputToolbar } from './InputToolbar';
import { Composer } from './Composer';
import { Send } from './Send';

function _Footer(props: IFooterProps) {
  const propsContext = useContext(PropsContext);

  const [message, setMessage] = useState<string>('');
  const [image, setImage] = useState<IMedia[] | undefined>();

  const mentions = useMentions(
    propsContext.mentionsProps
      ? {
          loadMentions: propsContext.mentionsProps!.loadMentions!,
          setMessage,
          styles: props.mentionStyles,
        }
      : undefined
  );

  const cuttedText = useMemo(() => {
    if (props.replyingTo) {
      return props.replyingTo.text.slice(0, 100) + '...';
    }

    return null;
  }, [props?.replyingTo]);

  const onChangeText = useCallback(
    (text: string) => {
      mentions.onChangeText(text);
      props.onChangeText(text);
      setMessage(text);
    },
    [props, mentions]
  );

  const onPressSend = useCallback(
    (_: Partial<IMessage>, shouldResetInputToolbar: boolean) => {
      props.onPressSend({
        text: message,
        repliedTo: props.replyingTo,
        media: image,
      });
      if (shouldResetInputToolbar) {
        setMessage('');
        setImage([]);
      }
    },
    [message, props, image]
  );

  const onKeyPress = useCallback(
    (key: string) => {
      mentions.onKeyPress(key);
    },
    [mentions]
  );

  return (
    <View
      style={
        image &&
        image.length > 0 && {
          position: 'absolute',
          bottom: -70,
          backgroundColor: '#fff',
        }
      }
    >
      {props.replyingTo && (
        <Animated.View
          entering={FadeInDown}
          exiting={FadeOutDown}
          style={[styles.reply, props.replyStyles?.containerStyle]}
        >
          <View style={styles.replyBody}>
            <Text
              style={[styles.replyUsername, props.replyStyles?.usernameStyle]}
            >
              {props.replyingTo.user.username}
            </Text>
            <Text style={props.replyStyles?.labelStyle}>{cuttedText}</Text>
          </View>
          {propsContext.footerProps.closeReplyButton ? (
            propsContext.footerProps.closeReplyButton(props)
          ) : (
            <Button title="cancel" onPress={props.onPressCancelReply} />
          )}
        </Animated.View>
      )}

      {mentions.renderMentionsBox(message)}

      <InputToolbar
        renderComposer={() => (
          <Composer
            text={message}
            onTextChanged={onChangeText}
            onKeyPress={onKeyPress}
          />
        )}
        renderSend={() =>
          props?.sendButton ? (
            props.sendButton!({
              onPressSend,
            })
          ) : (
            <Send text={message} onSend={onPressSend} />
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  textInput: {
    padding: 10,
    width: '80%',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  shortedTextInput: {
    padding: 10,
    width: '70%',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  button: {
    width: '20%',
    backgroundColor: '#fcba03',
  },
  reply: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderLeftColor: '#c8faaf',
    borderLeftWidth: 6,
  },
  replyBody: {
    flex: 1,
  },
  replyUsername: {
    fontWeight: 'bold',
  },

  addMore: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#ccc',
  },
  imageClearButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 18,
    height: 18,
    marginLeft: 10,
    marginTop: 5,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
  media: {
    width: 110,
    height: 100,
    borderRadius: 15,
    marginRight: 10,
    marginBottom: 10,
  },
  mediaOverlay: {
    width: 100,
    height: 100,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 15,
  },
});

export const Footer = React.memo(_Footer);
