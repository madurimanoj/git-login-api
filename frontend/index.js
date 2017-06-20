import searchSuggestions   from './state/searchSuggestions'
import initializeAppStore  from './state/appState'
import createRenderer      from './state/vdom'

$(document).ready(() => {
  document.getElementById('root')
  const { state, broadcast, initialState } = initializeAppStore()
  const render = createRenderer(root, initialState, broadcast)

  searchSuggestions()
  state.subscribe(state => {
    render(state, broadcast)
  })
})
