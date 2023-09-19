export const formatRouteName = (route) => {
  const hasLongName = route.route_long_name !== '' && route.route_long_name !== null;

  if (hasLongName) {
    return route.route_long_name;
  }

  return route.route_short_name;
}