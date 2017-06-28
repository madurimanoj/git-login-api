import { div, h2, h3 } from 'snabbdom-helpers';
const h = require('snabbdom/h')

const userView = state => {
  const followers = state.get("followerCount")
  let followersSentence;
  if (!followers && followers !== 0) {
    followersSentence = ""
  } else {
    followersSentence = `${followers} followers`
  }

  return div({
    selector: '.user-card',
    style: { transition: 'opacity 1s', opacity: '1', destroy: { opacity: "0" }},
    inner: [
      div({
        selector: '.user-details',
        inner: [
          h2({
            on: { click: () => location.assign(state.get('url')) },
            selector: '.user-name',
            inner: [
              `${state.get("login")}`
            ]
          }),
          h3({
            selector: '.followers',
            inner: [
              followersSentence
            ]
          })
        ]
      }),
      div({
        selector: '.avatar',
        style: { backgroundImage: `url(${state.get('avatarUrl')})`},
        on: {click: () => location.assign(`${state.get('url')}`)}
      })
    ]
  })
}
export default userView
