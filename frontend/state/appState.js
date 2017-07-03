import Rx                       from 'rxjs'
import $                        from 'jquery'
import { fromJS, Map, List }    from 'immutable'
import {
  prototype,
  formatURL,
  clearState,
  userUrl,
  followersUrl,
  setUserState,
}                               from './../utils'
import initialState             from './initialState'
import createRenderer           from './vdom'



const initializeAppStore = () => {
    const subject               = new Rx.Subject()
    const source$               = Rx.Observable.fromEvent($('form'), 'submit')
    const searchStreamMulticast = source$.multicast(subject)

    const loadMoreUsersSubject  = new Rx.Subject()
    const broadcast             = url => loadMoreUsersSubject.next(url)
    const $input                = $('#input_text')

    searchStreamMulticast.connect()


    // Getting both the user info for the search and the user's followers.

    const followerRequests$ = searchStreamMulticast
        .map(e => {
            e.preventDefault()
            return followersUrl($input.val(), process.env.GITHUB_KEY)
        })
        .merge(loadMoreUsersSubject)
        .map(requestUrl => $.ajax({ url: requestUrl }))
        .share()


    const followersStream$ = followerRequests$
        .flatMap(res =>
            Rx.Observable.fromPromise(res)
                .catch(err => Rx.Observable.empty())
                .map(res => state =>
                    state.set('followers', state.get('followers').concat(fromJS(res)))
                )
        )


    const userStream$ = searchStreamMulticast
        .map(e => userUrl($($input).val(), process.env.GITHUB_KEY))
        .flatMap(requestUrl => {
            return Rx.Observable.fromPromise($.ajax({url: requestUrl}))
                .catch(err => Rx.Observable.create(obs =>
                    obs.next({
                        followers : null,
                        avatar_url: '',
                        login     : `User Not Found`,
                        html_url  : 'https://github.com',
                    })
                ))
            .map(res => setUserState(res))
        })

    // Load More Button

    const paginationStream$ = followerRequests$
        .flatMap(res =>
            res
              .then((data, s, xhr) =>
                  formatURL(xhr.getResponseHeader('link')))
              .catch(err => null))
        .map(link => state => {
            const hasMore = link && link.slice(link.length - 1) !== "1"
            return state.set("pagination", new Map({ hasMore, nextPage: link }))
        })

    // state store

    const streams = Rx.Observable.merge(
        searchStreamMulticast.map(clearState),
        followersStream$,
        paginationStream$,
        userStream$
    )
    const state = streams.scan((state, updateFn) => updateFn(state), initialState)


    return { state, broadcast, initialState }
}

export default initializeAppStore
