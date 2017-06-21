import { Map, List } from 'immutable'

const initialState = new Map({
  followers: new List(),
  pagination: new Map({hasMore: false, nextPage: ""}),
  user: new Map({})
})

export default initialState
