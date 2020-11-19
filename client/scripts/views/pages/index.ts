import $ from 'jquery';
import m from 'mithril';
import { Input } from 'construct-ui';

import { BlueprintPromise, ContractPromise } from '@polkadot/api-contract';

const HUMANITYDAO_ADDRESS = 'hg2F2U6rRpc5uGhA6E735NjHpKe3DmxYKFHSBH9PEdE3jYf';

const initializeHumanityDao = (store, api) => {
  const req = new XMLHttpRequest();
  req.open('GET', '/static/contracts/humanitydao.wasm', true);
  req.responseType = 'arraybuffer';
  req.onload = async (event) => {
    const arrayBuffer = req.response;
    const codehash = new Uint8Array(arrayBuffer) as any;
    const abi = await $.get('/static/contracts/metadata.json');

    const blueprint = new BlueprintPromise(api, abi, codehash);
    const contract = new ContractPromise(api, abi, HUMANITYDAO_ADDRESS);

    if (!store.selectedAccount.address) return;
    const address = store.selectedAccount.address;
    const value = 0;     // only useful on isPayable messages
    const gasLimit = -1; // max gas limit for read calls

    // read
    const numVotesResult = (await contract.query.numVotes(address, value, gasLimit)).result;
    const numCandidatesResult = (await contract.query.numCandidates(address, value, gasLimit)).result;
    const numMembersResult = (await contract.query.numMembers(address, value, gasLimit)).result;
    console.log(numVotesResult.toString());
    console.log(numCandidatesResult.toString());
    console.log(numMembersResult.toString());

    // write
    store.api.setSigner(store.selectedAccountSigner);
    contract.tx.submitCandidacy(value, gasLimit).signAndSend(address, (result) => {
      if (result.status.isInBlock) {
        console.log('in a block');
      } else if (result.status.isFinalized) {
        console.log('finalized');
      } else {
        // other
      }
    });

  }
  req.send(null);
};

const IndexPage = {
  view: (vnode) => {
    const { store } = vnode.attrs;
    if (!vnode.state.initialized && store.api && store.apiConnectionStatus === 'connected') {
      vnode.state.initialized = true;
      initializeHumanityDao(store, store.api);
    }
    return m('.IndexPage', [
      m('h2', 'HumanityDAO'),
      m('hr'),
      m('h4', 'Contract address'),
      m(Input, {
        defaultValue: HUMANITYDAO_ADDRESS,
        disabled: true,
      }),
      m('h4', 'Members'),
      m('h4', 'New candidates'),
    ]);
  }
};

export default IndexPage;
