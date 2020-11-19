import m from 'mithril';

import { Mainnet, Beresheet } from '@edgeware/node-types';
import { web3Accounts, web3Enable, web3FromAddress, isWeb3Injected } from '@polkadot/extension-dapp';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { Signer } from '@polkadot/api/types';
import { ApiPromise, WsProvider } from '@polkadot/api';

class Account {
  address: string;
  walletName: string;

  constructor(address, walletName) {
    this.address = address;
    this.walletName = walletName;
  }
}

class Store {
  selectedAccount: Account;
  activeAccounts: Account[];
  walletInitialized: boolean;

  apiInitialized: boolean;
  api;
  apiConnectionStatus: string = 'disconnected';
  latestBlocktime: number;

  updateApiConnectionStatus = (status: string) => {
    console.log(`api: ${status}`);
    this.apiConnectionStatus = status;
    m.redraw();
  }
  updateLatestBlocktime = (timestamp) => {
    this.latestBlocktime = timestamp;
    m.redraw();
  }
  getFormattedApiConnectionStatus = () => {
    const dict = {
      connected: 'Connected',
      disconnected: 'Disconnected',
      error: 'Error',
    };
    return dict[this.apiConnectionStatus];
  }

  initializeAPI = async () => {
    const createApiProvider = async (nodeUrl: string) => {
      const RECONNECT_INTERVAL = 1000;
      const provider = new WsProvider(nodeUrl, RECONNECT_INTERVAL);
      provider.on('connected', () => this.updateApiConnectionStatus('connected'));
      provider.on('disconnected', () => this.updateApiConnectionStatus('disconnected'));
      provider.on('error', () => this.updateApiConnectionStatus('error'));
      return provider;
    };
    this.api = await ApiPromise.create({
      provider: await createApiProvider('ws://mainnet1.edgewa.re:9944'),
      types: Mainnet.types,
      typesAlias: Mainnet.typesAlias,
    });

    // get the blocktime, and subscribe to timestamps
    let last;
    this.api.query.timestamp.now((timestamp) => {
      this.updateLatestBlocktime(timestamp);

      last = timestamp.toNumber();
      const elapsed = last
        ? `, ${timestamp.toNumber() - last}s since last`
        : '';
      console.log(`imported block with timestamp ${timestamp}${elapsed}`);
    });
  }

  setSelectedAccount = (address: string) => {
    const account = this.activeAccounts.find((a) => a.address === address);
    if (!account) return;
    this.selectedAccount = account;

    localStorage.setItem('lastSelectedAccount', address);
    m.redraw();
  }

  loadAccounts = async () => {
    // request polkadot-js authentication
    if (!isWeb3Injected) {
      alert('No web3 wallet injected!');
    }
    const injectedExtensionInfo = await web3Enable('Sample App');
    const accounts = await web3Accounts();

    this.walletInitialized = true;
    this.activeAccounts = accounts.map((a) => new Account(a.address, a.meta.name));

    const lastSelectedAddress = localStorage.getItem('lastSelectedAccount');
    const lastSelectedAccount = lastSelectedAddress && this.activeAccounts.find((a) => a.address === lastSelectedAddress);
    if (lastSelectedAccount) this.setSelectedAccount(lastSelectedAccount.address);
    m.redraw();
  };

  constructor() {
    this.activeAccounts = [];
    this.initializeAPI(); // TODO: should the API be loaded after a wallet is connected?
  }
}

export default Store;
