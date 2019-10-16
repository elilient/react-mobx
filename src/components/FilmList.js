import FilmPreview from './FilmPreview';
import ListPagination from './ListPagination';
import LoadingSpinner from './LoadingSpinner';
import React from 'react';


const FilmList = props => {

  if (props.loading && props.films.length === 0) {
    return (
      <LoadingSpinner />
    );
  }

  if (props.films.length === 0) {
    return (
      <div className="film-preview">
        No films are here... yet.
      </div>
    );
  }

  return (
    <div>
      {
        props.films.map(film => {
          return (
            <FilmPreview film={film} key={film.slug} />
          );
        })
      }

      <ListPagination
        onSetPage={props.onSetPage}
        totalPagesCount={props.totalPagesCount}
        currentPage={props.currentPage}
      />
    </div>
  );
};

export default FilmList;
