import searchSuggestions   from './searchSuggestions'
import initializeAppStore  from './appState'
import createRenderer      from './vdom'

$(document).ready(() => {
  document.getElementById('root')
  const { state, broadcast, initialState } = initializeAppStore()
  const render = createRenderer(root, initialState, broadcast)

  searchSuggestions()
  state.subscribe(state => {
    render(state, broadcast)
  })
})
