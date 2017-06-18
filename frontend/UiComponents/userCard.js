import { div, a, h2, h3 } from 'snabbdom-helpers';

const userCard = (avatarUrl, followerCount, url, login) =>
  div({
    selector: '.user-card',
    inner: [
      div({
        selector: '.avatar',
        style: { backgroundImage: `url(${avatarUrl})`}
      }),
      div({
        selector: '.user-details',
        inner: [
          h2({
            selector: '.user-name',
            inner: [
              `${login}`
            ]
          }),
          h3({
            selector: '.followers',
            inner: [
              `${followerCount} followers`
            ]
          })

        ]
      })
    ]
  })
export default userCard
