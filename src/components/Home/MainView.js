import FilmList from '../FilmList';
import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter, NavLink } from 'react-router-dom'
import { parse as qsParse } from 'query-string';


const GlobalFeedTab = props => {
  return (
    <li className="nav-item">
      <NavLink
        className="nav-link"
        isActive={
          (match, location) => {
            return !location.search.match(/tab=(feed|tag)/) ? 1 : 0;
          }
        }
        to={{
          pathname: "/",
          search: "?tab=all"
        }}
      >
        Global Feed
      </NavLink>
    </li>
  );
};

const TagFilterTab = props => {
  if (!props.tag) {
    return null;
  }

  return (
    <li className="nav-item">
      <a href="" className="nav-link active">
        <i className="ion-pound" /> {props.tag}
      </a>
    </li>
  );
};

@inject('filmsStore', 'commonStore', 'userStore')
@withRouter
@observer
export default class MainView extends React.Component {

  componentWillMount() {
    this.props.filmsStore.setPredicate(this.getPredicate());
  }


  componentDidMount() {
    this.props.filmsStore.loadFilms();
  }

  componentDidUpdate(previousProps) {
    const filmslist = JSON.parse(localStorage.getItem('filmslist'))
    if (
        filmslist && filmslist.length !== this.props.filmsStore.films.length
    ) {
      localStorage.setItem('filmslist', JSON.stringify(this.props.filmsStore.films))
    }
  }

  getTag(props = this.props) {
    return qsParse(props.location.search).tag || "";
  }

  getTab(props = this.props) {
    return qsParse(props.location.search).tab || 'all';
  }

  getPredicate(props = this.props) {
    switch (this.getTab(props)) {
      case 'feed': return { myFeed: true };
      case 'tag': return { tag: qsParse(props.location.search).tag };
      default: return {};
    }
  }

  handleTabChange = (tab) => {
    if (this.props.location.query.tab === tab) return;
    this.props.router.push({ ...this.props.location, query: { tab } })
  };

  handleSetPage = page => {
    this.props.filmsStore.setPage(page);
    this.props.filmsStore.loadFilms();
  };

  render() {
    const { currentUser } = this.props.userStore;
    const { films, isLoading, page, totalPagesCount } = this.props.filmsStore;


    return (
      <div className="col-md-9">
        <div className="feed-toggle">
          <ul className="nav nav-pills outline-active">
            <GlobalFeedTab
              tab={this.getTab()}
            />

            <TagFilterTab tag={qsParse(this.props.location.search).tag} />

          </ul>
        </div>

        <FilmList
          films={films}
          loading={isLoading}
          totalPagesCount={totalPagesCount}
          currentPage={page}
          onSetPage={this.handleSetPage}
        />
      </div>
    );
  }
};
