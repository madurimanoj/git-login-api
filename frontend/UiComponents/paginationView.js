import { div } from 'snabbdom-helpers';
const paginationView = state =>
  div({
    selector: `.load-button${state.get('hasMore') ? "" : ' .disabled'}`,
    on: { click: () => $('.load-more')[0].click() },
    style: { opacity: '1', transition: 'opacity 1s', update: { opacity: 0 } },
    inner: ["Load More Followers"],
    data: {
      nextPage: state.get('nextPage'),
    },
  })

export default paginationView
