import dayjs from 'dayjs';
import type { ForwardedRef, Ref } from 'react';
import React, {
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  ScrollViewProps,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import { ChatBubble } from './ChatBubble';
import { PropsContext } from './Chatty';
import { SwipeableBubble } from './SwipeableBubble';
import { FAB, IFabRef } from './components/FAB';
import { LoadEarlier } from './components/LoadEarlier';
import { RenderDate } from './components/RenderDate';
import { TypingStatus } from './components/TypingStatus';
import { useHaptic } from './hooks/useHaptic';
import { usePrevious } from './hooks/usePrevious';
import {
  HapticType,
  IBubbleRenderOptions,
  IListProps,
  IMessage,
  ITypingStatusRef,
  LayoutType,
  ListRef,
} from './types/Chatty.types';
import { ChatBubbleEmitter } from './utils/eventEmitter';
import { wait } from './utils/helpers';

const ScrollViewWithHeader = React.forwardRef(
  ({ children, ...props }: ScrollViewProps, ref: Ref<ScrollView>) => {
    const propsContext = useContext(PropsContext);

    return (
      <ScrollView ref={ref} {...props}>
        {propsContext?.loadEarlierProps &&
          propsContext.loadEarlierProps.show &&
          propsContext.loadEarlierProps.type === 'button' && (
            <LoadEarlier {...propsContext.loadEarlierProps} />
          )}
        {children}
      </ScrollView>
    );
  }
);

export const List = React.forwardRef(
  (props: IListProps, ref: ForwardedRef<ListRef>) => {
    const propsContext = useContext(PropsContext);
    const flashListRef = useRef<FlashList<IMessage>>();
    const windowDimensions = useWindowDimensions();
    const safeArea = useSafeAreaInsets();
    const { trigger } = useHaptic();
    const fabRef = useRef<IFabRef>(null);
    const typingStatusRef = useRef<ITypingStatusRef>(null);
    const offsetY = useRef(0);
    const scrollContentHeight = useRef(0);
    const scrollHeight = useRef(0);
    const listHeight = useMemo(
      () => windowDimensions.height - 150 - safeArea.bottom - safeArea.top,
      [windowDimensions, safeArea]
    );
    const [scrollThresholdToReach, setScrollThresholdToReach] = useState(0);
    const [previousDistanceFromStart, setPreviousDistanceFromStart] =
      useState(0);
    const [allowMoreEvents, setAllowMoreEvents] = useState(true);
    const [
      shouldScrollAfterOnStartReached,
      setShouldScrollAfterOnStartReached,
    ] = useState(false);
    const [scrollLocked, setScrollLocked] = useState(true);

    const { rowRenderer: rowRendererProp, data } = props;

    const [messages, setMessages] = useState<IMessage[]>([]);
    const previousMessages = usePrevious<IMessage[]>(messages);

    /* This is a React Hook that is used to update the messages list when new messages are added. */
    useEffect(() => {
      setMessages(data);
    }, [data]);

    /* This code is listening to the event of a reply bubble being pressed. When it is pressed, it scrolls
to the replied message. */
    useEffect(() => {
      // When reply is pressed, scroll to replied message
      ChatBubbleEmitter.addListener('replyBubblePressed', (messageId) => {
        const index = messages.findIndex((m) => m.id === messageId);

        if (index !== -1) {
          flashListRef.current?.scrollToIndex({ index, animated: true });
        }
      });

      return () => {
        ChatBubbleEmitter.removeAllListeners();
      };
    }, [messages]);

    const scrollToBottom = useCallback((props?: { animated: boolean }) => {
      flashListRef.current?.scrollToEnd({ animated: props?.animated ?? true });
    }, []);

    /* Using the useImperativeHandle hook to expose a function to the parent component that will allow
    it to manipulate the messages list. */
    useImperativeHandle(
      ref,
      () => ({
        appendMessage: (
          message: IMessage | IMessage[],
          firstIndex?: boolean
        ) => {
          if (firstIndex) {
            if (Array.isArray(message)) {
              setMessages([...message, ...messages]);
            } else {
              setMessages([message, ...messages]);
            }
          } else {
            if (Array.isArray(message)) {
              setMessages([...messages, ...message]);
            } else {
              setMessages([...messages, message]);
            }
          }

          if (!Array.isArray(message)) {
            if (!message.me && propsContext?.enableHapticFeedback) {
              if (Platform.OS !== 'web') {
                trigger(HapticType.Heavy);
              }
            }
          }
        },
        /* This is a function that is used to scroll to the bottom of the list. */
        scrollToEnd: (animated?: boolean) => {
          flashListRef.current?.scrollToEnd({ animated });
        },
        /* Setting the typing status of the user. */
        setIsTyping: (typing?: boolean) => {
          typingStatusRef.current?.setIsTyping(typing ?? false);
          scrollToBottom();
        },
        /* Removing a message from the list of messages. */
        removeMessage: (id: number) => {
          setMessages(messages.filter((message) => message.id !== id));
        },
      }),
      [messages, propsContext.enableHapticFeedback, scrollToBottom, trigger]
    );

    /* This code is checking if the first message in the previous messages is the same as the first message
in the current messages. If it is, then it will not scroll to the bottom. */
    useEffect(() => {
      if (previousMessages && previousMessages[0]?.id === messages[0]?.id) {
        wait(100).then(() => {
          scrollToBottom();
        });
      }
    }, [scrollToBottom, messages, previousMessages]);

    useEffect(() => {
      if (shouldScrollAfterOnStartReached === true) {
        const indexToScrollTo =
          messages.length - (previousMessages?.length ?? 0);

        flashListRef.current?.scrollToIndex({
          animated: false,
          index: indexToScrollTo,
          viewPosition: 0.0,
          viewOffset: 0,
        });
      }

      setShouldScrollAfterOnStartReached(false);
    }, [messages, previousMessages, shouldScrollAfterOnStartReached]);

    useEffect(() => {
      if (!scrollLocked) {
        fabRef.current?.show();
      } else {
        fabRef.current?.hide();
        scrollToBottom();
      }
    }, [scrollLocked, scrollToBottom]);

    const getCurrentMessage = useCallback(
      (index: number) => {
        if (index > messages.length - 1) return null;

        const message: IMessage = messages[index];
        return message;
      },
      [messages]
    );

    const getPreviousMessage = useCallback(
      (index: number) => {
        if (index <= 0) return null;

        const prevMessage: IMessage = messages[index - 1];
        return prevMessage;
      },
      [messages]
    );

    const getItemType = useCallback(
      (item: IMessage, index: number) => {
        const prevMessage = getPreviousMessage(index);

        if (item.text.length >= 600) {
          return LayoutType.ExtremeLong;
        }

        if (item.text.length >= 400) {
          return LayoutType.Long3x;
        }

        if (item.text.length >= 200) {
          return LayoutType.Long2x;
        }

        if (item.text.length >= 100) {
          return LayoutType.Long;
        }

        if (item?.media) {
          if (item.media.length > 2) {
            return LayoutType.Media2x;
          }

          return LayoutType.Media;
        }

        if (item.repliedTo) {
          return LayoutType.Replied;
        }

        const isFirstMessage = index === 0;

        if (
          (!isFirstMessage &&
            dayjs(item.createdAt).date() !==
              dayjs(prevMessage?.createdAt).date()) ||
          isFirstMessage
        ) {
          return LayoutType.Dated;
        }

        return LayoutType.Normal;
      },
      [getPreviousMessage]
    );

    const isMessageChain = useCallback(
      (index: number) => {
        const currentMessage = getCurrentMessage(index);
        const prevMessage = getPreviousMessage(index);

        const type = getItemType(currentMessage!, index);

        return (
          type !== LayoutType.Dated && currentMessage?.me === prevMessage?.me
        );
      },
      [getCurrentMessage, getPreviousMessage, getItemType]
    );

    const renderBubble = useCallback(
      (
        data: IMessage,
        { withDate, withTrailingAccessory }: IBubbleRenderOptions
      ) => {
        if (rowRendererProp) {
          return (
            <View>
              {withDate && (
                <RenderDate
                  date={data.createdAt}
                  {...propsContext.renderDateProps}
                />
              )}

              <Animated.View entering={FadeInDown} exiting={FadeOutUp}>
                <SwipeableBubble
                  message={data}
                  withTrailingAccessory={withTrailingAccessory}
                  onReply={propsContext.onReply}
                  onCancelReply={propsContext.onCancelReply}
                >
                  {rowRendererProp(data)}
                </SwipeableBubble>
              </Animated.View>
            </View>
          );
        }

        return (
          <View style={{ width: '100%' }}>
            {withDate && (
              <RenderDate
                date={data.createdAt}
                {...propsContext.renderDateProps}
              />
            )}
            <Animated.View entering={FadeInDown} exiting={FadeOutUp}>
              {propsContext.onReply ? (
                <>
                  <SwipeableBubble
                    message={data}
                    withTrailingAccessory={withTrailingAccessory}
                    onReply={propsContext.onReply}
                    onCancelReply={propsContext.onCancelReply}
                  />
                </>
              ) : (
                <ChatBubble
                  message={data}
                  withTrailingAccessory={withTrailingAccessory}
                />
              )}
            </Animated.View>
          </View>
        );
      },
      [
        propsContext.onReply,
        propsContext.onCancelReply,
        propsContext.renderDateProps,
        rowRendererProp,
      ]
    );

    const rowRenderer = useCallback(
      ({ index, item, extraData }: ListRenderItemInfo<IMessage>) => {
        const type = flashListRef.current?.props.getItemType!(
          item,
          index,
          extraData
        );

        const withTrailingAccessory = !isMessageChain(index);

        if (type === LayoutType.Dated) {
          return renderBubble(item, { withDate: true, withTrailingAccessory });
        }

        return renderBubble(item, { withDate: false, withTrailingAccessory });
      },
      [isMessageChain, renderBubble]
    );

    const SCROLL_DIRECTION = {
      NONE: 0,
      TOP: -1,
      BOTTOM: 1,
    };

    const onLayout = (event: LayoutChangeEvent) => {
      scrollHeight.current = event.nativeEvent.layout.height;
      lockScroll();

      const { onStartReachedThreshold = 0.0 } = props;

      if (typeof props.onLayout === 'function') {
        props.onLayout(event);
      }

      setScrollThresholdToReach(
        event.nativeEvent.layout.height * onStartReachedThreshold!
      );
    };

    const onContentSizeChange = (width: number, height: number) => {
      scrollContentHeight.current = height;
      lockScroll();
    };

    const onStartReached = useCallback(
      async (
        info = {
          distanceFromStart: 0,
        }
      ) => {
        if (
          typeof props.onStartReached === 'function' ||
          typeof propsContext.loadEarlierProps?.onLoadEarlier === 'function'
        ) {
          setAllowMoreEvents(false);

          props.onStartReached?.(info);
          await propsContext.loadEarlierProps?.onLoadEarlier?.();

          setAllowMoreEvents(true);
          setShouldScrollAfterOnStartReached(true);
        }
      },
      [props, propsContext.loadEarlierProps]
    );

    const hasReachedStart = useCallback(
      (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (
          !propsContext.loadEarlierProps?.show ||
          propsContext.loadEarlierProps?.type !== 'scroll'
        )
          return;

        const {
          nativeEvent: {
            contentOffset: { y: distanceFromStart },
          },
        } = e;

        const hasReachedScrollThreshold =
          distanceFromStart <= scrollThresholdToReach;
        const scrollDirection =
          distanceFromStart - previousDistanceFromStart < 0
            ? SCROLL_DIRECTION.TOP
            : SCROLL_DIRECTION.BOTTOM;

        setPreviousDistanceFromStart(distanceFromStart);

        if (
          allowMoreEvents === true &&
          hasReachedScrollThreshold === true &&
          scrollDirection === SCROLL_DIRECTION.TOP
        ) {
          onStartReached({ distanceFromStart });
        }
      },
      [
        propsContext.loadEarlierProps,
        scrollThresholdToReach,
        previousDistanceFromStart,
        SCROLL_DIRECTION.TOP,
        SCROLL_DIRECTION.BOTTOM,
        allowMoreEvents,
        onStartReached,
      ]
    );

    const onScroll = useCallback(
      (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        offsetY.current = e.nativeEvent.contentOffset.y;
        lockScroll();

        hasReachedStart(e);

        if (props.onScroll) {
          props.onScroll(e);
        }
      },
      [props, hasReachedStart]
    );

    const lockScroll = () => {
      setScrollLocked(
        offsetY.current >= scrollContentHeight.current - scrollHeight.current
      );
    };

    return (
      <View style={{ minWidth: 1, minHeight: 1, maxHeight: listHeight }}>
        {propsContext.showScrollToBottomButton && (
          <FAB
            ref={fabRef}
            onPress={() => scrollToBottom()}
            {...propsContext.scrollToBottomProps}
          />
        )}

        <FlashList
          estimatedItemSize={230}
          renderScrollComponent={ScrollViewWithHeader}
          renderItem={rowRenderer}
          data={messages}
          getItemType={getItemType}
          style={[
            {
              height: propsContext.replyingTo ? '90%' : '100%',
            },
            props.containerStyle,
          ]}
          // @ts-ignore
          ref={flashListRef}
          overrideProps={{
            keyboardShouldPersistTaps: 'never',
          }}
          onLayout={onLayout}
          onContentSizeChange={onContentSizeChange}
          onScroll={onScroll}
          optimizeForInsertDeleteAnimations
          renderFooter={() => <TypingStatus ref={typingStatusRef} />}
          onEndReached={props?.onEndReached}
          onEndReachedThreshold={props?.onEndReachedThreshold}
          scrollEventThrottle={1000 / 60}
        />
      </View>
    );
  }
);
