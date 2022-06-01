import onChange from 'on-change';
import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import resources from './locales/index.js';
import render from './view.js';
import getParsedRSS from './rssParser.js';

const runApp = () => {
  const defaultLanguage = 'ru';

  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: defaultLanguage,
    debug: false,
    resources,
  });

  const s = {
    form: {
      processState: 'filling', // filling, sending, added, error
      errors: '',
      urls: [],
    },
    feeds: [],
    posts: [],
    visitedPostsId: new Set(), // https://ru.hexlet.io/courses/js_collections/lessons/set/theory_unit
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
  const modalTitle = document.querySelector('.modal-title');
  const modalBody = document.querySelector('.modal-body');
  const modalA = document.querySelector('.full-article');

  const elements = {
    input,
    form,
    feedback,
    submit,
    feeds,
    posts,
    modalTitle,
    modalBody,
    modalA,
  };

  const state = onChange(s, render(s, elements, i18nextInstance));

  elements.form.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const inputValue = formData.get('url');

    const schema = yup
      .string()
      .required()
      .url()
      .notOneOf(state.form.urls);

    schema.validate(inputValue)
      .then(() => {
        state.form.errors = '';
        state.form.processState = 'sending';
        return axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(inputValue)}`);
      })
      .then((response) => getParsedRSS(response.data.contents))
      .then((parsedContent) => {
        state.form.urls.unshift(inputValue);
        state.feeds.unshift(parsedContent.feed);
        state.posts = parsedContent.posts.concat(state.posts);
        state.form.errors = '';
        state.form.processState = 'added';
      })
      .catch((err) => {
        state.form.processState = 'error';
        if (err.name === 'AxiosError') {
          state.form.errors = 'network';
        } else {
          state.form.errors = err.message;
        }
      });
  });

  elements.posts.addEventListener('click', (event) => {
    const currentId = event.target.dataset.id;
    state.visitedPostsId.add(currentId);
    state.currentPostId = currentId;
  });

  // https://ru.hexlet.io/challenges/js_dom_progress_exercise (запуск setTimeout по кругу)
  // https://ru.hexlet.io/courses/js-asynchronous-programming/lessons/promise-all/theory_unit
  /* Фиды нужно преобразовать в промисы и отправить массив промисов в Promise.all,
  после него вставить блок finally и запустить процесс по кругу */
  const updateRssPosts = () => {
    const promises = state.form.urls
      .map((url) => axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
        .then((updatedResponse) => getParsedRSS(updatedResponse.data.contents))
        .then((updatedParsedContent) => {
          const { posts: newPosts } = updatedParsedContent;
          const addedPostsLinks = state.posts.map((post) => post.link);
          const addedNewPosts = newPosts.filter((post) => !addedPostsLinks.includes(post.link));
          state.posts = addedNewPosts.concat(state.posts);
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
