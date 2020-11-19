import 'layout.scss';

import m from 'mithril';

import Header from 'views/components/header';

const Layout = {
  view: (vnode) => {
    const { store } = vnode.attrs;

    return m('.Layout', [
      m('.layout-header', [
        m(Header, { store }),
      ]),
      m('.layout-content', vnode.children),
    ]);
  }
};

export default Layout;
