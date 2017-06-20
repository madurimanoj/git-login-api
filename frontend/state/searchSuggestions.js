import { scroll, $next, $prev, $select } from './../utils'
import Rx from 'rxjs'
import $ from 'jquery'

const searchSuggestions = () => {
  const $input = $('#input_text');
  const $listRoot = $('.collection')
  const subject = new Rx.Subject()

  const getSuggestedUsers = term => {
    return $.ajax({
      url: `http://localhost:3000/api/users/${term}`,
      dataType: 'json',
    }).promise();
  }

  const [arrowScrolls$, enterKeys$] = Rx.Observable.fromEvent($input, 'keydown')
    .pluck("which")
    .filter(key => [38, 40, 13].includes(key))
    .partition(key => key % 2 === 0)      // enter code is odd, up and down are even

  arrowScrolls$.map(key => key === 40 ? ['first-child', $next] : ['last-child', $prev])
    .forEach(args =>
      $(`.selected`).length ? scroll($(`.selected`), args[1]) : $select($(`.user:${args[0]}`)))

  const multicasted = enterKeys$.multicast(subject)
  multicasted.filter(e => $('.selected').length > 0)
    .forEach(e => {
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

  const suggestedUsers$ = suggestionRequests$ .debounceTime(350)
    .distinctUntilChanged()
    .switchMap(getSuggestedUsers)
    .pluck('data')

  clearSuggestions$
    .do(() => $listRoot.empty())
    .flatMap(() => suggestedUsers$.takeUntil(clearSuggestions$))
    .forEach(res => {
      $listRoot
        .empty()
        .append($.map(res, (u) => $(`<a href="#!" class="collection-item user">${u.login}</a>`)))
  })
}

export default searchSuggestions
