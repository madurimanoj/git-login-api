import Rx                       from 'rxjs'
import $                        from 'jquery'
import { fromJS, Map, List }    from 'immutable'
import {
  prototype,
  formatURL,
  getDiffs
}                               from './utils'
import view                     from './UiComponents/view'
import { init }                 from 'snabbdom'
import h                        from 'snabbdom/h'

const initiateGithubStream = () => {
  const source$ = Rx.Observable.fromEvent($('form'), 'submit')
  const loadMoreButton$ = Rx.Observable.fromEvent($('.load-more'), 'click')
  const $input = $('#input_text')
  const subject = new Rx.Subject()
  const inputMulticast = source$.multicast(subject)
  const loadUsersEmitter = new Rx.Subject()
  const broadcast = (url) => loadUsersEmitter.next(url)

  const followerRequests$ = inputMulticast.map(e => {
    e.preventDefault()
    return `https://api.github.com/users/${$input.val()}/followers`
  })
  .merge(loadUsersEmitter)
  .map(requestUrl => $.ajax({url: requestUrl}))

  const userStream$ = inputMulticast.map(e => `https://api.github.com/users/${$input.val()}`)
    .flatMap(requestUrl => Rx.Observable.fromPromise($.ajax({url: requestUrl})))
    .map(res => state => {
      const newUserInfo = new Map({
        avatarUrl: res.avatar_url,
        followerCount: res.followers,
        url: res.html_url,
        login: res.login
      })
      return state.set("user", newUserInfo)
    })


  inputMulticast.connect()

  const paginationStream$ = followerRequests$.flatMap(res =>
    res.then((data, s, xhr) => formatURL(xhr.getResponseHeader('link')))
  )
  .map(link => state =>
    state.set("pagination", new Map({ hasMore: !!link, nextPage: link }))
  )

  const followersStream$ = followerRequests$.flatMap(res => Rx.Observable.fromPromise(res))
    .map(res => state => {
      const newState = state.get('followers').concat(fromJS(res))
      return state.set("followers", newState)
    })

  const initialState = new Map({
    followers: new List(),
    pagination: new Map({hasMore: false, nextPage: ""}),
    user: new Map({})
  })


  const state = Rx.Observable.merge(
    inputMulticast.map(() => state => state.set('followers', new List()).set('user', new Map())),
    followersStream$,
    paginationStream$,
    userStream$
  )
  .retry()
  .scan((state, updateFn) => updateFn(state), initialState)

  const patch = init([
    require('snabbdom/modules/class').default,
    require('snabbdom/modules/style').default,
    require('snabbdom/modules/props').default,
    require('snabbdom/modules/eventlisteners').default,
  ]);

  let vnode;
  const root = document.getElementById('root')
  vnode = patch(root, view(initialState, broadcast))
  const render = (state, broadcast) => {
    vnode = patch(vnode, view(state, broadcast));
  }

  state.subscribe(state => {
    render(state, broadcast)
  })
}

export default initiateGithubStream
