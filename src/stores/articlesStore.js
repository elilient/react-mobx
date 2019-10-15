import { observable, action, computed } from 'mobx';
import agent from '../agent';

const LIMIT = 10;

export class FilmsStore {

  @observable isLoading = false;
  @observable page = 0;
  @observable totalPagesCount = 0;
  @observable articlesRegistry = observable.map();
  @observable predicate = {};

  @computed get articles() {
    return this.articlesRegistry.values();
  };

  clear() {
    this.articlesRegistry.clear();
    this.page = 0;
  }

  getFilm(slug) {
    return this.articlesRegistry.get(slug);
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
      .then(action(({ articles, articlesCount }) => {
        this.articlesRegistry.clear();
        articles.forEach(article => this.articlesRegistry.set(article.slug, article));
        this.totalPagesCount = Math.ceil(articlesCount / LIMIT);
      }))
      .finally(action(() => { this.isLoading = false; }));
  }

  @action loadFilm(slug, { acceptCached = false } = {}) {
    if (acceptCached) {
      const article = this.getFilm(slug);
      if (article) return Promise.resolve(article);
    }
    this.isLoading = true;
    return agent.Films.get(slug)
      .then(action(({ article }) => {
        this.articlesRegistry.set(article.slug, article);
        return article;
      }))
      .finally(action(() => { this.isLoading = false; }));
  }

  @action makeFavorite(slug) {
    const article = this.getFilm(slug);
    if (article && !article.favorited) {
      article.favorited = true;
      article.favoritesCount++;
      return agent.Films.favorite(slug)
        .catch(action(err => {
          article.favorited = false;
          article.favoritesCount--;
          throw err;
        }));
    }
    return Promise.resolve();
  }

  @action unmakeFavorite(slug) {
    const article = this.getFilm(slug);
    if (article && article.favorited) {
      article.favorited = false;
      article.favoritesCount--;
      return agent.Films.unfavorite(slug)
        .catch(action(err => {
          article.favorited = true;
          article.favoritesCount++;
          throw err;
        }));
    }
    return Promise.resolve();
  }

  @action createFilm(article) {
    return agent.Films.create(article)
      .then(({ article }) => {
        this.articlesRegistry.set(article.slug, article);
        return article;
      })
  }

  @action updateFilm(data) {
    return agent.Films.update(data)
      .then(({ article }) => {
        this.articlesRegistry.set(article.slug, article);
        return article;
      })
  }

  @action deleteFilm(slug) {
    this.articlesRegistry.delete(slug);
    return agent.Films.del(slug)
      .catch(action(err => { this.loadFilms(); throw err; }));
  }
}

export default new FilmsStore();
