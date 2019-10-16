import { observable, action } from 'mobx';
import agent from '../agent';

export class CommentsStore {

  @observable isCreatingComment = false;
  @observable isLoadingComments = false;
  @observable commentErrors = undefined;
  @observable filmSlug = undefined;
  @observable comments = [];

  @action setFilmSlug(filmSlug) {
    if (this.filmSlug !== filmSlug) {
      this.comments = [];
      this.filmSlug = filmSlug;
    }
  }

  @action loadComments() {
    this.isLoadingComments = true;
    this.commentErrors = undefined;
    return agent.Comments.forFilm(this.filmSlug)
      .then(action(({ comments }) => { this.comments = comments; }))
      .catch(action(err => {
        this.commentErrors = err.response && err.response.body && err.response.body.errors;
        throw err;
      }))
      .finally(action(() => { this.isLoadingComments = false; }));
  }


  @action createComment(comment) {
    this.isCreatingComment = true;
    return agent.Comments.create(this.filmSlug, comment)
      .then(() => this.loadComments())
      .finally(action(() => { this.isCreatingComment = false; }));
  }

  @action deleteComment(id) {
    const idx = this.comments.findIndex(c => c.id === id);
    if (idx > -1) this.comments.splice(idx, 1);
    return agent.Comments.delete(this.filmSlug, id)
      .catch(action(err => { this.loadComments(); throw err }));
  }
}

export default new CommentsStore();
