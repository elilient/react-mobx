import { observable, action, computed } from 'mobx';
import agent from '../agent';

const LIMIT = 10;

export class FilmsStore {

  @observable isLoading = false;
  @observable page = 0;
  @observable totalPagesCount = 0;
  @observable filmsRegistry = observable.map();
  @observable predicate = {};

  @computed get films() {
    return this.filmsRegistry.values();
  };

  clear() {
    this.filmsRegistry.clear();
    this.page = 0;
  }

  getFilm(slug) {
    return this.filmsRegistry.get(slug);
  }

  @action setPage(page) {
    this.page = page;
  }

  @action setPredicate(predicate) {
    if (JSON.stringify(predicate) === JSON.stringify(this.predicate)) return;
    this.clear();
    this.predicate = predicate;
  }

  $req() {
    if (this.predicate.myFeed) return agent.Films.feed(this.page, LIMIT);
    if (this.predicate.favorites) return agent.Films.favorites(this.page, LIMIT);
    if (this.predicate.favoritedBy) return agent.Films.favoritedBy(this.predicate.favoritedBy, this.page, LIMIT);
    if (this.predicate.tag) return agent.Films.byTag(this.predicate.tag, this.page, LIMIT);
    if (this.predicate.author) return agent.Films.byAuthor(this.predicate.author, this.page, LIMIT);
    return agent.Films.all(this.page, LIMIT, this.predicate);
  }

  @action loadFilms() {
    this.isLoading = true;
    return this.$req()
      .then(action(({ films, filmsCount }) => {
        this.filmsRegistry.clear();
        films.forEach(film => this.filmsRegistry.set(film.slug, film));
        this.totalPagesCount = Math.ceil(filmsCount / LIMIT);
      }))
      .finally(action(() => { this.isLoading = false; }));
  }

  @action loadFilm(slug, { acceptCached = false } = {}) {
    if (acceptCached) {
      const film = this.getFilm(slug);
      if (film) return Promise.resolve(film);
    }
    this.isLoading = true;
    return agent.Films.get(slug)
      .then(action(({ film }) => {
        this.filmsRegistry.set(film.slug, film);
        return film;
      }))
      .finally(action(() => { this.isLoading = false; }));
  }

  @action makeFavorite(slug) {
    const film = this.getFilm(slug);
    if (film && !film.favorited) {
      film.favorited = true;
      film.favoritesCount++;
      return agent.Films.favorite(slug)
        .catch(action(err => {
          film.favorited = false;
          film.favoritesCount--;
          throw err;
        }));
    }
    return Promise.resolve();
  }

  @action unmakeFavorite(slug) {
    const film = this.getFilm(slug);
    if (film && film.favorited) {
      film.favorited = false;
      film.favoritesCount--;
      return agent.Films.unfavorite(slug)
        .catch(action(err => {
          film.favorited = true;
          film.favoritesCount++;
          throw err;
        }));
    }
    return Promise.resolve();
  }

  @action createFilm(film) {
    return agent.Films.create(film)
      .then(({ film }) => {
        this.filmsRegistry.set(film.slug, film);
        return film;
      })
  }

  @action updateFilm(data) {
    return agent.Films.update(data)
      .then(({ film }) => {
        this.filmsRegistry.set(film.slug, film);
        return film;
      })
  }

  @action deleteFilm(slug) {
    this.filmsRegistry.delete(slug);
    return agent.Films.del(slug)
      .catch(action(err => { this.loadFilms(); throw err; }));
  }
}

export default new FilmsStore();
