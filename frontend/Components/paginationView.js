import { div } from 'snabbdom-helpers';
const paginationView = (state, broadcast) => {
return  div({
    selector: `.load-button${state.get('hasMore') ? "" : ' .disabled'}`,
    on: { click: () => broadcast(state.get('nextPage')) },
    style: { opacity: '.7', transition: 'all .5s', update: { opacity: 0 } },
    inner: ["Load More Followers"],
    data: {
      nextPage: state.get('nextPage'),
    },
  })
}

export default paginationView
