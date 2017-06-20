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
    .partition(key => key % 2 === 0)   // enter (13) is odd; up and down and even
                                      // #partition splits an Observable into 2 based on condition

  arrowScrolls$.map(key => key === 40 ? ['first-child', $next] : ['last-child', $prev])
    .forEach(args =>
      $(`.selected`).length ? scroll($(`.selected`), args[1]) : $select($(`.user:${args[0]}`)))

  Rx.Observable.fromEvent($('.input-field'),'mouseover')
  	.flatMap(e => Rx.Observable.fromEvent($('.collection-item'), 'mouseenter'))
  	.forEach(e => $(e.currentTarget).addClass('selected').siblings().removeClass('selected'))

  const multicasted = enterKeys$.multicast(subject)
  multicasted.filter(e => $('.selected').length > 0)
    .merge(
      Rx.Observable.fromEvent($(document), 'click'))
        .filter(e => e.target.classList.contains('selected'))
    .forEach(() => {
      $input.val($(".selected").text())
      $('form').trigger('submit')
    })

  Rx.Observable.fromEvent($('form'), 'submit').subscribe(() => $input.blur())

  multicasted.connect()

  const [suggestionRequests$, clearSearchField$] = Rx.Observable.fromEvent($input, 'keyup')
    .pluck("target", "value")
    .partition(text => text.length > 0 && text.length > 2)

  const clearSuggestions$ = Rx.Observable.fromEvent($input, 'blur')
    .merge(clearSearchField$, multicasted)

  const suggestedUsers$ = suggestionRequests$.debounceTime(350)
    .distinctUntilChanged()
    .switchMap(getSuggestedUsers)
    .pluck('data')

  clearSuggestions$
    .do(() => $listRoot.empty())
    .flatMap(() => suggestedUsers$.takeUntil(clearSuggestions$))
    .forEach(res => {
      $listRoot
        .empty()
        .append($.map(res, (u) => $(`<div href="#!" class="collection-item user">${u.login}</div>`)))
  })
}

export default searchSuggestions
