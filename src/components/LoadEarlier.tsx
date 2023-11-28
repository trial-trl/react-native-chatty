import React, { useContext } from 'react';
import { useCallback } from 'react';
import { ActivityIndicator } from 'react-native';
import { Text, TouchableOpacity } from 'react-native';
import { PropsContext } from '../Chatty';
import type { ILoadEarlierProps } from '../types/Chatty.types';
import { useFetchingContext } from '../context/FetchingContext';

function _LoadEarlier({
  onLoadEarlier,
  buttonContainerStyle,
  labelStyle,
}: ILoadEarlierProps) {
  const propsContext = useContext(PropsContext);
  const [fetching, setFetching] = useFetchingContext();

  const onPress = useCallback(() => {
    setFetching(true);

    onLoadEarlier!().finally(() => setFetching(false));
  }, [onLoadEarlier, setFetching]);

  const loadingIndicator = useCallback(() => {
    if (!fetching) return null;

    if (propsContext.loadEarlierProps?.renderLoadingIndicator)
      return propsContext.loadEarlierProps?.renderLoadingIndicator();

    return <ActivityIndicator />;
  }, [fetching, propsContext.loadEarlierProps]);

  if (propsContext.loadEarlierProps?.type !== 'button')
    return loadingIndicator();

  if (fetching) return loadingIndicator();

  if (propsContext.loadEarlierProps?.renderButton)
    return propsContext.loadEarlierProps?.renderButton({
      onPress,
    });

  return (
    <TouchableOpacity
      onPress={onPress}
      style={
        buttonContainerStyle
          ? buttonContainerStyle
          : {
              padding: 10,
              backgroundColor: !fetching ? '#eb8334' : undefined,
              maxWidth: 100,
              margin: 10,
              borderRadius: 10,
              alignSelf: 'center',
            }
      }
    >
      <Text style={labelStyle ? labelStyle : { color: '#fff' }}>
        Load Earlier
      </Text>
    </TouchableOpacity>
  );
}

export const LoadEarlier = React.memo(_LoadEarlier);
