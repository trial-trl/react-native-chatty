//@ts-ignore
import type UserAvatarType from 'react-native-user-avatar';

let UserAvatar: typeof UserAvatarType;

try {
  UserAvatar = require('react-native-user-avatar').default;
} catch {
  console.warn(
    'react-native-user-avatar not found. Avatar with enhanced features will not work.'
  );
}

export { UserAvatar };
