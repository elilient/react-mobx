import { observable, action } from 'mobx';
import filmsStore from './filmsStore';

class EditorStore {

  @observable inProgress = false;
  @observable errors = undefined;
  @observable filmSlug = undefined;

  @observable title = '';
  @observable description = '';
  @observable body = '';
  @observable tagList = [];

  @action setFilmSlug(filmSlug) {
    if (this.filmSlug !== filmSlug) {
      this.reset();
      this.filmSlug = filmSlug;
    }
  }

  @action loadInitialData() {
    if (!this.filmSlug) return Promise.resolve();
    this.inProgress = true;
    return filmsStore.loadFilm(this.filmSlug, { acceptCached: true })
      .then(action((film) => {
        if (!film) throw new Error('Can\'t load original film');
        this.title = film.title;
        this.description = film.description;
        this.body = film.body;
        this.tagList = film.tagList;
      }))
      .finally(action(() => { this.inProgress = false; }));
  }

  @action reset() {
    this.title = '';
    this.description = '';
    this.body = '';
    this.tagList = [];
  }

  @action setTitle(title) {
    this.title = title;
  }

  @action setDescription(description) {
    this.description = description;
  }

  @action setBody(body) {
    this.body = body;
  }

  @action addTag(tag) {
    if (this.tagList.includes(tag)) return;
    this.tagList.push(tag);
  }

  @action removeTag(tag) {
    this.tagList = this.tagList.filter(t => t !== tag);
  }

  @action submit() {
    this.inProgress = true;
    this.errors = undefined;
    const film = {
      title: this.title,
      description: this.description,
      body: this.body,
      tagList: this.tagList,
      slug: this.filmSlug,
    };
    return (this.filmSlug ? filmsStore.updateFilm(film) : filmsStore.createFilm(film))
      .catch(action((err) => {
        this.errors = err.response && err.response.body && err.response.body.errors; throw err;
      }))
      .finally(action(() => { this.inProgress = false; }));
  }
}

export default new EditorStore();
