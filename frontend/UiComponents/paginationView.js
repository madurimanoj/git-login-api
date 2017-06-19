import { div } from 'snabbdom-helpers';

const paginationView = state =>
  div({
    selector: `.load-button${state.get('hasMore') ? "" : ' .disabled'}`,
    inner: ["Load More Followers"],
    data: {
      nextPage: state.get('nextPage'),
    },
    on: () => location.assign(state.get('link'))
  })

export default paginationView
