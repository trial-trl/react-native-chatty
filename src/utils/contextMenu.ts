import { Platform } from 'react-native';
import type ContextMenuViewType from 'react-native-context-menu-view';

let contextMenuView: typeof ContextMenuViewType;

try {
  if (Platform.OS === 'ios' && parseInt(Platform.Version, 10) >= 13) {
    contextMenuView = require('react-native-context-menu-view');
  } else if (Platform.OS === 'android') {
    contextMenuView = require('react-native-context-menu-view');
  } else {
    throw new Error();
  }
} catch {
  console.warn("react-native-context-menu-view not found. Actions won't work");
}

export { contextMenuView };
