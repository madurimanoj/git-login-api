import { div, h4 } from 'snabbdom-helpers';
import $ from 'jquery'
const h = require('snabbdom/h');


const followersView = state => {
  let followers = state.map((follower, i) =>
    div({
      selector: '.follower-card',
      on: { click: () => {
          $('input').val(follower.get('login'))
          $('form').trigger('submit')
        }
      },
      style: {
        transform: 'translateY(750px)',
        transition: `.75s transform ${Math.floor((i % 30) / 2) * .2}s, .5s background-color ease-out, .5s outline ease-out`,
        delayed: { transform: 'none' },
        destroy: { opacity: '0', transition: "opacity 1s"}
      },
      inner: [
        div({
          selector: '.small-avatar',
          style: { backgroundImage: `url(${follower.get('avatar_url')})` },
        }),
        h4({selector: '.follower-login', inner: `${follower.get('login')}`}),
      ]
  }))

  if (followers.size % 2 !== 0) {
    followers = followers.push(div({style: { visibility: 'hidden', width: "45%"}}))
  }

  return div({
    selector: '.followers-list flex',
    inner: followers.toJS(),
  })
}

export default followersView
