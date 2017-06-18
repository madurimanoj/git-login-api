import searchSuggestions from './searchSuggestions'
import initiatGithubStream from './githubApi'

$(document).ready(() => {
  searchSuggestions()
  initiatGithubStream()
})
