import * as React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { useCallbackOne, useMemoOne } from 'use-memo-one';

import Color from './constants/Color';
import { IMessage } from './types/Chatty.types';
import { useContext } from 'react';
import { PropsContext } from './Chatty';

const TEST_ID_SEND_TOUCHABLE = 'GC_SEND_TOUCHABLE';

export interface ISendProps<TMessage extends IMessage> {
  text?: string;
  label?: string;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  children?: React.ReactNode;
  alwaysShowSend?: boolean;
  disabled?: boolean;
  sendButtonProps?: Partial<TouchableOpacityProps>;
  onSend?(message: Partial<TMessage>, shouldResetInputToolbar: boolean): void;
}

export const Send = <TMessage extends IMessage = IMessage>({
  text = '',
  containerStyle,
  children,
  textStyle,
  label = 'Send',
  alwaysShowSend = false,
  disabled = false,
  sendButtonProps,
  onSend = () => {},
}: ISendProps<TMessage>) => {
  const propsContext = useContext(PropsContext);

  const handleOnPress = useCallbackOne(() => {
    if (text && onSend) {
      onSend({ text: text.trim() } as Partial<TMessage>, true);
    }
  }, [text, onSend]);

  const showSend = useMemoOne(
    () => alwaysShowSend || (text && text.trim().length > 0),
    [alwaysShowSend, text]
  );

  if (!showSend) {
    return null;
  }

  if (propsContext?.footerProps.sendButton)
    return propsContext.footerProps.sendButton({
      onPressSend: handleOnPress,
    });

  return (
    <TouchableOpacity
      testID={TEST_ID_SEND_TOUCHABLE}
      accessible
      accessibilityLabel="send"
      style={[styles.container, containerStyle]}
      onPress={handleOnPress}
      accessibilityRole="button"
      disabled={disabled}
      {...sendButtonProps}
    >
      <View>
        {children || <Text style={[styles.text, textStyle]}>{label}</Text>}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 44,
    justifyContent: 'flex-end',
  },
  text: {
    color: Color.defaultBlue,
    fontWeight: '600',
    fontSize: 17,
    backgroundColor: Color.backgroundTransparent,
    marginBottom: 12,
    marginLeft: 10,
    marginRight: 10,
  },
});
