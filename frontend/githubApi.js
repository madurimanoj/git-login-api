import Rx                       from 'rxjs'
import $                        from 'jquery'
import { fromJS, Map, List }    from 'immutable'
import {
  prototype,
  formatURL,
  getDiffs
}                               from './utils'
import userCard                 from './UiComponents/userCard'
// import snabbdom                 from 'snabbdom'
const snabbdom = require('../node_modules/snabbdom/snabbdom');
const h = require('snabbdom/h')



const initiateGithubStream = () => {
  const source$ = Rx.Observable.fromEvent($('form'), 'submit')
  const loadMoreButton$ = Rx.Observable.fromEvent($('.load-button'), 'click')
  const $input = $('#input_text')
  const subject = new Rx.Subject()
  const multicasted = source$.multicast(subject)

  const followerRequests$ = multicasted.map(e => {
    e.preventDefault()
    return `https://api.github.com/users/${$input.val()}/followers`
  })
  .merge(loadMoreButton$.map(e => e.currentTarget.dataset.href))
  .map(requestUrl => $.ajax({url: requestUrl}))

  const userStream$ = multicasted.map(e => `https://api.github.com/users/${$input.val()}`)
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


  multicasted.connect()

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
    followersStream$,
    paginationStream$,
    userStream$
  )
  .scan((state, updateFn) => updateFn(state), initialState)

  const patch = snabbdom.init([
    require('snabbdom/modules/class').default,
    require('snabbdom/modules/style').default,
    require('snabbdom/modules/props').default,
    require('snabbdom/modules/eventlisteners').default,
  ]);

  var vnode;
  let prevState = initialState;
  const root = document.getElementById('root')

  vnode = patch(root, userCard(new Map({avatarUrl: "", url: "", followerCount: 0, login:""})))
  const render = (state) => {
    vnode = patch(vnode, userCard(state));
  }

  state.subscribe(state => {
    const diff = getDiffs(prevState, state)
    if (diff) render(state.get(diff))
  })


}


export default initiateGithubStream
// const responseCompletionStatus$ = responses$.map(response => {
//
// })
