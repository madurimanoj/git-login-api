# git-login-api
[Live](https://shipt-github-user-search.herokuapp.com/)

## Architecture
When I get a take-home coding challenge asking for an SPA, I usually use React. It's the framework I'm most comfortable in, and with increasing frequency it's the one in use wherever I happen to be applying. That being said, my immediate feeling on reading the spec was that github user interface hardly required anything the size of React. I considered using Vue or Cycle, among others, but ultimately decided to forego frameworks altogether and wire it together with a handful of smaller libraries I grabbed off the shelf.

## Managing State: RxJS

### What is RxJS
For managing state I chose RxJS (Reactive extensions for javascript). I'm fairly new to reactive programming, but very enthusiastic. The motto of it is something like 'everything is (or can be treated as) a stream. 'Anyway, 'stream' is short for 'asynchronous data stream,' and it can mean anything from clicks on a button to the incremental arrival of data from netflix when you try to 'stream' a movie. We already deal with streams all the time. The insight behind RxJS is that we can treat streams as arrays. So what? Well, if a stream of clicks is an array, I can call forEach on it. I can call map and filter and reduce on it. I can sharpen and transform it in myriad ways, declaratively, and without needing to rely on any external or global variables to track my application state.

### How did I use RxJS
Rx.Observable.scan is a reduce-adjacent iterator (in RxJS-speak, an 'operator'), that publishes it's accumulator after every iteration, rather than just at the end. Which makes if perfect for DIY Redux. Look out Dan Abramov.

## Actions
I broke the app out into 3 views: the list of followers, the user card, and the load more button. I didn't treat the search bar as a simple view. In my build its both a visible and interactive component of the app, as well as a mediator, or action creator, between the views and state store. If you click a follower's card, their name replaces the current value in the search bar, the new value in the search bar is propagated to the state store, the state store updates the views. A nice unidirectional data flow.

## Views and rendering: hypertext and snabbdom
Just becuase I didn't think the app needed a shiny new framework doesn't mean I planned to make it janky. I used a library called Snabbdom, a virtual dom, to keep the dom updated and all the animations fresh.

### Materialize.js
I used Materialize for the search input form. I started to use it's search suggestions/autocomplete option but it was super janky, and wasn't giving me suggestions half the time. I kept the css for the input field, but built the search suggester myself.

## Search Suggestions
##### Please note that the quality of the search suggestions is adversely affected at times by the freeness of the dynos!!

### Backend
Github's Api doesn't support username suggestions, but suggestions are the obvious feature to add to a user search interface. I felt my only option was to build a back end the supported suggestions. At first, my first choice was ElasticSearch. Full text search + similarity comparison is computationally intense, and it’s the sort of thing ElasticSearch is built for. But then, I discovered that the maximum number of rows in a free Heroku database is 10,000. That's not that many. Instead of elasticsearch I went with a postgres trigram comparison search. It works by breaking words into groups of 3-letter substrings, starting at string[-2..0] and ending with a trigram made of just the last letter. It then counts the number of matches and near matches between all the trigrams from every pair of words, and returns a similarity score (0 <= s <= 1). There's a Postgres extension you can add with “CREATE EXTENSION pg_trgm" that adds a couple indexing functions optimized in different ways for full text similarity search.

### Frontend
The frontend component of auto-complete search suggestions is notoriously painful. I’d heard this said, but only now have I felt it. Here are some of the issues:
* Searches bust be throttled or debounced so you don't overload server

* Suggestions will not always arrive in order or on time. Do not display outdated suggestions
* Do not expect the UI to cooperate
  * There's actually a new input type 'datalist' that makes this easy, but it's really janky and it's weirdly hard to change it's defaults. For example if you want to get rid of the little downward pointing arrow that displays by default, look at this ridiculousness you have to do: 
````
input::-webkit-calendar-picker-indicator {
  display: none;
}
````
RxJS made did ease some of the pain, but not all of it. I left a fair number of comments in [the file](https://github.com/mbr84/git-login-api/blob/master/frontend/state/searchSuggestions.js)

## Tests
I'm very sad to say I didn't write any tests for this project. Time did not permit it, and between the midway point and the end it totally slipped my mind. I might have been able to throw together some tests at the last minute in React or Ruby or were it plain javascript, but testing is not something I've learned to do to RxJS code yet. : (


