import React from 'react';
import type { IMedia } from '../types/Chatty.types';
import { RenderVideoExpo, videoRef } from '../utils/videoRenderer';
import { ResizeMode } from 'expo-av';

interface IProps {
  media: IMedia;
}

export const Video = ({ media }: IProps) => {
  return (
    <RenderVideoExpo
      source={{ uri: media.uri, ...media?.videoOptions?.headers }}
      style={{
        width: 300,
        height: 300,
      }}
      pictureInPicture={media?.videoOptions?.pictureInPicture}
      resizeMode={ResizeMode.CONTAIN}
      useNativeControls
      shouldPlay
      ref={videoRef}
      {...media?.videoOptions}
    />
  );
};
