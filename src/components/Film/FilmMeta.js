import FilmActions from './FilmActions';
import { Link } from 'react-router-dom';
import React from 'react';
import { observer } from 'mobx-react';

const FilmMeta = observer(props => {
  const film = props.film;
  return (
    <div className="film-meta">
      <Link to={`/@${film.author.username}`}>
        <img src={film.author.image} alt="" />
      </Link>

      <div className="info">
        <Link to={`/@${film.author.username}`} className="author">
          {film.author.username}
        </Link>
        <span className="date">
          {new Date(film.createdAt).toDateString()}
        </span>
      </div>

      <FilmActions canModify={props.canModify} film={film} onDelete={props.onDelete} />
    </div>
  );
});

export default FilmMeta;
