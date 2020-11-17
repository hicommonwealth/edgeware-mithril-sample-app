import 'lib/normalize.css';
import 'construct.scss';

import m from 'mithril';
import $ from 'jquery';
import { FocusManager } from 'construct-ui';
import moment from 'moment-twitter';

// set up route navigation and back-button handling
const updateRouteTempStore = { lastNavigatedBack: undefined, lastNavigatedFrom: undefined };
m.route.prefix = '';
const _updateRoute = m.route.set;
export const updateRoute = (...args) => {
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

// set up ontouchmove blocker
document.ontouchmove = (event) => {
  event.preventDefault();
};

$(() => {
  // // set window error handler
  // window.onerror = (errorMsg, url, lineNumber, colNumber, error) => {
  //   notifyError(`${errorMsg}`);
  //   return false;
  // };

  m.route(document.body, '/', {
    '/': {
      view: (vnode) => {
        return m('', [
          m('a', {
            onclick: () => m.route.set('/about'),
          }, 'go to about')
        ]);
      }
    },
    '/about': {
      view: (vnode) => {
        return m('', 'about');
      }
    }
  });

  // initialize construct-ui focus manager
  FocusManager.showFocusOnlyOnTab();
});

// /////////////////////////////////////////////////////////
// For browserify-hmr
// See browserify-hmr module.hot API docs for hooks docs.
declare const module: any; // tslint:disable-line no-reserved-keywords
if (module.hot) {
  module.hot.accept();
  // module.hot.dispose((data: any) => {
  //   m.redraw();
  // })
}
// /////////////////////////////////////////////////////////
