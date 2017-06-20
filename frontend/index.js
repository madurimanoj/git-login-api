import searchSuggestions from './searchSuggestions'
import initiateAppStore  from './appState'

$(document).ready(() => {
  searchSuggestions()
  initiateAppStore()
})
