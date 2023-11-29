import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Keyboard, StyleProp, ViewStyle } from 'react-native';

import Color from './constants/Color';
import { IMessage } from './types/Chatty.types';
import { Actions, IActionsProps } from './Actions';

export interface InputToolbarProps<TMessage extends IMessage> {
  options?: { [key: string]: any };
  optionTintColor?: string;
  containerStyle?: StyleProp<ViewStyle>;
  primaryStyle?: StyleProp<ViewStyle>;
  accessoryStyle?: StyleProp<ViewStyle>;
  renderAccessory?(props: InputToolbarProps<TMessage>): React.ReactNode;
  renderActions?(props: IActionsProps): React.ReactNode;
  renderSend(): React.ReactNode;
  renderComposer(): React.ReactNode;
  onPressActionButton?(): void;
}

export function InputToolbar<TMessage extends IMessage = IMessage>(
  props: InputToolbarProps<TMessage>
) {
  const [position, setPosition] = useState('absolute');

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      'keyboardWillShow',
      () => setPosition('relative')
    );
    const keyboardWillHideListener = Keyboard.addListener(
      'keyboardWillHide',
      () => setPosition('absolute')
    );
    return () => {
      keyboardWillShowListener?.remove();
      keyboardWillHideListener?.remove();
    };
  }, []);

  const { containerStyle, ...rest } = props;
  const {
    renderActions,
    onPressActionButton,
    renderComposer,
    renderSend,
    renderAccessory,
  } = rest;

  return (
    <View style={[styles.container, { position }, containerStyle] as ViewStyle}>
      <View style={[styles.primary, props.primaryStyle]}>
        {renderActions?.(rest) ||
          (onPressActionButton && <Actions {...rest} />)}
        {renderComposer()}
        {renderSend()}
      </View>
      {renderAccessory && (
        <View style={[styles.accessory, props.accessoryStyle]}>
          {renderAccessory(props)}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Color.defaultColor,
    backgroundColor: Color.white,
    bottom: 0,
    left: 0,
    right: 0,
  },
  primary: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  accessory: {
    height: 44,
  },
});
