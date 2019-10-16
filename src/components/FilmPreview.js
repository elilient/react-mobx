import React from 'react';
import { Link } from 'react-router-dom';
import { inject, observer } from 'mobx-react';

const FAVORITED_CLASS = 'btn btn-sm btn-primary';
const NOT_FAVORITED_CLASS = 'btn btn-sm btn-outline-primary';


@inject('filmsStore')
@observer
export default class FilmPreview extends React.Component {

  handleClickFavorite = ev => {
    ev.preventDefault();
    const { filmsStore, film } = this.props;
    if (film.favorited) {
      filmsStore.unmakeFavorite(film.slug);
    } else {
      filmsStore.makeFavorite(film.slug);
    }
  };

  render() {
    const { film } = this.props;
    const favoriteButtonClass = film.favorited ? FAVORITED_CLASS : NOT_FAVORITED_CLASS;

    return (
      <div className="film-preview">
        <div className="film-meta">
          <Link to={`/@${film.author.username}`}>
            <img src={film.author.image} alt="" />
          </Link>

          <div className="info">
            <Link className="author" to={`/@${film.author.username}`}>
              {film.author.username}
            </Link>
            <span className="date">
            {new Date(film.createdAt).toDateString()}
          </span>
          </div>

          <div className="pull-xs-right">
            <button className={favoriteButtonClass} onClick={this.handleClickFavorite}>
              <i className="ion-heart" /> {film.favoritesCount}
            </button>
          </div>
        </div>

        <Link to={`/film/${film.slug}`} className="preview-link">
          <h1>{film.title}</h1>
          <p>{film.description}</p>
          <span>Read more...</span>
          <ul className="tag-list">
            {
              film.tagList.map(tag => {
                return (
                  <li className="tag-default tag-pill tag-outline" key={tag}>
                    {tag}
                  </li>
                )
              })
            }
          </ul>
        </Link>
      </div>
    );
  }
}
