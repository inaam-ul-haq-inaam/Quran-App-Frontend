// RootNavigation.js - UPDATED (with nested navigation support)

import {
  createNavigationContainerRef,
  CommonActions,
} from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigate(name, params) {
  if (navigationRef.isReady()) {
    // Check if it's nested navigation (has 'screen' property)
    if (params?.screen) {
      navigationRef.dispatch(
        CommonActions.navigate({
          name: name,
          params: {
            screen: params.screen,
            params: params.params || {},
          },
        }),
      );
    } else {
      navigationRef.navigate(name, params);
    }
  }
}

export function goBack() {
  if (navigationRef.isReady()) {
    navigationRef.goBack();
  }
}

export function getCurrentRouteName() {
  if (navigationRef.isReady()) {
    return navigationRef.getCurrentRoute()?.name;
  }
  return null;
}

export function getCurrentRoute() {
  if (navigationRef.isReady()) {
    return navigationRef.getCurrentRoute();
  }
  return null;
}
