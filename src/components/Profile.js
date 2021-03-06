import FilmList from './FilmList';
import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import RedError from './RedError';
import { NavLink, Link, withRouter } from 'react-router-dom';
import { inject, observer } from 'mobx-react';

const EditProfileSettings = props => {
  if (props.isUser) {
    return (
      <Link
        to="/settings"
        className="btn btn-sm btn-outline-secondary action-btn">
        <i className="ion-gear-a" /> Edit Profile Settings
      </Link>
    );
  }
  return null;
};

const FollowUserButton = props => {
  if (props.isUser) {
    return null;
  }

  let classes = 'btn btn-sm action-btn';
  if (props.following) {
    classes += ' btn-secondary';
  } else {
    classes += ' btn-outline-secondary';
  }

  const handleClick = ev => {
    ev.preventDefault();
    if (props.following) {
      props.unfollow(props.username)
    } else {
      props.follow(props.username)
    }
  };

  return (
    <button
      className={classes}
      onClick={handleClick}
    >
      <i className="ion-plus-round" />
      &nbsp;
      {props.following ? 'Unfollow' : 'Follow'} {props.username}
    </button>
  );
};


@inject('filmsStore', 'profileStore', 'userStore')
@withRouter
@observer
export default class Profile extends React.Component {
  componentWillMount() {
    this.props.filmsStore.setPredicate(this.getPredicate());
  }

  componentDidMount() {
    this.props.profileStore.loadProfile(this.props.match.params.username);
    this.props.filmsStore.loadFilms();
  }

  componentDidUpdate(previousProps) {
    if (this.props.location !== previousProps.location) {
      this.props.profileStore.loadProfile(this.props.match.params.username);
      this.props.filmsStore.setPredicate(this.getPredicate());
      this.props.filmsStore.loadFilms();
    }
  }

  getTab() {
    if (/\/favorites/.test(this.props.location.pathname)) return 'favorites';
    return 'all'
  }

  getPredicate() {
    switch (this.getTab()) {
      case 'favorites': return { favoritedBy: this.props.match.params.username }
      default: return { author: this.props.match.params.username }
    }
  }

  handleFollow = () => this.props.profileStore.follow();
  handleUnfollow = () => this.props.profileStore.unfollow();

  handleSetPage = page => {
    this.props.filmsStore.setPage(page);
    this.props.filmsStore.loadFilms();
  };

  renderTabs() {
    const { profile } = this.props.profileStore;
    return (
      <ul className="nav nav-pills outline-active">
        <li className="nav-item">
          <NavLink
            className="nav-link"
            isActive={
              (match, location) => {
                return location.pathname.match("/favorites") ? 0 : 1;
              }
            }
            to={`/@${profile.username}`}
          >
            My Films
          </NavLink>
        </li>

        <li className="nav-item">
          <NavLink
            className="nav-link"
            to={`/@${profile.username}/favorites`}
          >
            Favorited Films
          </NavLink>
        </li>
      </ul>
    );
  }

  render() {
    const { profileStore, filmsStore, userStore } = this.props;
    const { profile, isLoadingProfile } = profileStore;
    const { currentUser } = userStore;

    if (isLoadingProfile && !profile) return <LoadingSpinner />;
    if (!profile) return <RedError message="Can't load profile" />;

    const isUser = currentUser && profile.username === currentUser.username;

    return (
      <div className="profile-page">

        <div className="user-info">
          <div className="container">
            <div className="row">
              <div className="col-xs-12 col-md-10 offset-md-1">

                <img src={profile.image} className="user-img" alt="" />
                <h4>{profile.username}</h4>
                <p>{profile.bio}</p>

                <EditProfileSettings isUser={isUser} />
                <FollowUserButton
                  isUser={isUser}
                  username={profile.username}
                  following={profile.following}
                  follow={this.handleFollow}
                  unfollow={this.handleUnfollow}
                />

              </div>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="row">

            <div className="col-xs-12 col-md-10 offset-md-1">

              <div className="films-toggle">
                {this.renderTabs()}
              </div>

              <FilmList
                films={filmsStore.films}
                totalPagesCount={filmsStore.totalPagesCount}
                onSetPage={this.handleSetPage}
                loading={filmsStore.isLoading}
              />
            </div>

          </div>
        </div>

      </div>
    );
  }
}

export { Profile };
