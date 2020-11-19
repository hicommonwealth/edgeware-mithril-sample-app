import m from 'mithril';
import { Input } from 'construct-ui';

const IndexPage = {
  view: (vnode) => {
    return m('.IndexPage', [
      m('h2', 'HumanityDAO'),
      m('hr'),
      m('h4', 'Contract address'),
      m(Input, { defaultValue: 'haha' }),
      m('h4', 'Members'),
      m('h4', 'New candidates'),
    ]);
  }
};

export default IndexPage;
