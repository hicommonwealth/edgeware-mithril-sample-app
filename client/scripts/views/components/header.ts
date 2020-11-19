import 'components/header.scss';

import m from 'mithril';
import { PopoverMenu, MenuItem, Button } from 'construct-ui';

const Header: m.Component<{ store }, {}> = {
  view: (vnode) => {
    const { store } = vnode.attrs;

    return m('.Header', [
      m('a', {
        onclick: () => m.route.set('/'),
      }, 'Sample App'),
      m('a', {
        onclick: () => m.route.set('/about'),
      }, 'About'),
      m('.float-right', [
        store.apiConnectionStatus
          && m('span.connection-status', store.getFormattedApiConnectionStatus()),
        store.walletInitialized
          ? m(PopoverMenu, {
            hasArrow: false,
            transitionDuration: 0,
            trigger: m(Button, {
              label: store.selectedAccount
                ? (store.selectedAccount.address.slice(0, 6) + '...')
                : `${store.activeAccounts.length} account(s)`,
              style: 'float: right;'
            }),
            content: store.activeAccounts.length === 0 ? [
              m(MenuItem, {
                disabled: true,
                label: 'No accounts found'
              }),
            ] : [
              store.activeAccounts.map((account) => {
                const formattedAddress = account.address.slice(0, 6) + '... ' + account.walletName;
                return m(MenuItem, {
                  label: formattedAddress,
                  onclick: (e) => {
                    store.setSelectedAccount(account.address);
                  },
                });
              }),
            ],
          })
          : m(Button, {
            style: 'float: right;',
            label: 'Connect to a wallet',
            size: 'sm',
            onclick: () => store.loadAccounts(),
            oncreate: () => store.loadAccounts(),
          }),
      ]),
    ]);
  }
};

export default Header;
