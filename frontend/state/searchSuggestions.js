import { scroll, $next, $prev, $select } from './../utils'
import Rx from 'rxjs'
import $ from 'jquery'

const searchSuggestions = () => {
  const $input = $('#input_text');
  const $listRoot = $('.collection')
  const subject = new Rx.Subject()

  const getSuggestedUsers = term => {
    return $.ajax({
      url: `https://shipt-github-user-search.herokuapp.com/api/users/${term}`,
      dataType: 'json',
    }).promise();
  }

    // make sugggestion list arrow-key-scrollable, and submit on enter.
  const [arrowScrolls$, enterKeys$] = Rx.Observable.fromEvent($input, 'keydown')
    .pluck("which")
    .filter(key => [38, 40, 13].includes(key))
    .partition(key => key % 2 === 0)   // enter (13) is odd; up and down are even
                                      // #partition splits an Observable into 2 based on condition

  arrowScrolls$.map(key => key === 40 ? ['first-child', $next] : ['last-child', $prev])
    .forEach(args =>
      $(`.selected`).length ? scroll($(`.selected`), args[1]) : $select($(`.user:${args[0]}`)))


  const multicasted = enterKeys$.multicast(subject) //multicast allows 2+ streams to share an event
  multicasted.connect()
  multicasted.filter(() => $('.selected').length > 0)
    .merge(
      Rx.Observable.fromEvent($(document), 'mousedown')
        .filter(e => e.target.classList.contains('selected')))
    .forEach(() => {
      $input.val($(".selected").text())
      $('form').trigger('submit')
    })

    // makes suggestions clickable.
  Rx.Observable.fromEvent($('.input-field'),'mouseenter')
    .flatMap(e => Rx.Observable.fromEvent($('.collection-item'), 'mouseenter'))
    .forEach(e => $(e.currentTarget).addClass('selected').siblings().removeClass('selected'))


   // form submits are being preventDefault'd elsewhere. must manually blur inputs/clear suggestions
  Rx.Observable.fromEvent($('form'), 'submit').forEach(() => $input.blur())

  const [suggestionRequests$, clearSearchField$] = Rx.Observable.fromEvent($input, 'keyup')
    .pluck("target", "value")
    .partition(text => text && text.length > 2)

  const clearSuggestions$ = Rx.Observable.fromEvent($input, 'blur').merge(clearSearchField$)
  const clearSuggestions2$ = clearSuggestions$.share().forEach(() => $listRoot.empty())

  const suggestedUsers$ = suggestionRequests$
    .distinctUntilChanged()
    .debounceTime(350)
    .switchMap(getSuggestedUsers)
    .pluck('data')


  clearSuggestions$
    .flatMap(() => suggestedUsers$.takeUntil(clearSuggestions$))
    .forEach(res => {
      $listRoot
        .empty()
        .append($.map(res, (u) => $(`<div class="collection-item user">${u.login}</div>`)))
  })

}

  export default searchSuggestions
