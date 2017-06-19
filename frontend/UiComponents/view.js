import { div, a, h2, h3, section }    from 'snabbdom-helpers';
import { Map }                     from 'immutable'
import userView                    from './userView'
import paginationView              from './paginationView'
import followersView               from './followersView'
const h = require('snabbdom/h');

const view = (state, broadcast) => {
  const hasUser = !!state.getIn(['user', 'login'])
  return (
    section({
      inner: hasUser ?
        [
          div({
            selector: `.results-container`,
            inner: [
              userView(state.get('user')),
              followersView(state.get('followers')),
              paginationView(state.get('pagination'), broadcast)
            ],
            style: {
              transform: 'translate(-50%, 80vh)',
              opacity: '0',
              transition: 'transform .75s, opacity 1s',
              remove: { opacity: "0",  transform: "translateX(-50%, 0vh)" },
              delayed: { transform: 'translate(-50%, 0vh)', opacity: "1"},
            }
          })
        ] : []
    })
  )
}
export default view
