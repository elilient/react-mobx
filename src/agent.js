import superagentPromise from 'superagent-promise';
import _superagent from 'superagent';
import commonStore from './stores/commonStore';
import authStore from './stores/authStore';

const superagent = superagentPromise(_superagent, global.Promise);

const API_ROOT = 'http://localhost:3000/api';

const encode = encodeURIComponent;

const handleErrors = err => {
  if (err && err.response && err.response.status === 401) {
    authStore.logout();
  }
  return err;
};

const responseBody = res => res.body;

const tokenPlugin = req => {
  if (commonStore.token) {
    req.set('authorization', `Token ${commonStore.token}`);
  }
};

const requests = {
  del: url =>
    superagent
      .del(`${API_ROOT}${url}`)
      .use(tokenPlugin)
      .end(handleErrors)
      .then(responseBody),
  get: url =>
    superagent
      .get(`${API_ROOT}${url}`)
      .use(tokenPlugin)
      .end(handleErrors)
      .then(responseBody),
  put: (url, body) =>
    superagent
      .put(`${API_ROOT}${url}`, body)
      .use(tokenPlugin)
      .end(handleErrors)
      .then(responseBody),
  post: (url, body) =>
    superagent
      .post(`${API_ROOT}${url}`, body)
      .use(tokenPlugin)
      .end(handleErrors)
      .then(responseBody),
};

const Auth = {
  current: () =>
    requests.get('/user'),
  login: (email, password) =>
    requests.post('/users/login', { user: { email, password } }),
  register: (username, email, password) =>
    requests.post('/users', { user: { username, email, password } }),
  save: user =>
    requests.put('/user', { user })
};

const Tags = {
  getAll: () => requests.get('/tags')
};

const limit = (count, p) => `limit=${count}&offset=${p ? p * count : 0}`;
const omitSlug = film => Object.assign({}, film, { slug: undefined })

const Films = {
  all: (page, lim = 10) =>
    requests.get(`/films?${limit(lim, page)}`),
  byAuthor: (author, page, query) =>
    requests.get(`/films?author=${encode(author)}&${limit(5, page)}`),
  byTag: (tag, page, lim = 10) =>
    requests.get(`/films?tag=${encode(tag)}&${limit(lim, page)}`),
  del: slug =>
    requests.del(`/films/${slug}`),
  favorite: slug =>
    requests.post(`/films/${slug}/favorite`),
  favoritedBy: (author, page) =>
    requests.get(`/films?favorited=${encode(author)}&${limit(5, page)}`),
  feed: () =>
    requests.get('/films/feed?limit=10&offset=0'),
  get: slug =>
    requests.get(`/films/${slug}`),
  unfavorite: slug =>
    requests.del(`/films/${slug}/favorite`),
  update: film =>
    requests.put(`/films/${film.slug}`, { film: omitSlug(film) }),
  create: film =>
    requests.post('/films', { film })
};

const Comments = {
  create: (slug, comment) =>
    requests.post(`/films/${slug}/comments`, { comment }),
  delete: (slug, commentId) =>
    requests.del(`/films/${slug}/comments/${commentId}`),
  forFilm: slug =>
    requests.get(`/films/${slug}/comments`)
};

const Profile = {
  follow: username =>
    requests.post(`/profiles/${username}/follow`),
  get: username =>
    requests.get(`/profiles/${username}`),
  unfollow: username =>
    requests.del(`/profiles/${username}/follow`)
};

export default {
  Films,
  Auth,
  Comments,
  Profile,
  Tags,
};
