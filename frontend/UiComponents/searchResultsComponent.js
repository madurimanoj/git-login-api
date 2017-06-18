import { div, a, h2, h3 } from 'snabbdom-helpers';
import { Map }            from 'immutable'
import userCard           from './userCard'
import pagination         from './pagination'
import followerList       from './followersList'
const h = require('snabbdom/h');

const view = (state) => {
  const { user, followers, pagination } = state.toJS()
  return (
    section({
      selector: `.results-container${user.get('login') && ' .hidden'}`,
      inner: [
        userCard(state.get('user')),
        followerList(state.get('followers')),
        pagination(state.get('pagination'))]
      ]
    })
)

export default view
