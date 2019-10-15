import FilmPreview from './FilmPreview';
import ListPagination from './ListPagination';
import LoadingSpinner from './LoadingSpinner';
import React from 'react';

const FilmList = props => {
  if (props.loading && props.articles.length === 0) {
    return (
      <LoadingSpinner />
    );
  }

  if (props.articles.length === 0) {
    return (
      <div className="article-preview">
        No articles are here... yet.
      </div>
    );
  }

  return (
    <div>
      {
        props.articles.map(article => {
          return (
            <FilmPreview article={article} key={article.slug} />
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
