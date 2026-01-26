import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

export const HideNav = (route, hiddenScreens = []) => {
  const routeName = getFocusedRouteNameFromRoute(route);
  if (!routeName) return 'flex';
  if (hiddenScreens.includes(routeName)) {
    return 'none';
  }
  return 'flex';
};
