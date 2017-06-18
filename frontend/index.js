import searchSuggestions from './searchSuggestions'
import initiateGithubStream from './githubApi'

$(document).ready(() => {
  searchSuggestions()
  initiateGithubStream()
})
