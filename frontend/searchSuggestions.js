import { moveFocus, $next, $prev } from './utils'
import Rx from 'rxjs'
import $ from 'jquery'

const searchSuggestions = () => {

  const getSuggestedUsers = term => {
    return $.ajax({
      url: `http://localhost:3000/api/users/${term}`,
      dataType: 'json',
    }).promise();
  }

  const $input = $('#input_text');
  const $listRoot = $('.collection')

  const keydown$ = Rx.Observable.fromEvent($(document), 'keydown')
  const [arrowScrolls$, enterKeys$] = keydown$.pluck("which")
      .filter(key => [38, 40, 13].includes(key))
      .partition(key => key % 2 === 0)      // enter code is odd, up and down are even

  arrowScrolls$.map(key => key === 40 ? ['first-child', $next] : ['last-child', $prev])
    .forEach(args => {
      const $lastActive = $(`.user.selected`)
      $lastActive.length ? moveFocus($lastActive, args[1]) : moveFocus($(`.user:${args[0]}`))
    })

  enterKeys$.forEach((e) => {
    const $selected = $('.selected')
    if ($selected.length > 0) {
      $input.val(selected.text())
      $results.empty()
    }
  })

  const keyup$ = Rx.Observable.fromEvent($input, 'keyup')
    .pluck("target", "value")

  const [suggestionRequests$, clearSearchField$] = keyup$.partition(text => text.length > 0)

  const clearSuggestions$ = Rx.Observable.fromEvent($input, 'blur')
    .merge(clearSearchField$)

  const suggestedUsers$ = suggestionRequests$.filter(text => text.length > 2)
    .debounceTime(350)
    .distinctUntilChanged()
    .switchMap(getSuggestedUsers)
    .pluck('data')

  suggestedUsers$.forEach(res => {
    $listRoot
      .empty()
      .append($.map(res, (u) => $(`<a href="#!" class="collection-item user">${u.login}</a>`)))
  })

  clearSuggestions$.forEach(() => $listRoot.empty())
}

export default searchSuggestions
