import { Link } from 'react-router-dom';
import React from 'react';

const FilmActions = props => {
  const article = props.article;
  const handleDelete = () => props.onDelete(article.slug);

  if (props.canModify) {
    return (
      <span>

        <Link
          to={`/editor/${article.slug}`}
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
