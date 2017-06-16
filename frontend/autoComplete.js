$(document).ready(el => {
  const autoComplete = (global, $, Rx) => {

    const getSuggestedUsers = term => {
      return $.ajax({
        url: `http://localhost:3000/api/users/${term}`,
        dataType: 'json',
      }).promise();
    }

    const $input = $('#input_text');
    const $listRoot = $('.collection')

    const keydown$ = Rx.Observable.fromEvent($($(document)), 'keydown')
    const [userNavigation$, selection$] = keydown$.pluck("which")
        .filter(key => [38, 40, 13].includes(key))
        .partition(key => key % 2 === 0)

    let [scrollDown$, scrollUp$] = userNavigation$.partition(key => key === 40)

    scrollDown$.forEach(() =>
      $('.user:not(:last-child).selected').removeClass('selected').next().addClass('selected'))

    scrollUp$.forEach(() =>
      $('.user:not(:first-child).selected').removeClass('selected').prev().addClass('selected'))

    selection$.forEach(() => {
      if ($('.selected').length > 0) {
        var selected = $('.selected')
        $input.val(selected.text())
        $results.empty()
      }
    })

    Rx.Observable.fromEvent($input, 'blur')
      .forEach(() => $listRoot.empty())


    var keyup$ = Rx.Observable.fromEvent($input, 'keyup')
      .pluck("target", "value")
      .filter(text => text.length > 2)
      .debounceTime(500)
      .distinctUntilChanged()

    var suggestedUsers$ = keyup$.switchMap(getSuggestedUsers)
      .pluck('data')
      .do(res => console.log($input))

    suggestedUsers$.forEach(res => {
        $listRoot
          .empty()
          .append($.map(res, (v) => $(`<a href="#!" class="collection-item user">${v.login}</a>`)))
          $('.collection-item:first-child').addClass('selected')
      })
    }

  autoComplete(window, jQuery, Rx);
})
