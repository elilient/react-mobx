import FilmMeta from './FilmMeta';
import CommentContainer from './CommentContainer';
import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import RedError from '../RedError';
import marked from 'marked';


@inject('filmsStore', 'userStore', 'commentsStore')
@withRouter
@observer
export default class Film extends React.Component {
  componentDidMount() {
    const slug = this.props.match.params.id;
    this.props.filmsStore.loadFilm(slug, { acceptCached: true });
    this.props.commentsStore.setFilmSlug(slug);
    this.props.commentsStore.loadComments();
  }

  handleDeleteFilm = slug => {
    this.props.filmsStore.deleteFilm(slug)
      .then(() => this.props.history.replace('/'));
  };

  handleDeleteComment = id => {
    this.props.commentsStore.deleteComment(id);
  };

  render() {
    const slug = this.props.match.params.id;
    const { currentUser } = this.props.userStore;
    const { comments, commentErrors } = this.props.commentsStore;
    const film = this.props.filmsStore.getFilm(slug);

    if (!film) return <RedError message="Can't load film" />;

    const markup = { __html: marked(film.body, { sanitize: true }) };
    const canModify = currentUser && currentUser.username === film.author.username;
    return (
      <div className="film-page">

        <div className="banner">
          <div className="container">

            <h1>{film.title}</h1>
            <FilmMeta
              film={film}
              canModify={canModify}
              onDelete={this.handleDeleteFilm}
            />
          </div>
        </div>

        <div className="container page">

          <div className="row film-content">
            <div className="col-xs-12">

              <div dangerouslySetInnerHTML={markup} />

              <ul className="tag-list">
                {
                  film.tagList.map(tag => {
                    return (
                      <li
                        className="tag-default tag-pill tag-outline"
                        key={tag}
                      >
                        {tag}
                      </li>
                    );
                  })
                }
              </ul>

            </div>
          </div>

          <hr />

          <div className="film-actions" />

          <div className="row">
            <CommentContainer
              comments={comments}
              errors={commentErrors}
              slug={slug}
              currentUser={currentUser}
              onDelete={this.handleDeleteComment}
            />
          </div>
        </div>
      </div>
    );
  }
}
