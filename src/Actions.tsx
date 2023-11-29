import React, { useCallback, useContext, useState } from 'react';
import { StyleProp, Text, TextStyle, ViewStyle } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { PropsContext } from './Chatty';
import { IMedia, MediaType } from './types/Chatty.types';
import { selectImage } from './utils/imagePicker';

export interface IActionsProps {
  options?: { [key: string]: any };
  optionTintColor?: string;
  icon?: () => React.ReactNode;
  wrapperStyle?: StyleProp<ViewStyle>;
  iconTextStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  onPressActionButton?(): void;
  renderActionsIcon?: (props: { onPress: () => void }) => JSX.Element;
}

function _Actions(props: IActionsProps) {
  const propsContext = useContext(PropsContext);

  const [image, setImage] = useState<IMedia[] | undefined>();

  const onPress = useCallback(async () => {
    selectImage().then((r) => {
      if (r.canceled) {
        return;
      }

      const assets = {
        type: MediaType.Image,
        uri: r.assets[0].uri ?? undefined,
        base64: r.assets[0].base64 ?? undefined,
      };
      if (image) {
        setImage([...image, assets]);
      } else {
        setImage([assets]);
      }
    });
  }, [image]);

  if (!propsContext?.enableActions) return null;

  if (props?.renderActionsIcon)
    return props.renderActionsIcon({
      onPress,
    });

  return (
    <TouchableOpacity onPress={onPress} style={{ paddingHorizontal: 10 }}>
      <Text style={{ fontSize: 20 }}>+</Text>
    </TouchableOpacity>
  );
}

export const Actions = React.memo(_Actions);
