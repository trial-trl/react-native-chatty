import type PhotoViewType from '@trial-trl/react-native-image-viewing';

let PhotoView: typeof PhotoViewType;

try {
  PhotoView = require('@trial-trl/react-native-image-viewing').default;
} catch {
  console.warn(
    '@trial-trl/react-native-image-viewing not found. Image browser/zoom will not work.'
  );
}

export { PhotoView };
