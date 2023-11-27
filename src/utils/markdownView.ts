export function loadMarkdownView() {
  try {
    const ReactNativeMarkdownView =
      require('react-native-markdown-view').MarkdownView;

    return ReactNativeMarkdownView;
  } catch (err) {
    console.warn(
      "Couldn't load react-native-markdown-view, please install it if you want to use markdown feature"
    );
  }
  return undefined;
}
