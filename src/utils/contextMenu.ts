import { Platform } from 'react-native';
import type ContextMenuViewType from 'react-native-context-menu-view';

let ContextMenuView: typeof ContextMenuViewType;

try {
  if (Platform.OS === 'ios' && parseInt(Platform.Version, 10) >= 13) {
    ContextMenuView = require('react-native-context-menu-view').default;
  } else if (Platform.OS === 'android') {
    ContextMenuView = require('react-native-context-menu-view').default;
  } else {
    throw new Error();
  }
} catch {
  console.warn("react-native-context-menu-view not found. Actions won't work");
}

export { ContextMenuView };
