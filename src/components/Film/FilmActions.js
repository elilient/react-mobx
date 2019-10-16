import { Link } from 'react-router-dom';
import React from 'react';

const FilmActions = props => {
  const film = props.film;
  const handleDelete = () => props.onDelete(film.slug);

  if (props.canModify) {
    return (
      <span>

        <Link
          to={`/editor/${film.slug}`}
          className="btn btn-outline-secondary btn-sm"
        >
          <i className="ion-edit" /> Edit Film
        </Link>

        <button className="btn btn-outline-danger btn-sm" onClick={handleDelete}>
          <i className="ion-trash-a" /> Delete Film
        </button>

      </span>
    );
  }

  return (
    <span />
  );
};

export default FilmActions;
