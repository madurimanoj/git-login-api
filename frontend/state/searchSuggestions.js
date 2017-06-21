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

        // makes suggestions clickable.
  Rx.Observable.fromEvent($('.input-field'),'mouseover')
  	.flatMap(e => Rx.Observable.fromEvent($('.collection-item'), 'mouseenter'))
  	.forEach(e => $(e.currentTarget).addClass('selected').siblings().removeClass('selected'))

  const multicasted = enterKeys$.multicast(subject)
  multicasted.filter(e => $('.selected').length > 0)
    .merge(
      Rx.Observable.fromEvent($(document), 'mousedown')
        .filter(e => e.target.classList.contains('selected')))
    .forEach(() => {
      $input.val($(".selected").text())
      $('form').trigger('submit')
    })

   // form submits are being preventDefault'd elsewhere. must manually blur inputs/clear suggestions
  Rx.Observable.fromEvent($('form'), 'submit').subscribe(() => $input.blur())

  multicasted.connect()

  const [clearSearchField$, suggestionRequests$] = Rx.Observable.fromEvent($input, 'keyup')
    .partition(e => e.which === 8 && e.target.value === 0)

  const clearSuggestions$ = Rx.Observable.fromEvent($input, 'blur')
    .merge(clearSearchField$, multicasted)

  const clearSuggestionsMulticast = clearSuggestions$.multicast(new Rx.Subject())
  clearSuggestionsMulticast.connect()
  clearSuggestionsMulticast.forEach((e) => $listRoot.empty())

  const suggestedUsers$ = suggestionRequests$
    .pluck(['target', 'value'])
    .filter(text => text && text.length > 2)
    .debounceTime(350)
    .distinctUntilChanged()
    .switchMap(getSuggestedUsers)
    .pluck('data')

    /* what happens here: when an event like blurring the search input, submitting a search
        or deleting every character from the search field, the op below will  
  * * flatMap: transform the map(replace) the stream of clear suggestions events with a stream
          of key down events on the search field, which will generate search suggestions.
      * * takeUntil: the new mapped stream of user suggestions is unsubscribed at the next
          clear suggestions event.
  * * forEach: what to do for every suggestedUser event between the beginning and ending clear
      suggestion events
  * * The window is exclusive of the bounding clear suggestion events, so we've had to multicast the
      stream and clear the suggestions separately (line 56) */
  clearSuggestionsMulticast
    .flatMap(() => suggestedUsers$.takeUntil(clearSuggestions$))
    .forEach(res => {
      $listRoot
        .empty()
        .append($.map(res, (u) => $(`<div class="collection-item user">${u.login}</div>`)))
  })

}

export default searchSuggestions
