import 'bootstrap';
import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import './styles/main.css';
import resources from './locales/index.js';
import watch from './view.js';
import getParsedRSS from './rssParser.js';

const buildProxiedUrl = (url) => {
  const proxiedUrl = new URL('https://allorigins.hexlet.app/get');
  proxiedUrl.searchParams.set('disableCache', 'true');
  proxiedUrl.searchParams.set('url', url);
  return proxiedUrl;
};

const getDownloadedRss = (url) => axios.get(buildProxiedUrl(url));

const runApp = () => {
  const defaultLanguage = 'ru';

  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: defaultLanguage,
    debug: false,
    resources,
  });

  const initialState = {
    form: {
      processState: 'filling', // filling, sending, added, error
      errors: '',
    },
    feeds: [],
    posts: [],
    visitedPostsId: new Set(),
    currentPostId: '',
  };

  yup.setLocale({
    string: {
      url: 'notValidUrl',
    },
    mixed: {
      notOneOf: 'notOneOf',
    },
  });

  const input = document.querySelector('#url-input');
  const form = document.querySelector('.rss-form');
  const feedback = document.querySelector('.feedback');
  const submit = document.querySelector('button[type="submit"]');
  const feeds = document.querySelector('.feeds');
  const posts = document.querySelector('.posts');
  const modal = document.querySelector('#modal');

  const elements = {
    input,
    form,
    feedback,
    submit,
    feeds,
    posts,
    modal,
  };

  const watchedState = watch(initialState, elements, i18nextInstance);

  elements.form.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const inputValue = formData.get('url');

    const schema = yup
      .string()
      .required()
      .url()
      .notOneOf(watchedState.feeds.map((feed) => feed.url));

    schema.validate(inputValue)
      .then(() => {
        watchedState.form.errors = '';
        watchedState.form.processState = 'sending';
        return getDownloadedRss(inputValue);
      })
      .then((response) => {
        const parsedContent = getParsedRSS(response.data.contents, inputValue);
        watchedState.feeds.unshift(parsedContent.feed);
        watchedState.posts = parsedContent.posts.concat(watchedState.posts);
        watchedState.form.errors = '';
        watchedState.form.processState = 'added';
      })
      .catch((err) => {
        watchedState.form.processState = 'error';
        if (err.isAxiosError) {
          watchedState.form.errors = 'network';
        } else if (err.isParsingError) {
          watchedState.form.errors = 'notValidRss';
        } else if (err.name === 'ValidationError') {
          watchedState.form.errors = err.message;
        } else {
          watchedState.form.errors = 'unknown';
        }
      });
  });

  elements.posts.addEventListener('click', (event) => {
    const currentId = event.target.dataset.id;
    watchedState.visitedPostsId.add(currentId);
    watchedState.currentPostId = currentId;
  });

  const updateRssPosts = () => {
    const urls = watchedState.feeds.map((feed) => feed.url);
    const promises = urls
      .map((url) => getDownloadedRss(url)
        .then((updatedResponse) => {
          const updatedParsedContent = getParsedRSS(updatedResponse.data.contents);
          const { posts: newPosts } = updatedParsedContent;
          const addedPostsLinks = watchedState.posts.map((post) => post.link);
          const addedNewPosts = newPosts.filter((post) => !addedPostsLinks.includes(post.link));
          watchedState.posts = addedNewPosts.concat(watchedState.posts);
        })
        .catch((err) => {
          throw err;
        }));
    Promise.all(promises)
      .finally(() => setTimeout(() => updateRssPosts(), 5000));
  };
  updateRssPosts();
};

export default runApp;
