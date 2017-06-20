import { init }                 from 'snabbdom'
import h                        from 'snabbdom/h'
import view                     from './Components/view'

const patch = init([
  require('snabbdom/modules/class').default,
  require('snabbdom/modules/style').default,
  require('snabbdom/modules/props').default,
  require('snabbdom/modules/eventlisteners').default,
]);

const createRenderer = (root, initialState, broadcastFn) => {
  let vnode = patch(root, view(initialState, broadcastFn))
  return (state, broadcastFn) => {
    vnode = patch(vnode, view(state, broadcastFn));
  }
}

export default createRenderer
