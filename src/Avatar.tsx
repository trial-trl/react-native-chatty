import React, { ReactNode, useCallback, useContext, useMemo } from 'react';
import {
  StyleSheet,
  View,
  ImageStyle,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { isSameUser, isSameDay } from './utils/helpers';
import { IMessage, IUser, LeftRightStyle } from './types/Chatty.types';
import { UserAvatar } from './utils/userAvatar';
import { PropsContext } from './Chatty';

export interface AvatarProps<TMessage extends IMessage> {
  currentMessage?: TMessage;
  previousMessage?: TMessage;
  nextMessage?: TMessage;
  position: 'left' | 'right';
  renderAvatarOnTop?: boolean;
  showAvatarForEveryMessage?: boolean;
  imageStyle?: LeftRightStyle<ImageStyle>;
  containerStyle?: LeftRightStyle<ViewStyle>;
  textStyle?: TextStyle;
  renderAvatar?(props: Omit<AvatarProps<TMessage>, 'renderAvatar'>): ReactNode;
  onPressAvatar?(user: IUser): void;
  onLongPressAvatar?(user: IUser): void;
}

export function Avatar<TMessage extends IMessage = IMessage>(
  props: AvatarProps<TMessage>
) {
  const {
    renderAvatarOnTop,
    showAvatarForEveryMessage,
    containerStyle,
    position,
    currentMessage,
    renderAvatar,
    previousMessage,
    nextMessage,
    imageStyle,
  } = props;
  const messageToCompare = renderAvatarOnTop ? previousMessage : nextMessage;
  const computedStyle = renderAvatarOnTop ? 'onTop' : 'onBottom';

  const propsContext = useContext(PropsContext);

  const canShowAvatar = () =>
    !showAvatarForEveryMessage &&
    currentMessage &&
    messageToCompare &&
    isSameUser(currentMessage, messageToCompare) &&
    isSameDay(currentMessage, messageToCompare);

  const avatarSize = useMemo(() => {
    return {
      width: propsContext.bubbleProps?.showAvatars?.width || 40,
      height: propsContext.bubbleProps?.showAvatars?.width || 40,
      borderRadius: propsContext.bubbleProps?.showAvatars?.width || 40,
    };
  }, [propsContext.bubbleProps?.showAvatars?.width]);

  const renderDefaultAvatar = useCallback(
    (show: boolean, self: boolean) => {
      return (
        <>
          {show && (
            <>
              {withTrailingAccessory && (
                <Image
                  source={
                    currentMessage?.user.avatar ??
                    require('./assets/images/noavatar.png')
                  }
                  style={[self ? styles.avatarMe : styles.avatar, avatarSize]}
                />
              )}
              {!withTrailingAccessory && (
                <View
                  style={[self ? styles.avatarMe : styles.avatar, avatarSize]}
                />
              )}
            </>
          )}
        </>
      );
    },
    [
      avatarSize,
      currentMessage?.user.avatar,
      propsContext.bubbleProps?.showAvatars?.visible,
    ]
  );

  const renderAvatarComponent = () => {
    if (props.renderAvatar) {
      const { renderAvatar, ...avatarProps } = props;
      return renderAvatar(avatarProps);
    }

    if (props.currentMessage) {
      if (UserAvatar)
        return (
          <UserAvatar
            avatarStyle={
              [
                styles[props.position].image,
                props.imageStyle && props.imageStyle[props.position],
              ] as ImageStyle
            }
            user={props.currentMessage.user}
            onPress={() => props.onPressAvatar?.(props.currentMessage!.user)}
            onLongPress={() =>
              props.onLongPressAvatar?.(props.currentMessage!.user)
            }
          />
        );

      return renderDefaultAvatar();
    }

    return null;
  };

  if (propsContext.bubbleProps?.showAvatars?.visible === false) return null;

  if (canShowAvatar()) {
    return (
      <View
        style={[
          styles[position].container,
          containerStyle && containerStyle[position],
        ]}
      >
        <UserAvatar
          avatarStyle={
            [
              styles[position].image,
              imageStyle && imageStyle[position],
            ] as ImageStyle
          }
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles[position].container,
        styles[position][computedStyle],
        containerStyle && containerStyle[position],
      ]}
    >
      {renderAvatarComponent()}
    </View>
  );
}

const styles = {
  left: StyleSheet.create({
    container: {
      marginRight: 8,
    },
    onTop: {
      alignSelf: 'flex-start',
    },
    onBottom: {},
    image: {
      height: 36,
      width: 36,
      borderRadius: 18,
    },
  }),
  right: StyleSheet.create({
    container: {
      marginLeft: 8,
    },
    onTop: {
      alignSelf: 'flex-start',
    },
    onBottom: {},
    image: {
      height: 36,
      width: 36,
      borderRadius: 18,
    },
  }),
};
