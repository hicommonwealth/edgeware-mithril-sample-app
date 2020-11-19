import m from 'mithril';

const setupMithrilRouteNavigation = () => {
  // set up route navigation and back-button handling
  const updateRouteTempStore = { lastNavigatedBack: undefined, lastNavigatedFrom: undefined };
  m.route.prefix = '';
  const _updateRoute = m.route.set;
  const updateRoute = (...args) => {
    updateRouteTempStore.lastNavigatedBack = false;
    updateRouteTempStore.lastNavigatedFrom = m.route.get();
    if (args[0] !== m.route.get()) _updateRoute.apply(this, args);
  };
  m.route.set = (...args) => {
    // set app params that maintain global state for:
    // - whether the user last clicked the back button
    // - the last page the user was on
    updateRouteTempStore.lastNavigatedBack = false;
    updateRouteTempStore.lastNavigatedFrom = m.route.get();
    // update route
    if (args[0] !== m.route.get()) _updateRoute.apply(this, args);
    // reset scroll position
    const html = document.getElementsByTagName('html')[0];
    if (html) html.scrollTo(0, 0);
    const body = document.getElementsByTagName('body')[0];
    if (body) body.scrollTo(0, 0);
  };
  const _onpopstate = window.onpopstate;
  window.onpopstate = (...args) => {
    updateRouteTempStore.lastNavigatedBack = true;
    updateRouteTempStore.lastNavigatedFrom = m.route.get();
    if (_onpopstate) _onpopstate.apply(this, args);
  };
};

export default setupMithrilRouteNavigation;
