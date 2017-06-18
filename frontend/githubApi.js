import Rx                       from 'rxjs'
import $                        from 'jquery'
import { fromJS, Map, List }    from 'immutable'
import { prototype, formatURL } from './utils'


const initiatGithubStream = () => {
  const source$ = Rx.Observable.fromEvent($('form'), 'submit')
  const loadMoreButton$ = Rx.Observable.fromEvent($('.load-button'), 'click')
  const $input = $('#input_text')
  const subject = new Rx.Subject()
  const multicasted = source$.multicast(subject)

  const followerRequests$ = multicasted.map(e => {
    e.preventDefault()
    return `https://api.github.com/users/${$input.val()}/followers`
  })
  .merge(loadMoreButton$.mapTo(e.currentTarget.dataset.href))
  .map(requestUrl => $.ajax({url: requestUrl}))

  const userStream$ = multicasted.map(e => `https://api.github.com/users/${$input.val()}`)
    .flatMap(requestUrl => Rx.Observable.fromPromise($.ajax({url: requestUrl})))
    .map(res => state => {
      const newUserInfo = new Map({
        avatarUrl: res.avatar_url,
        followerCount: res.followers,
        address: res.html_url,
        login: res.login
      })
      return state.set("user", newUserInfo)
    })


  multicasted.connect()

  const paginationStream$ = followerRequests$.flatMap(res =>
    res.then((data, s, xhr) => formatURL(xhr.getResponseHeader('link')))
  )
  .map(link => state =>
    state.set("hasMore", !!link)
      .set("nextPage", link)
  )

  const followersStream$ = followerRequests$.flatMap(res => Rx.Observable.fromPromise(res))
    .map(res => state => state.get("followers").concat(fromJS(res)))

  const initialState = new Map({
    followers: new List(),
    hasMore: false,
    nextPage: null,
    user: new Map()
  })

  Rx.Observable.merge(
    followersStream$,
    paginationStream$,
    userStream$
  )
  .scan((state, updateFn) => updateFn(state), initialState)
  .forEach(state => console.log(state.get('user')))
}

export default initiatGithubStream
// const responseCompletionStatus$ = responses$.map(response => {
//
// })
