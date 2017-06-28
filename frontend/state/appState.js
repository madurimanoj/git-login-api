import Rx                       from 'rxjs'
import $                        from 'jquery'
import { fromJS, Map, List }    from 'immutable'
import {
  prototype,
  formatURL,
  clearState,
  userUrl,
  followersUrl
}                               from './../utils'
import initialState             from './initialState'
import createRenderer           from './vdom'



const initializeAppStore = () => {
  const subject = new Rx.Subject()
  const source$ = Rx.Observable.fromEvent($('form'), 'submit')
  const searchStreamMulticast = source$.multicast(subject)
  searchStreamMulticast.connect()

  const loadMoreUsersSubject = new Rx.Subject()
  const broadcast = url => loadMoreUsersSubject.next(url)

  const $input = $('#input_text')


  // Getting both the user info for the search and the user's followers.

  const followerRequests$ = searchStreamMulticast.map(e => {
      e.preventDefault()
      return followersUrl($input.val(), process.env.GITHUB_KEY)
    })
    .merge(loadMoreUsersSubject)
    .map(requestUrl => $.ajax({url: requestUrl}))

  const followersStream$ = followerRequests$
    .flatMap(res => {
      return Rx.Observable.fromPromise(res)
        .catch(err => Rx.Observable.empty())
        .map(res => state => {
          const newState = state.get('followers').concat(fromJS(res))
          return state.set("followers", newState)
        })
    })



  const userStream$ = searchStreamMulticast
    .map(e => userUrl($($input).val(), process.env.GITHUB_KEY))
    .flatMap(requestUrl => {
      return Rx.Observable.fromPromise($.ajax({url: requestUrl}))
        .catch(err => Rx.Observable.create(obs =>
          obs.next({
            avatar_url: '',
            followers: null,
            html_url: 'https://github.com',
            login: `User Not Found`
          })
        ))
        .map(res => state => {
          const newUserInfo = new Map({
            avatarUrl: res.avatar_url,
            followerCount: res.followers,
            url: res.html_url,
            login: res.login
          })
          return state.set("user", newUserInfo)
        })

    })


  // Load More Button

  const paginationStream$ = followerRequests$.flatMap(res =>
    res.then((data, s, xhr) =>
        formatURL(xhr.getResponseHeader('link'))
    )
      .catch(err => null)
  )
  .map(link => state => {
    const hasMore = link && link.slice(link.length - 1) !== "1"
    return state.set("pagination", new Map({ hasMore, nextPage: link }))
  })
  // state store

  const state = Rx.Observable.merge(
      searchStreamMulticast.map(clearState),
      followersStream$,
      paginationStream$,
      userStream$
    )
    // .retry()
    .scan((state, updateFn) => updateFn(state), initialState)

  return {
    state,
    broadcast,
    initialState
  }
}

export default initializeAppStore
