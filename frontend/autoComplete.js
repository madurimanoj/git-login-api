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
    const [arrowScrolls$, enterKeys$] = keydown$.pluck("which")
        .filter(key => [38, 40, 13].includes(key))
        .partition(key => key % 2 === 0)      // enter code is odd, up and down are even

    arrowScrolls$.map(key => key === 40 ? ['first-child', $.fn.next] : ['last-child', $.fn.prev])
      .forEach(args => {
        const $lastActive = $(`.user.selected`).removeClass('selected')
        $nextActive = $lastActive.length ? args[1].apply($lastActive) : $(`.user:${args[0]}`)
        $nextActive.addClass('selected')
      })

    enterKeys$.forEach((e) => {
      const $selected = $('.selected')
      if ($selected.length > 0) {
        $input.val(selected.text())
        $results.empty()
      }
    })

    Rx.Observable.fromEvent($input, 'blur')
      .forEach(() => $listRoot.empty())

    const keyup$ = Rx.Observable.fromEvent($input, 'keyup')
      .pluck("target", "value")
      .filter(text => text.length > 2)
      .debounceTime(350)
      .distinctUntilChanged()

    const suggestedUsers$ = keyup$.switchMap(getSuggestedUsers).pluck('data')

    suggestedUsers$.forEach(res => {
        $listRoot
          .empty()
          .append($.map(res, (v) => $(`<a href="#!" class="collection-item user">${v.login}</a>`)))
      })
    }

  autoComplete(window, jQuery, Rx);
})
