import 'lib/normalize.css';
import 'construct.scss';

import m from 'mithril';
import $ from 'jquery';
import { FocusManager } from 'construct-ui';
import moment from 'moment-twitter';

import Store from './store';
import setupMithrilRouteNavigation from './route_nav';
import Layout from 'views/layout';
import IndexPage from 'views/pages/index';
import AboutPage from 'views/pages/about';

// set up mithril route navigation
setupMithrilRouteNavigation();

$(() => {
  const store = new Store();

  m.route(document.body, '/', {
    '/':      { view: (vnode) => m(Layout, { store }, m(IndexPage)) },
    '/about': { view: (vnode) => m(Layout, { store }, m(AboutPage)) },
  });

  // initialize construct-ui focus manager
  FocusManager.showFocusOnlyOnTab();

  // initialize window error handler
  // window.onerror = (errorMsg, url, lineNumber, colNumber, error) => {
  //   notifyError(`${errorMsg}`);
  //   return false;
  // };

  // initialize other window behaviors
  document.ontouchmove = (event) => {
    event.preventDefault();
  };
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
