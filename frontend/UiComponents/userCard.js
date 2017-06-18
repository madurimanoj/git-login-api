import { div, a, h2, h3 } from 'snabbdom-helpers';
const h = require('snabbdom/h')

const userCard = state => {
  return div({
    selector: '.user-card',
    inner: [
      div({
        selector: '.avatar',
        style: { backgroundImage: `url(${state.get("avatarUrl")})`},
        on: {click: () => window.location.replace(`${state.get('url')}`)}
      }),
      div({
        selector: '.user-details',
        inner: [
          h2({
            selector: '.user-name',
            inner: [
              `${state.get("login")}`
            ]
          }),
          h3({
            selector: '.followers',
            inner: [
              `${state.get("followerCount")} followers`
            ]
          })

        ]
      })
    ]
  })
}
export default userCard
