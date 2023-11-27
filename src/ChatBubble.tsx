import type { ViewSource } from '@trial-trl/react-native-image-viewing/dist/ImageViewing';
import dayjs from 'dayjs';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Image,
  ImageBackground,
  InteractionManager,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  useWindowDimensions,
} from 'react-native';
import { PropsContext } from './Chatty';
import { PhotoView } from './components/PhotoView';
import { ReplyingTo } from './components/ReplyingTo';
import { UrlPreviewBubble } from './components/UrlPreviewBubble';
import { VideoThumbnail } from './components/VideoThumbnail';
import {
  IChatBubble,
  IMessage,
  IUrlPreviewBubble,
  MediaType,
  MessageStatus,
} from './types/Chatty.types';
import { extractUrlFromString, fetchMetaData } from './utils/helpers';
import { ContextMenuWrapper } from './wrappers/ContextMenuWrapper';
import { MessageContent } from './MessageContent';

function _ChatBubble(
  props: Pick<IChatBubble, 'message' | 'withTrailingAccessory' | 'children'>
) {
  const { message, withTrailingAccessory, children } = props;
  const propsContext = useContext(PropsContext);
  const { width } = useWindowDimensions();
  const [mediaLoaded, setMediaLoaded] = useState<boolean>(false);
  const [showMedia, setShowMedia] = useState<boolean>(false);
  const [showUrlPreview, setShowUrlPreview] = useState(false);
  const [urlPreviewData, setUrlPreviewData] = useState<IUrlPreviewBubble>();
  const createdAt = useMemo(() => {
    return message && dayjs(message.createdAt).format('HH:mm');
  }, [message]);

  const avatarSize = useMemo(() => {
    return {
      width: propsContext.bubbleProps?.showAvatars?.width || 40,
      height: propsContext.bubbleProps?.showAvatars?.width || 40,
      borderRadius: propsContext.bubbleProps?.showAvatars?.width || 40,
    };
  }, [propsContext.bubbleProps?.showAvatars?.width]);

  const bubbleBackgroundColor = useMemo<ViewStyle>(() => {
    if (propsContext.bubbleProps?.containerStyle) {
      if (message?.me) {
        return {
          backgroundColor:
            propsContext?.bubbleProps?.selfBubbleColor ?? '#c8faaf',
          ...propsContext.bubbleProps.containerStyle,
        };
      } else {
        return {
          backgroundColor:
            propsContext?.bubbleProps?.otherBubbleColor ?? '#afddfa',

          ...propsContext.bubbleProps.containerStyle,
        };
      }
    }

    if (message?.me) {
      return {
        backgroundColor:
          propsContext?.bubbleProps?.selfBubbleColor ?? '#c8faaf',
      };
    }

    return {
      backgroundColor: propsContext?.bubbleProps?.otherBubbleColor ?? '#afddfa',
    };
  }, [
    message?.me,
    propsContext?.bubbleProps?.otherBubbleColor,
    propsContext?.bubbleProps?.selfBubbleColor,
    propsContext.bubbleProps?.containerStyle,
  ]);

  const bubbleAlignment = useMemo<ViewStyle>(() => {
    if (message?.me) {
      return {
        alignSelf: 'flex-end',
      };
    }

    return {
      alignSelf: 'flex-start',
    };
  }, [message?.me]);

  useEffect(() => {
    if (message?.media) {
      message.media.forEach((media) => {
        if (media.type === MediaType.Image) {
          InteractionManager.runAfterInteractions(() => {
            Image.prefetch(media.uri).then(() => {
              setMediaLoaded(true);
            });
          });
        }
      });
    }

    if (propsContext.enableUrlPreviews) {
      InteractionManager.runAfterInteractions(async () => {
        const url = extractUrlFromString(message?.text ?? '');

        if (url) {
          const data = await fetchMetaData(url);

          if (data) {
            setShowUrlPreview(true);
            setUrlPreviewData(data);
          }
        }
      });
    }
  }, [message?.media, message?.text, propsContext.enableUrlPreviews]);

  const renderTicks = useCallback(() => {
    if (message?.status) {
      switch (message.status) {
        case MessageStatus.Sending:
          return (
            propsContext.bubbleProps?.tickProps?.sendingElement ?? (
              <Text>🔄</Text>
            )
          );

        case MessageStatus.Sent:
          return (
            propsContext.bubbleProps?.tickProps?.sentElement ?? <Text>✔</Text>
          );

        case MessageStatus.Delivered:
          return (
            propsContext.bubbleProps?.tickProps?.deliveredElement ?? (
              <Text>☑</Text>
            )
          );

        case MessageStatus.Read:
          return (
            propsContext.bubbleProps?.tickProps?.readElement ?? <Text>✅</Text>
          );
      }
    }

    return null;
  }, [
    message?.status,
    propsContext.bubbleProps?.tickProps?.deliveredElement,
    propsContext.bubbleProps?.tickProps?.readElement,
    propsContext.bubbleProps?.tickProps?.sendingElement,
    propsContext.bubbleProps?.tickProps?.sentElement,
  ]);

  const renderFooter = useCallback(() => {
    return (
      <View style={styles.bubbleFooter}>
        <Text
          style={[
            styles.date,
            propsContext?.bubbleProps?.dateStyle &&
              propsContext?.bubbleProps?.dateStyle!(message?.me ?? false),
          ]}
        >
          {createdAt}
        </Text>
        {renderTicks()}
      </View>
    );
  }, [
    createdAt,
    message?.me,
    propsContext?.bubbleProps?.dateStyle,
    renderTicks,
  ]);

  const renderCornerRounding = useCallback(() => {
    if (propsContext.bubbleProps?.enableCornerRounding === false) return null;

    if (!withTrailingAccessory) return null;

    if (message?.me) {
      return (
        <View
          style={[
            styles.rightArrow,
            {
              borderTopColor: bubbleBackgroundColor.backgroundColor,
              borderBottomColor: bubbleBackgroundColor.backgroundColor,
            },
          ]}
        />
      );
    } else {
      return (
        <View
          style={[
            styles.leftArrow,
            {
              borderTopColor: bubbleBackgroundColor.backgroundColor,
              borderBottomColor: bubbleBackgroundColor.backgroundColor,
            },
          ]}
        />
      );
    }
  }, [
    bubbleBackgroundColor,
    message?.me,
    withTrailingAccessory,
    propsContext.bubbleProps?.enableCornerRounding,
  ]);

  const renderMedia = useCallback(() => {
    if (message?.media) {
      const photoViewCompatible: ViewSource[] = [];

      message.media.forEach((media) => {
        if (media.type === MediaType.Image) {
          photoViewCompatible.push({
            type: 'image',
            source: {
              uri: media.uri,
            },
          });
        }

        if (media.type === MediaType.Video) {
          photoViewCompatible.push({
            type: 'view',
            children: <VideoThumbnail media={media} isSelected />,
          });
          photoViewCompatible.push({
            type: 'view',
            children: <VideoThumbnail media={media} isSelected />,
          });
        }
      });

      return (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {message?.media.map((media, index) => {
            if (index < 3) {
              return (
                <TouchableOpacity onPress={() => setShowMedia(true)}>
                  {media.type === MediaType.Image && mediaLoaded && (
                    <View>
                      <Image source={{ uri: media.uri }} style={styles.media} />
                    </View>
                  )}
                  {media.type === MediaType.Video && (
                    <VideoThumbnail media={media} />
                  )}
                </TouchableOpacity>
              );
            }

            return null;
          })}

          {message.media.length > 3 && (
            <TouchableOpacity onPress={() => setShowMedia(true)}>
              <ImageBackground
                style={styles.media}
                source={{ uri: message.media[3]?.uri }}
                imageStyle={{
                  borderRadius: 15,
                }}
              >
                <View style={styles.backgroundOverlay}>
                  <Text
                    style={{ color: '#fff', textAlign: 'center', fontSize: 20 }}
                  >
                    + {message.media.length - 3}
                  </Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          )}

          {showMedia && (
            <PhotoView
              views={photoViewCompatible}
              visible={showMedia}
              onRequestClose={() => setShowMedia(false)}
            />
          )}
        </View>
      );
    }

    return null;
  }, [mediaLoaded, message, showMedia]);

  const renderUrlPreview = useMemo(() => {
    if (showUrlPreview && urlPreviewData && !message?.repliedTo) {
      return (
        <View style={{ marginTop: 10 }}>
          <UrlPreviewBubble
            title={urlPreviewData.title}
            description={urlPreviewData.description}
            image={urlPreviewData.image}
            url={urlPreviewData.url}
          />
        </View>
      );
    }

    return null;
  }, [message?.repliedTo, showUrlPreview, urlPreviewData]);

  return (
    <View style={[styles.wrapper, bubbleAlignment]}>
      {propsContext.bubbleProps?.trailingAccessory && message?.me && (
        <View>{propsContext.bubbleProps.trailingAccessory}</View>
      )}

      {propsContext.bubbleProps?.showAvatars?.visible && !message?.me && (
        <>
          {withTrailingAccessory && (
            <Image
              source={
                message?.user.avatar ?? require('./assets/images/noavatar.png')
              }
              style={[styles.avatar, avatarSize]}
            />
          )}
          {!withTrailingAccessory && (
            <View style={[styles.avatar, avatarSize]} />
          )}
        </>
      )}

      <ContextMenuWrapper message={message as IMessage}>
        <View
          style={[
            bubbleBackgroundColor,
            styles.container,
            {
              maxWidth: width - width / 4,
            },
            propsContext.bubbleProps?.containerStyle,
            { padding: message?.repliedTo ? 10 : 10 },
          ]}
        >
          {renderCornerRounding()}
          {children ? (
            children
          ) : (
            <>
              {message?.repliedTo && (
                <ReplyingTo
                  username={message?.repliedTo?.user.username}
                  text={message?.repliedTo.text}
                  messageId={message?.repliedTo.id}
                />
              )}

              <View>
                {renderMedia()}
                {renderUrlPreview}
                <MessageContent message={message} />
                {renderFooter()}
              </View>
            </>
          )}
        </View>
      </ContextMenuWrapper>

      {propsContext.bubbleProps?.showAvatars?.visible && message?.me && (
        <Image
          source={
            message?.user.avatar ?? require('./assets/images/noavatar.png')
          }
          style={[styles.avatarMe, avatarSize]}
        />
      )}

      {propsContext.bubbleProps?.trailingAccessory && !message?.me && (
        <View>{propsContext.bubbleProps.trailingAccessory}</View>
      )}
    </View>
  );
}

export const ChatBubble = React.memo(_ChatBubble);

export const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  container: {
    minWidth: 60,
    marginHorizontal: 20,
    marginVertical: 1,
    borderRadius: 6,
  },
  rightArrow: {
    position: 'absolute',
    width: 0,
    height: 0,
    top: 0,
    right: -8,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: 16,
    borderLeftWidth: 16,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopColor: 'red',
    borderBottomColor: 'red',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    transform: 'rotateZ(-90deg)',
  },
  leftArrow: {
    position: 'absolute',
    width: 0,
    height: 0,
    top: 0,
    left: -8,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: 16,
    borderLeftWidth: 16,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopColor: 'red',
    borderBottomColor: 'red',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },

  date: {
    color: '#a8a8a8',
    fontSize: 11,
  },
  avatar: {
    marginLeft: 10,
  },
  avatarMe: {
    marginRight: 10,
  },
  bubbleFooter: {
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },
  media: {
    width: 110,
    height: 100,
    borderRadius: 15,
    marginRight: 10,
    marginBottom: 10,
  },
  backgroundOverlay: {
    width: 110,
    height: 100,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 15,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
  },
});
